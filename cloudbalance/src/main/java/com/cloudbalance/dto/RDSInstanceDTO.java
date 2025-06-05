// RDSInstanceDTO.java
package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RDSInstanceDTO {
    private String resourceId;
    private String resourceName;
    private String region;
    private String engine;
    private String status;
}