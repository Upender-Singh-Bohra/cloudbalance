package com.cloudbalance.service;

import com.cloudbalance.dto.CloudAccountCreateDto;
import com.cloudbalance.dto.CloudAccountDto;
import com.cloudbalance.dto.CloudAccountUpdateDto;

import java.util.List;
import java.util.Set;

public interface CloudAccountService {

    /**
     * Get all cloud accounts
     *
     * @return List of all cloud accounts
     */
    List<CloudAccountDto> getAllCloudAccounts();

    /**
     * Get cloud account by ID
     *
     * @param id Cloud account ID
     * @return Cloud account DTO
     */
    CloudAccountDto getCloudAccountById(Long id);

    /**
     * Get cloud accounts by user ID
     *
     * @param userId User ID
     * @return Set of cloud accounts assigned to the user
     */
    Set<CloudAccountDto> getCloudAccountsByUserId(Long userId);

    /**
     * Get orphaned cloud accounts (not assigned to any user)
     *
     * @return Set of orphaned cloud accounts
     */
    Set<CloudAccountDto> getOrphanedCloudAccounts();

    /**
     * Create a new cloud account
     *
     * @param cloudAccountCreateDto Cloud account creation data
     * @return Created cloud account DTO
     */
    CloudAccountDto createCloudAccount(CloudAccountCreateDto cloudAccountCreateDto);

    /**
     * Update an existing cloud account
     *
     * @param id Cloud account ID
     * @param cloudAccountUpdateDto Cloud account update data
     * @return Updated cloud account DTO
     */
    CloudAccountDto updateCloudAccount(Long id, CloudAccountUpdateDto cloudAccountUpdateDto);

    /**
     * Enable or disable a cloud account
     *
     * @param id Cloud account ID
     * @param isActive Active status
     * @return Updated cloud account DTO
     */
    CloudAccountDto setCloudAccountActiveStatus(Long id, boolean isActive);

    /**
     * Get all accessible cloud accounts for a user based on their role
     * Admin and Read-Only users have access to all accounts
     * Customer users only have access to their assigned accounts
     *
     * @param userId User ID
     * @return Set of accessible cloud account DTOs
     */
    Set<CloudAccountDto> getAccessibleAccountsForUser(Long userId);
}