package com.cloudbalance.service.impl;

import com.cloudbalance.dto.CloudAccountCreateDto;
import com.cloudbalance.dto.CloudAccountDto;
import com.cloudbalance.dto.CloudAccountUpdateDto;
import com.cloudbalance.exception.BadRequestException;
import com.cloudbalance.exception.ResourceNotFoundException;
import com.cloudbalance.model.CloudAccount;
import com.cloudbalance.model.Role;
import com.cloudbalance.model.User;
import com.cloudbalance.repository.CloudAccountRepository;
import com.cloudbalance.repository.UserRepository;
import com.cloudbalance.service.CloudAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudAccountServiceImpl implements CloudAccountService {

    private final CloudAccountRepository cloudAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CloudAccountDto> getAllCloudAccounts() {
        return cloudAccountRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CloudAccountDto getCloudAccountById(Long id) {
        CloudAccount account = cloudAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CloudAccount", "id", id));
        return mapToDto(account);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<CloudAccountDto> getCloudAccountsByUserId(Long userId) {
        Set<CloudAccount> accounts = cloudAccountRepository.findByUserId(userId);
        return accounts.stream()
                .map(this::mapToDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional(readOnly = true)
    public Set<CloudAccountDto> getOrphanedCloudAccounts() {
        Set<CloudAccount> accounts = cloudAccountRepository.findOrphanedAccounts();
        return accounts.stream()
                .map(this::mapToDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional(readOnly = true)
    public Set<CloudAccountDto> getAccessibleAccountsForUser(Long userId) {
        // Get the user to check their role
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Admin and Read-Only roles have access to all accounts
        if (user.getRole().getName().equals(Role.ROLE_ADMIN) ||
                user.getRole().getName().equals(Role.ROLE_READ_ONLY)) {
            return getAllCloudAccounts().stream()
                    .collect(Collectors.toSet());
        }

        // For Customer role, return only assigned accounts
        return getCloudAccountsByUserId(userId);
    }

    @Override
    @Transactional
    public CloudAccountDto createCloudAccount(CloudAccountCreateDto createDto) {
        // Validate that account ID is unique
        if (cloudAccountRepository.existsByAccountId(createDto.getAccountId())) {
            throw new BadRequestException("Cloud account with this Account ID already exists");
        }
        // Create new cloud account
        CloudAccount account = CloudAccount.builder()
                .accountId(createDto.getAccountId())
                .accountName(createDto.getAccountName())
                .arn(createDto.getArn())
                .region(createDto.getRegion())
                .provider(createDto.getProvider())
                .accessKey(createDto.getAccessKey())
                .secretKey(createDto.getSecretKey())
                .isActive(createDto.getIsActive())
                .build();

        CloudAccount savedAccount = cloudAccountRepository.save(account);
        log.info("Created new cloud account: {}", savedAccount.getAccountName());

        return mapToDto(savedAccount);
    }

    @Override
    @Transactional
    public CloudAccountDto updateCloudAccount(Long id, CloudAccountUpdateDto updateDto) {
        CloudAccount account = cloudAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CloudAccount", "id", id));

        // Update fields if provided
        if (updateDto.getAccountName() != null) {
            account.setAccountName(updateDto.getAccountName());
        }

        if (updateDto.getArn() != null) {
            account.setArn(updateDto.getArn());
        }

        if (updateDto.getRegion() != null) {
            account.setRegion(updateDto.getRegion());
        }

        if (updateDto.getProvider() != null) {
            account.setProvider(updateDto.getProvider());
        }

        if (updateDto.getAccessKey() != null) {
            account.setAccessKey(updateDto.getAccessKey());
        }

        if (updateDto.getSecretKey() != null) {
            account.setSecretKey(updateDto.getSecretKey());
        }

        if (updateDto.getIsActive() != null) {
            account.setIsActive(updateDto.getIsActive());
        }

        CloudAccount updatedAccount = cloudAccountRepository.save(account);
        log.info("Updated cloud account: {}", updatedAccount.getAccountName());

        return mapToDto(updatedAccount);
    }

    @Override
    @Transactional
    public CloudAccountDto setCloudAccountActiveStatus(Long id, boolean isActive) {
        CloudAccount account = cloudAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CloudAccount", "id", id));

        account.setIsActive(isActive);
        CloudAccount updatedAccount = cloudAccountRepository.save(account);

        log.info("Set cloud account {} active status to: {}",
                updatedAccount.getAccountName(), updatedAccount.getIsActive());

        return mapToDto(updatedAccount);
    }

    // Helper method to map CloudAccount entity to CloudAccountDto
    private CloudAccountDto mapToDto(CloudAccount account) {
        return CloudAccountDto.builder()
                .id(account.getId())
                .accountId(account.getAccountId())
                .accountName(account.getAccountName())
                .arn(account.getArn())
                .region(account.getRegion())
                .provider(account.getProvider())
                .isActive(account.getIsActive())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
