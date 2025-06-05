package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostExplorerResponseDTO {
    private List<String> timeUnits;
    private List<CostGroupDTO> groups;
    private Map<String, BigDecimal> totals;
    private int totalRecords;
}