
package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutoScalingGroupDTO {
    private String resourceId;
    private String resourceName;
    private String region;
    private Integer desiredCapacity;
    private Integer minSize;
    private Integer maxSize;
    private String status;
}