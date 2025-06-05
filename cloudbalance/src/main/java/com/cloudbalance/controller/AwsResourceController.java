
package com.cloudbalance.controller;

import com.cloudbalance.dto.EC2InstanceDTO;
import com.cloudbalance.dto.RDSInstanceDTO;
import com.cloudbalance.dto.AutoScalingGroupDTO;
import com.cloudbalance.dto.ResponseDTO;
import com.cloudbalance.service.AwsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aws-services")
public class AwsResourceController {

    @Autowired
    private AwsService awsService;

    @GetMapping("/ec2/{accountId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READ_ONLY', 'CUSTOMER')")
    public ResponseEntity<ResponseDTO<List<EC2InstanceDTO>>> getEC2Instances(@PathVariable Long accountId) {
        List<EC2InstanceDTO> instances = awsService.getEC2Instances(accountId);

        ResponseDTO<List<EC2InstanceDTO>> response = new ResponseDTO<>();
        response.setData(instances);
        response.setSuccess(true);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/rds/{accountId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READ_ONLY', 'CUSTOMER')")
    public ResponseEntity<ResponseDTO<List<RDSInstanceDTO>>> getRDSInstances(@PathVariable Long accountId) {
        List<RDSInstanceDTO> instances = awsService.getRDSInstances(accountId);

        ResponseDTO<List<RDSInstanceDTO>> response = new ResponseDTO<>();
        response.setData(instances);
        response.setSuccess(true);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/asg/{accountId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READ_ONLY', 'CUSTOMER')")
    public ResponseEntity<ResponseDTO<List<AutoScalingGroupDTO>>> getAutoScalingGroups(@PathVariable Long accountId) {
        List<AutoScalingGroupDTO> groups = awsService.getAutoScalingGroups(accountId);

        ResponseDTO<List<AutoScalingGroupDTO>> response = new ResponseDTO<>();
        response.setData(groups);
        response.setSuccess(true);

        return ResponseEntity.ok(response);
    }
}