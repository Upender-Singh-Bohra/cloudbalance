
package com.cloudbalance.controller;

import com.cloudbalance.dto.CostExplorerFilterDTO;
import com.cloudbalance.dto.CostExplorerResponseDTO;
import com.cloudbalance.exception.BadRequestException;
import com.cloudbalance.model.User;
import com.cloudbalance.service.CostExplorerService;
import com.cloudbalance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/cost-explorer")
public class CostExplorerController {

    private final CostExplorerService costExplorerService;
    private final UserService userService;

    @Autowired
    public CostExplorerController(CostExplorerService costExplorerService, UserService userService) {
        this.costExplorerService = costExplorerService;
        this.userService = userService;
    }

    @PostMapping("/data")
    public ResponseEntity<CostExplorerResponseDTO> getCostData(@RequestBody CostExplorerFilterDTO filter) {
        // Get current user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName());

        // Pass both filter and userId to the service
        CostExplorerResponseDTO response = costExplorerService.getCostData(filter, currentUser.getId());
        return ResponseEntity.ok(response);
    }

@GetMapping("/filter-values/{field}")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_READ_ONLY', 'ROLE_CUSTOMER')")
public ResponseEntity<List<String>> getFilterValues(@PathVariable String field) {
    // Define valid fields
    Set<String> validFields = Set.of(
            "Service", "InstanceType", "AccountID", "UsageType",
            "Platform", "Region", "UsageTypeGroup", "PurchaseOption",
            "ApiOperation", "Resource", "AvailabilityZone", "Tenancy", "ChargeType"
    );

    // Check if field is valid
    if (!validFields.contains(field)) {
        throw new BadRequestException("Invalid field: " + field + ". Valid fields are: " + String.join(", ", validFields));
    }

    List<String> values = costExplorerService.getDistinctValuesForField(field);
    return ResponseEntity.ok(values);
}

    @GetMapping("/available-accounts")
//    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_READ_ONLY', 'ROLE_CUSTOMER')")
    public ResponseEntity<List<String>> getAvailableAccounts() {
        User currentUser = getCurrentUser();

        List<String> accounts = costExplorerService.getAccountsForUser(currentUser.getId());
        return ResponseEntity.ok(accounts);
    }


    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth.getPrincipal();

        if (principal instanceof User) {
            return (User) principal;
        } else {
            String username = auth.getName();
            return userService.getUserByUsername(username);
        }
    }

    // Helper method to check if user has CUSTOMER role
    private boolean isCustomerRole(User user) {
        return user != null && user.getRole() != null && "CUSTOMER".equals(user.getRole().getName());
    }
}