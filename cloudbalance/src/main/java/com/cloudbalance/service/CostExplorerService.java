// CostExplorerService.java
package com.cloudbalance.service;

import com.cloudbalance.dto.CostExplorerFilterDTO;
import com.cloudbalance.dto.CostExplorerResponseDTO;

import java.util.List;

public interface CostExplorerService {
    CostExplorerResponseDTO getCostData(CostExplorerFilterDTO filter, Long userId);
    List<String> getDistinctValuesForField(String field);
    List<String> getAccountsForUser(Long userId);
}