package com.cloudbalance.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.rds.RdsClient;
import software.amazon.awssdk.services.autoscaling.AutoScalingClient;

@Configuration
public class AwsConfig {

    @Bean
    public Ec2Client defaultEc2Client() {
        return Ec2Client.builder()
                .region(Region.US_EAST_1) // Default region, will be overridden when making calls
                .build();
    }

    @Bean
    public RdsClient defaultRdsClient() {
        return RdsClient.builder()
                .region(Region.US_EAST_1) // Default region, will be overridden when making calls
                .build();
    }

    @Bean
    public AutoScalingClient defaultAutoScalingClient() {
        return AutoScalingClient.builder()
                .region(Region.US_EAST_1) // Default region, will be overridden when making calls
                .build();
    }

    // Helper method to create credentials for a specific AWS account
    public StaticCredentialsProvider createCredentialsProvider(String accessKey, String secretKey) {
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        return StaticCredentialsProvider.create(awsCredentials);
    }
}