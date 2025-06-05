package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostGroupDTO {
    private String key;
    private Map<String, BigDecimal> values;
    private BigDecimal total;
}