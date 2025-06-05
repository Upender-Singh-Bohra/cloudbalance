package com.cloudbalance.service.impl;

import com.cloudbalance.dto.CostExplorerFilterDTO;
import com.cloudbalance.dto.CostExplorerResponseDTO;
import com.cloudbalance.dto.CostGroupDTO;
import com.cloudbalance.model.CloudAccount;
import com.cloudbalance.model.Role;
import com.cloudbalance.model.User;
import com.cloudbalance.repository.CloudAccountRepository;
import com.cloudbalance.repository.CostExplorerRepository;
import com.cloudbalance.repository.UserRepository;
import com.cloudbalance.service.CostExplorerService;
import com.cloudbalance.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CostExplorerServiceImpl implements CostExplorerService {

    private final CostExplorerRepository costExplorerRepository;
    private final CloudAccountRepository cloudAccountRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CostExplorerResponseDTO getCostData(CostExplorerFilterDTO filter, Long userId) {
        // Get user to check role
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdminOrReadOnly = user.getRole().getName().equals(Role.ROLE_ADMIN)
                || user.getRole().getName().equals(Role.ROLE_READ_ONLY);

        // For customer role, filter by assigned accounts
        if (!isAdminOrReadOnly) {
            Set<CloudAccount> userAccounts = cloudAccountRepository.findByUserId(userId);
            List<String> userAccountIds = userAccounts.stream()
                    .map(CloudAccount::getAccountId)
                    .collect(Collectors.toList());

            // If user has no assigned accounts, return empty response
            if (userAccountIds.isEmpty()) {
                return new CostExplorerResponseDTO(); // Return empty response for users with no accounts
            }

            // Always restrict to user's accounts, regardless of whether accountIds filter is provided
            if (filter.getAccountIds() == null || filter.getAccountIds().isEmpty()) {
                // No account filter provided, use all user's accounts
                filter.setAccountIds(userAccountIds);
            } else {
                // Account filter provided, restrict to intersection with user's accounts
                filter.getAccountIds().retainAll(userAccountIds);
                if (filter.getAccountIds().isEmpty()) {
                    return new CostExplorerResponseDTO(); // Return empty response
                }
            }
        }

        // Build SQL query
        String sql = buildCostDataQuery(filter);
        log.debug("Executing SQL query: {}", sql);

        // Execute query
        List<Map<String, Object>> rows = costExplorerRepository.getCostData(sql);

        // Process results
        return processCostData(rows);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctValuesForField(String field) {
        String columnName = getColumnNameForField(field);
        return costExplorerRepository.getDistinctValuesForField(columnName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAccountsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole().getName().equals(Role.ROLE_ADMIN)
                || user.getRole().getName().equals(Role.ROLE_READ_ONLY)) {
            return costExplorerRepository.getAllAccountIds();
        } else {
            Set<CloudAccount> userAccounts = cloudAccountRepository.findByUserId(userId);
            return userAccounts.stream()
                    .map(CloudAccount::getAccountId)
                    .collect(Collectors.toList());
        }
    }

    // Private helper methods
    private String buildCostDataQuery(CostExplorerFilterDTO filter) {
        StringBuilder sqlBuilder = new StringBuilder();

        // Get the appropriate column for grouping
        String groupByColumn = getColumnNameForField(filter.getGroupBy());

        // Base SQL query
        sqlBuilder.append("SELECT ");
        sqlBuilder.append(groupByColumn).append(" AS group_key, ");
        sqlBuilder.append("CONCAT(MYCLOUD_STARTMONTH, '-', MYCLOUD_STARTYEAR) AS time_period, ");
        sqlBuilder.append("SUM(LINEITEM_UNBLENDEDCOST) AS total_cost ");
        sqlBuilder.append("FROM cost_explorer");

        // Build WHERE clause
        List<String> whereConditions = new ArrayList<>();

        // Account filter
        if (filter.getAccountIds() != null && !filter.getAccountIds().isEmpty()) {
            whereConditions.add("CAST(LINKEDACCOUNTID AS VARCHAR) IN (" +
                    filter.getAccountIds().stream()
                            .map(id -> "'" + id + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // Date range filter
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            whereConditions.add("USAGESTARTDATE BETWEEN '" +
                    filter.getStartDate().format(formatter) + "' AND '" +
                    filter.getEndDate().format(formatter) + "'");
        }

        // Service filter
        if (filter.getServices() != null && !filter.getServices().isEmpty()) {
            whereConditions.add("PRODUCT_PRODUCTNAME IN (" +
                    filter.getServices().stream()
                            .map(service -> "'" + service + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // Instance type filter
        if (filter.getInstanceTypes() != null && !filter.getInstanceTypes().isEmpty()) {
            whereConditions.add("MYCLOUD_INSTANCETYPE IN (" +
                    filter.getInstanceTypes().stream()
                            .map(type -> "'" + type + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // Usage type filter
        if (filter.getUsageTypes() != null && !filter.getUsageTypes().isEmpty()) {
            whereConditions.add("LINEITEM_USAGETYPE IN (" +
                    filter.getUsageTypes().stream()
                            .map(type -> "'" + type + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // Platform filter
        if (filter.getPlatforms() != null && !filter.getPlatforms().isEmpty()) {
            whereConditions.add("MYCLOUD_OPERATINGSYSTEM IN (" +
                    filter.getPlatforms().stream()
                            .map(os -> "'" + os + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // Region filter
        if (filter.getRegions() != null && !filter.getRegions().isEmpty()) {
            whereConditions.add("MYCLOUD_REGIONNAME IN (" +
                    filter.getRegions().stream()
                            .map(region -> "'" + region + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // Usage type group filter
        if (filter.getUsageTypeGroups() != null && !filter.getUsageTypeGroups().isEmpty()) {
            whereConditions.add("MYCLOUD_COST_EXPLORER_USAGE_GROUP_TYPE IN (" +
                    filter.getUsageTypeGroups().stream()
                            .map(group -> "'" + group + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // Purchase option filter
        if (filter.getPurchaseOptions() != null && !filter.getPurchaseOptions().isEmpty()) {
            whereConditions.add("MYCLOUD_PRICINGTYPE IN (" +
                    filter.getPurchaseOptions().stream()
                            .map(option -> "'" + option + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // API operation filter
        if (filter.getApiOperations() != null && !filter.getApiOperations().isEmpty()) {
            whereConditions.add("LINEITEM_OPERATION IN (" +
                    filter.getApiOperations().stream()
                            .map(op -> "'" + op + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // Availability zone filter
        if (filter.getAvailabilityZones() != null && !filter.getAvailabilityZones().isEmpty()) {
            whereConditions.add("AVAILABILITYZONE IN (" +
                    filter.getAvailabilityZones().stream()
                            .map(az -> "'" + az + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // Tenancy filter
        if (filter.getTenancies() != null && !filter.getTenancies().isEmpty()) {
            whereConditions.add("TENANCY IN (" +
                    filter.getTenancies().stream()
                            .map(tenancy -> "'" + tenancy + "'")
                            .collect(Collectors.joining(",")) + ")");
        }

        // Add WHERE clause if needed
        if (!whereConditions.isEmpty()) {
            sqlBuilder.append(" WHERE ").append(String.join(" AND ", whereConditions));
        }

        // Group by
        sqlBuilder.append(" GROUP BY group_key, time_period ");

        // Order by
        sqlBuilder.append(" ORDER BY time_period, group_key ");

        // Limit results
        sqlBuilder.append(" LIMIT 1000");

        return sqlBuilder.toString();
    }

    private String getColumnNameForField(String field) {
        Map<String, String> columnMappings = new HashMap<>();
        columnMappings.put("Service", "PRODUCT_PRODUCTNAME");
        columnMappings.put("InstanceType", "MYCLOUD_INSTANCETYPE");
        columnMappings.put("AccountID", "LINKEDACCOUNTID");
        columnMappings.put("UsageType", "LINEITEM_USAGETYPE");
        columnMappings.put("Platform", "MYCLOUD_OPERATINGSYSTEM");
        columnMappings.put("Region", "MYCLOUD_REGIONNAME");
        columnMappings.put("UsageTypeGroup", "MYCLOUD_COST_EXPLORER_USAGE_GROUP_TYPE");
        columnMappings.put("PurchaseOption", "MYCLOUD_PRICINGTYPE");
        columnMappings.put("ApiOperation", "LINEITEM_OPERATION");
        columnMappings.put("Resource", "PRODUCT_PRODUCTNAME"); // I might need to make adjustment here
        columnMappings.put("AvailabilityZone", "AVAILABILITYZONE");
        columnMappings.put("Tenancy", "TENANCY");
        columnMappings.put("ChargeType", "CHARGE_TYPE");

        return columnMappings.getOrDefault(field, "PRODUCT_PRODUCTNAME");
    }

    private CostExplorerResponseDTO processCostData(List<Map<String, Object>> rows) {
        CostExplorerResponseDTO response = new CostExplorerResponseDTO();

        // Extract unique time periods
        Set<String> timeUnitsSet = new TreeSet<>();
        Map<String, Map<String, BigDecimal>> groupData = new HashMap<>();
        Map<String, BigDecimal> totalsByTime = new HashMap<>();

        for (Map<String, Object> row : rows) {
            String groupKey = row.get("GROUP_KEY") != null ? row.get("GROUP_KEY").toString() : "Other";
            String timePeriod = row.get("TIME_PERIOD").toString();

            // Fix for ClassCastException - convert Double to BigDecimal properly
            BigDecimal cost;
            Object costObj = row.get("TOTAL_COST");
            if (costObj instanceof BigDecimal) {
                cost = (BigDecimal) costObj;
            } else if (costObj instanceof Double) {
                cost = BigDecimal.valueOf((Double) costObj);
            } else {
                // Handle any other types if needed
                cost = new BigDecimal(costObj.toString());
            }

            timeUnitsSet.add(timePeriod);

            // Initialize group if not exists
            groupData.putIfAbsent(groupKey, new HashMap<>());

            // Add cost for this time period
            groupData.get(groupKey).put(timePeriod, cost);

            // Update totals
            totalsByTime.putIfAbsent(timePeriod, BigDecimal.ZERO);
            totalsByTime.put(timePeriod, totalsByTime.get(timePeriod).add(cost));
        }

        // Convert to ordered list
        List<String> timeUnits = new ArrayList<>(timeUnitsSet);

        // Create groups
        List<CostGroupDTO> groups = new ArrayList<>();
        for (Map.Entry<String, Map<String, BigDecimal>> entry : groupData.entrySet()) {
            CostGroupDTO group = new CostGroupDTO();
            group.setKey(entry.getKey());
            group.setValues(entry.getValue());

            // Calculate group total
            BigDecimal groupTotal = entry.getValue().values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            group.setTotal(groupTotal);

            groups.add(group);
        }

        response.setTimeUnits(timeUnits);
        response.setGroups(groups);
        response.setTotals(totalsByTime);
        response.setTotalRecords(rows.size());

        return response;
    }

    private List<CostGroupDTO> convertGroupsData(Map<String, Map<String, BigDecimal>> groupData, List<String> timeUnits) {
        List<CostGroupDTO> groups = new ArrayList<>();

        for (Map.Entry<String, Map<String, BigDecimal>> entry : groupData.entrySet()) {
            CostGroupDTO group = new CostGroupDTO();
            group.setKey(entry.getKey());

            // Ensure values for all time periods (set to zero if missing)
            Map<String, BigDecimal> values = new HashMap<>();
            for (String timeUnit : timeUnits) {
                values.put(timeUnit, entry.getValue().getOrDefault(timeUnit, BigDecimal.ZERO));
            }
            group.setValues(values);

            // Calculate total
            BigDecimal total = values.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            group.setTotal(total);

            groups.add(group);
        }

        // Sort groups by total cost descending
        groups.sort((g1, g2) -> g2.getTotal().compareTo(g1.getTotal()));

        return groups;
    }
}
