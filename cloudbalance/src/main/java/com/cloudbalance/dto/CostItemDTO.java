package com.cloudbalance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CostItemDTO {
    private Integer linkedAccountId;
    private Integer startDay;
    private Integer startMonth;
    private Integer startYear;
    private String operation;
    private String usageType;
    private String instanceType;
    private String operatingSystem;
    private String pricingType;
    private String regionName;
    private LocalDate usageStartDate;
    private String databaseEngine;
    private String productName;
    private BigDecimal unblendedCost;
    private BigDecimal usageAmount;
    private String usageGroupType;
    private String pricingUnit;
    private String chargeType;
    private String availabilityZone;
    private String tenancy;

    // Constructors, getters, and setters
    // ...
}