package com.cloudbalance.controller;

import com.cloudbalance.dto.ApiResponseDto;
import com.cloudbalance.dto.CloudAccountCreateDto;
import com.cloudbalance.dto.CloudAccountDto;
import com.cloudbalance.dto.CloudAccountUpdateDto;
import com.cloudbalance.service.CloudAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Slf4j
public class CloudAccountController {

    private final CloudAccountService cloudAccountService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_READ_ONLY')")
    public ResponseEntity<ApiResponseDto<List<CloudAccountDto>>> getAllCloudAccounts() {
        List<CloudAccountDto> accounts = cloudAccountService.getAllCloudAccounts();
        return ResponseEntity.ok(ApiResponseDto.success(accounts));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_READ_ONLY', 'ROLE_CUSTOMER')")
    public ResponseEntity<ApiResponseDto<CloudAccountDto>> getCloudAccountById(@PathVariable Long id) {
        CloudAccountDto account = cloudAccountService.getCloudAccountById(id);
        return ResponseEntity.ok(ApiResponseDto.success(account));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_READ_ONLY')")
    public ResponseEntity<ApiResponseDto<Set<CloudAccountDto>>> getCloudAccountsByUserId(@PathVariable Long userId) {
        Set<CloudAccountDto> accounts = cloudAccountService.getCloudAccountsByUserId(userId);
        return ResponseEntity.ok(ApiResponseDto.success(accounts));
    }

    @GetMapping("/orphaned")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_READ_ONLY')")
    public ResponseEntity<ApiResponseDto<Set<CloudAccountDto>>> getOrphanedCloudAccounts() {
        Set<CloudAccountDto> accounts = cloudAccountService.getOrphanedCloudAccounts();
        return ResponseEntity.ok(ApiResponseDto.success(accounts));
    }

    @GetMapping("/user/{userId}/accessible")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_READ_ONLY', 'ROLE_CUSTOMER')")
    public ResponseEntity<ApiResponseDto<Set<CloudAccountDto>>> getAccessibleAccountsForUser(@PathVariable Long userId) {
        Set<CloudAccountDto> accounts = cloudAccountService.getAccessibleAccountsForUser(userId);
        return ResponseEntity.ok(ApiResponseDto.success(accounts));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponseDto<CloudAccountDto>> createCloudAccount(
            @Valid @RequestBody CloudAccountCreateDto cloudAccountCreateDto) {
        CloudAccountDto createdAccount = cloudAccountService.createCloudAccount(cloudAccountCreateDto);
        return new ResponseEntity<>(ApiResponseDto.success("Cloud account created successfully", createdAccount),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponseDto<CloudAccountDto>> updateCloudAccount(
            @PathVariable Long id,
            @Valid @RequestBody CloudAccountUpdateDto cloudAccountUpdateDto) {
        CloudAccountDto updatedAccount = cloudAccountService.updateCloudAccount(id, cloudAccountUpdateDto);
        return ResponseEntity.ok(ApiResponseDto.success("Cloud account updated successfully", updatedAccount));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponseDto<CloudAccountDto>> setCloudAccountActiveStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        CloudAccountDto updatedAccount = cloudAccountService.setCloudAccountActiveStatus(id, active);
        String message = active ? "Cloud account activated successfully" : "Cloud account deactivated successfully";
        return ResponseEntity.ok(ApiResponseDto.success(message, updatedAccount));
    }
}