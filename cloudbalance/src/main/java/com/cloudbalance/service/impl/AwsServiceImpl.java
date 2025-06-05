

package com.cloudbalance.service.impl;

import com.cloudbalance.config.AwsConfig;
import com.cloudbalance.dto.EC2InstanceDTO;
import com.cloudbalance.dto.RDSInstanceDTO;
import com.cloudbalance.dto.AutoScalingGroupDTO;
import com.cloudbalance.exception.AwsServiceException;
import com.cloudbalance.exception.ForbiddenException;
import com.cloudbalance.exception.ResourceNotFoundException;
import com.cloudbalance.model.CloudAccount;
import com.cloudbalance.model.Role;
import com.cloudbalance.model.User;
import com.cloudbalance.repository.CloudAccountRepository;
import com.cloudbalance.repository.UserRepository;
import com.cloudbalance.service.AwsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.DescribeInstancesRequest;
import software.amazon.awssdk.services.ec2.model.DescribeInstancesResponse;
import software.amazon.awssdk.services.ec2.model.Reservation;
import software.amazon.awssdk.services.ec2.model.Instance;
import software.amazon.awssdk.services.rds.RdsClient;
import software.amazon.awssdk.services.rds.model.DescribeDbInstancesRequest;
import software.amazon.awssdk.services.rds.model.DescribeDbInstancesResponse;
import software.amazon.awssdk.services.rds.model.DBInstance;
import software.amazon.awssdk.services.autoscaling.AutoScalingClient;
import software.amazon.awssdk.services.autoscaling.model.DescribeAutoScalingGroupsRequest;
import software.amazon.awssdk.services.autoscaling.model.DescribeAutoScalingGroupsResponse;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest;
import software.amazon.awssdk.services.sts.model.AssumeRoleResponse;
import software.amazon.awssdk.services.sts.model.Credentials;

import java.util.ArrayList;
import java.util.List;

@Service
public class AwsServiceImpl implements AwsService {

    @Autowired
    private AwsConfig awsConfig;

    @Autowired
    private CloudAccountRepository cloudAccountRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Checks if the current user has access to the specified cloud account.
     * Admin and Read-Only users have access to all accounts.
     * Customer users only have access to accounts assigned to them.
     *
     * @param cloudAccountId the ID of the cloud account to check access for
     * @throws ForbiddenException if the user doesn't have access to the account
     */
    private void checkAccountAccess(Long cloudAccountId) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Get user from repository
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        // Admin and Read-Only users have access to all accounts
        String roleName = user.getRole().getName();
        if (roleName.equals(Role.ROLE_ADMIN) || roleName.equals(Role.ROLE_READ_ONLY)) {
            return; // Allow access
        }

        // Customer users only have access to assigned accounts
        if (roleName.equals(Role.ROLE_CUSTOMER)) {
            boolean hasAccess = user.getAssignedAccounts().stream()
                    .anyMatch(account -> account.getId().equals(cloudAccountId));

            if (!hasAccess) {
                throw new ForbiddenException("You don't have access to cloud account with ID: " + cloudAccountId);
            }
        }
    }

    @Override
    public List<EC2InstanceDTO> getEC2Instances(Long cloudAccountId) {
        // Check if user has access to this account
        checkAccountAccess(cloudAccountId);

        CloudAccount cloudAccount = getCloudAccount(cloudAccountId);

        try {
            // Create EC2 client with account-specific credentials
            Ec2Client ec2Client = createEC2Client(cloudAccount);

            // Fetch EC2 instances from AWS
            DescribeInstancesRequest request = DescribeInstancesRequest.builder().build();
            DescribeInstancesResponse response = ec2Client.describeInstances(request);

            List<EC2InstanceDTO> ec2Instances = new ArrayList<>();

            for (Reservation reservation : response.reservations()) {
                for (Instance instance : reservation.instances()) {
                    String name = instance.tags().stream()
                            .filter(tag -> "Name".equals(tag.key()))
                            .map(tag -> tag.value())
                            .findFirst()
                            .orElse("Unnamed");

                    EC2InstanceDTO dto = EC2InstanceDTO.builder()
                            .resourceId(instance.instanceId())
                            .resourceName(name)
                            .region(cloudAccount.getRegion())
                            .status(instance.state().nameAsString())
                            .build();

                    ec2Instances.add(dto);
                }
            }
            ec2Client.close();

            return ec2Instances;

        } catch (Exception e) {
            throw new AwsServiceException("Unable to retrieve EC2 instances", "EC2", cloudAccount.getAccountId(), e);
        }
    }

    @Override
    public List<RDSInstanceDTO> getRDSInstances(Long cloudAccountId) {
        // Check if user has access to this account
        checkAccountAccess(cloudAccountId);

        CloudAccount cloudAccount = getCloudAccount(cloudAccountId);

        try {
            // Create RDS client with account-specific credentials
            RdsClient rdsClient = createRDSClient(cloudAccount);

            // Fetch RDS instances from AWS
            DescribeDbInstancesRequest request = DescribeDbInstancesRequest.builder().build();
            DescribeDbInstancesResponse response = rdsClient.describeDBInstances(request);

            List<RDSInstanceDTO> rdsInstances = new ArrayList<>();

            for (DBInstance dbInstance : response.dbInstances()) {
                RDSInstanceDTO dto = RDSInstanceDTO.builder()
                        .resourceId(dbInstance.dbInstanceIdentifier())
                        .resourceName(dbInstance.dbName() != null ? dbInstance.dbName() : dbInstance.dbInstanceIdentifier())
                        .region(cloudAccount.getRegion())
                        .engine(dbInstance.engine())
                        .status(dbInstance.dbInstanceStatus())
                        .build();

                rdsInstances.add(dto);
            }

            // Close the client
            rdsClient.close();

            return rdsInstances;

        } catch (Exception e) {
            throw new AwsServiceException("Unable to retrieve RDS instances", "RDS", cloudAccount.getAccountId(), e);
        }
    }

    @Override
    public List<AutoScalingGroupDTO> getAutoScalingGroups(Long cloudAccountId) {
        // Check if user has access to this account
        checkAccountAccess(cloudAccountId);

        CloudAccount cloudAccount = getCloudAccount(cloudAccountId);

        try {
            // Create Auto Scaling client with account-specific credentials
            AutoScalingClient autoScalingClient = createAutoScalingClient(cloudAccount);

            // Fetch Auto Scaling groups from AWS
            DescribeAutoScalingGroupsRequest request = DescribeAutoScalingGroupsRequest.builder().build();
            DescribeAutoScalingGroupsResponse response = autoScalingClient.describeAutoScalingGroups(request);

            List<AutoScalingGroupDTO> asgList = new ArrayList<>();

            for (software.amazon.awssdk.services.autoscaling.model.AutoScalingGroup asg : response.autoScalingGroups()) {
                AutoScalingGroupDTO dto = AutoScalingGroupDTO.builder()
                        .resourceId(asg.autoScalingGroupName())
                        .resourceName(asg.autoScalingGroupName())
                        .region(cloudAccount.getRegion())
                        .desiredCapacity(asg.desiredCapacity())
                        .minSize(asg.minSize())
                        .maxSize(asg.maxSize())
                        .status("Active") // ASGs don't have a status field, hence "Active" as default
                        .build();

                asgList.add(dto);
            }

            // Close the client
            autoScalingClient.close();

            return asgList;

        } catch (Exception e) {
            throw new AwsServiceException("Unable to retrieve Auto Scaling groups", "AutoScaling", cloudAccount.getAccountId(), e);
        }
    }

    private CloudAccount getCloudAccount(Long cloudAccountId) {
        return cloudAccountRepository.findById(cloudAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Cloud Account not found with id: " + cloudAccountId));
    }

    private Ec2Client createEC2Client(CloudAccount cloudAccount) {
        if (cloudAccount.getAccessKey() != null && cloudAccount.getSecretKey() != null) {
            StaticCredentialsProvider credentialsProvider = awsConfig.createCredentialsProvider(
                    cloudAccount.getAccessKey(), cloudAccount.getSecretKey());

            return Ec2Client.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .credentialsProvider(credentialsProvider)
                    .build();
        } else if (cloudAccount.getArn() != null) {
            // Assume role using STS
            StsClient stsClient = StsClient.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .build();

            AssumeRoleRequest assumeRoleRequest = AssumeRoleRequest.builder()
                    .roleArn(cloudAccount.getArn())
                    .roleSessionName("CloudBalanceSession")
                    .build();

            AssumeRoleResponse assumeRoleResponse = stsClient.assumeRole(assumeRoleRequest);
            Credentials credentials = assumeRoleResponse.credentials();

            // Create credentials from the temporary session tokens
            AwsSessionCredentials sessionCredentials = AwsSessionCredentials.create(
                    credentials.accessKeyId(),
                    credentials.secretAccessKey(),
                    credentials.sessionToken());

            StaticCredentialsProvider sessionCredentialsProvider =
                    StaticCredentialsProvider.create(sessionCredentials);

            return Ec2Client.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .credentialsProvider(sessionCredentialsProvider)
                    .build();
        } else {
            return Ec2Client.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .build();
        }
    }

    private RdsClient createRDSClient(CloudAccount cloudAccount) {
        if (cloudAccount.getAccessKey() != null && cloudAccount.getSecretKey() != null) {
            StaticCredentialsProvider credentialsProvider = awsConfig.createCredentialsProvider(
                    cloudAccount.getAccessKey(), cloudAccount.getSecretKey());

            return RdsClient.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .credentialsProvider(credentialsProvider)
                    .build();
        } else if (cloudAccount.getArn() != null) {
            // Assume role using STS
            StsClient stsClient = StsClient.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .build();

            AssumeRoleRequest assumeRoleRequest = AssumeRoleRequest.builder()
                    .roleArn(cloudAccount.getArn())
                    .roleSessionName("CloudBalanceSession")
                    .build();

            AssumeRoleResponse assumeRoleResponse = stsClient.assumeRole(assumeRoleRequest);
            Credentials credentials = assumeRoleResponse.credentials();

            // Create credentials from the temporary session tokens
            AwsSessionCredentials sessionCredentials = AwsSessionCredentials.create(
                    credentials.accessKeyId(),
                    credentials.secretAccessKey(),
                    credentials.sessionToken());

            StaticCredentialsProvider sessionCredentialsProvider =
                    StaticCredentialsProvider.create(sessionCredentials);

            return RdsClient.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .credentialsProvider(sessionCredentialsProvider)
                    .build();
        } else {
            return RdsClient.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .build();
        }
    }

    private AutoScalingClient createAutoScalingClient(CloudAccount cloudAccount) {
        if (cloudAccount.getAccessKey() != null && cloudAccount.getSecretKey() != null) {
            StaticCredentialsProvider credentialsProvider = awsConfig.createCredentialsProvider(
                    cloudAccount.getAccessKey(), cloudAccount.getSecretKey());

            return AutoScalingClient.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .credentialsProvider(credentialsProvider)
                    .build();
        } else if (cloudAccount.getArn() != null) {
            // Assume role using STS
            StsClient stsClient = StsClient.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .build();

            AssumeRoleRequest assumeRoleRequest = AssumeRoleRequest.builder()
                    .roleArn(cloudAccount.getArn())
                    .roleSessionName("CloudBalanceSession")
                    .build();

            AssumeRoleResponse assumeRoleResponse = stsClient.assumeRole(assumeRoleRequest);
            Credentials credentials = assumeRoleResponse.credentials();

            // Create credentials from the temporary session tokens
            AwsSessionCredentials sessionCredentials = AwsSessionCredentials.create(
                    credentials.accessKeyId(),
                    credentials.secretAccessKey(),
                    credentials.sessionToken());

            StaticCredentialsProvider sessionCredentialsProvider =
                    StaticCredentialsProvider.create(sessionCredentials);

            return AutoScalingClient.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .credentialsProvider(sessionCredentialsProvider)
                    .build();
        } else {
            return AutoScalingClient.builder()
                    .region(Region.of(cloudAccount.getRegion()))
                    .build();
        }
    }
}