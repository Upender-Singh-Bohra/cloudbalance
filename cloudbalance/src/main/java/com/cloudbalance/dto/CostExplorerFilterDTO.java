package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostExplorerFilterDTO {
    private List<String> accountIds;
    private String groupBy;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> services;
    private List<String> instanceTypes;
    private List<String> usageTypes;
    private List<String> platforms;
    private List<String> regions;
    private List<String> usageTypeGroups;
    private List<String> purchaseOptions;
    private List<String> apiOperations;
    private List<String> resources;
    private List<String> availabilityZones;
    private List<String> tenancies;
    private List<String> chargeTypes;
}