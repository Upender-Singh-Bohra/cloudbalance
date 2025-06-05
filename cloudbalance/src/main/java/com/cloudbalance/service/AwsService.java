package com.cloudbalance.service;

import com.cloudbalance.dto.EC2InstanceDTO;
import com.cloudbalance.dto.RDSInstanceDTO;
import com.cloudbalance.dto.AutoScalingGroupDTO;

import java.util.List;

public interface AwsService {
    List<EC2InstanceDTO> getEC2Instances(Long cloudAccountId);
    List<RDSInstanceDTO> getRDSInstances(Long cloudAccountId);
    List<AutoScalingGroupDTO> getAutoScalingGroups(Long cloudAccountId);
}