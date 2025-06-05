
package com.cloudbalance.service.impl;

import com.cloudbalance.dto.*;
import com.cloudbalance.exception.BadRequestException;
import com.cloudbalance.exception.ForbiddenException;
import com.cloudbalance.exception.ResourceNotFoundException;
import com.cloudbalance.exception.UnauthorizedException;
import com.cloudbalance.model.CloudAccount;
import com.cloudbalance.model.Role;
import com.cloudbalance.model.User;
import com.cloudbalance.model.UserSession;
import com.cloudbalance.repository.CloudAccountRepository;
import com.cloudbalance.repository.RoleRepository;
import com.cloudbalance.repository.UserRepository;
import com.cloudbalance.repository.UserSessionRepository;
import com.cloudbalance.service.UserService;
import com.cloudbalance.service.UserSessionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cloudbalance.model.PasswordResetToken;
import com.cloudbalance.repository.PasswordResetTokenRepository;
import com.cloudbalance.service.EmailService;
import java.util.UUID;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CloudAccountRepository cloudAccountRepository;
    private final UserSessionRepository userSessionRepository;
    private final UserSessionService userSessionService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    LocalDateTime now = LocalDateTime.now();

    @Override
    @Transactional
    public LoginResponseDto login(LoginRequestDto loginRequest, HttpServletRequest request) {
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Get the user
        User user = getUserByUsername(loginRequest.getUsername());

        // Create a session
        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        UserSession session = userSessionService.createSession(user, ipAddress, userAgent);

        // Create and return login response
        return LoginResponseDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .sessionToken(session.getSessionToken())
                .build();
    }

    @Override
    @Transactional
    public void logout(String sessionToken) {
        userSessionService.invalidateSession(sessionToken);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String sessionToken) {
        String username = userSessionService.validateSessionToken(sessionToken);
        if (username == null) {
            throw new UnauthorizedException("Invalid or expired session");
        }

        User user = getUserByUsername(username);
        return mapUserToDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUserToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findByIdWithAccounts(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapUserToDto(user);
    }

    @Override
    @Transactional
    public UserDto createUser(UserCreateDto userCreateDto) {
        // Check if username and email are unique
        if (userRepository.existsByUsername(userCreateDto.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(userCreateDto.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        // Get the role
        Role role = roleRepository.findByName(userCreateDto.getRoleName())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", userCreateDto.getRoleName()));

        // Create the user
        User user = User.builder()
                .username(userCreateDto.getUsername())
                .password(passwordEncoder.encode(userCreateDto.getPassword()))
                .firstName(userCreateDto.getFirstName())
                .lastName(userCreateDto.getLastName())
                .email(userCreateDto.getEmail())
                .role(role)
                .createdAt(now)
                .build();

        // Assign accounts if provided and role is appropriate
        if (userCreateDto.getAccountIds() != null && !userCreateDto.getAccountIds().isEmpty()) {
            // Check if user has admin or readonly role - these roles shouldn't have account assignments
            if (role.getName().equals(Role.ROLE_ADMIN) || role.getName().equals(Role.ROLE_READ_ONLY)) {
                throw new BadRequestException("Admin and Read-Only users automatically have access to all accounts");
            }

            if (role.getName().equals(Role.ROLE_CUSTOMER)) {
                Set<CloudAccount> accounts = userCreateDto.getAccountIds().stream()
                        .map(accountId -> cloudAccountRepository.findById(accountId)
                                .orElseThrow(() -> new ResourceNotFoundException("CloudAccount", "id", accountId)))
                        .collect(Collectors.toSet());
                user.setAssignedAccounts(accounts);
            }
        }

        User savedUser = userRepository.save(user);
        log.info("Created new user: {}", savedUser.getUsername());

        return mapUserToDto(savedUser);
    }

//    @Override
//    @Transactional
//    public UserDto updateUser(Long id, UserUpdateDto userUpdateDto) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
//
//        // Update fields if provided
//        if (userUpdateDto.getUsername() != null && !userUpdateDto.getUsername().equals(user.getUsername())) {
//            if (userRepository.existsByUsername(userUpdateDto.getUsername())) {
//                throw new BadRequestException("Username already exists");
//            }
//            user.setUsername(userUpdateDto.getUsername());
//        }
private boolean isLastAdmin(Long userId, String newRoleName) {
    // Only check if we're changing from ADMIN to something else
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

    if (!Role.ROLE_ADMIN.equals(newRoleName) &&
            Role.ROLE_ADMIN.equals(user.getRole().getName())) {
        // Count total admin users
        long adminCount = userRepository.countByRoleName(Role.ROLE_ADMIN);
        return adminCount <= 1;
    }

    return false;
}

    @Override
    @Transactional
    public UserDto updateUser(Long id, UserUpdateDto userUpdateDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User currentUser = getUserByUsername(currentUsername);

        // Check if user is changing their own role
        if (currentUser.getId().equals(id) &&
                userUpdateDto.getRoleName() != null &&
                !userUpdateDto.getRoleName().equals(user.getRole().getName())) {
            throw new ForbiddenException("You cannot change your own role");
        }

        // Check if this is the last admin and role is being changed
        if (userUpdateDto.getRoleName() != null &&
                !userUpdateDto.getRoleName().equals(user.getRole().getName()) &&
                isLastAdmin(id, userUpdateDto.getRoleName())) {
            throw new ForbiddenException("Cannot change role of the last admin user");
        }

        if (userUpdateDto.getUsername() != null && !userUpdateDto.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(userUpdateDto.getUsername())) {
                throw new BadRequestException("Username already exists");
            }
            user.setUsername(userUpdateDto.getUsername());
        }

        if (userUpdateDto.getEmail() != null && !userUpdateDto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userUpdateDto.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(userUpdateDto.getEmail());
        }

        if (userUpdateDto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userUpdateDto.getPassword()));
        }

        if (userUpdateDto.getFirstName() != null) {
            user.setFirstName(userUpdateDto.getFirstName());
        }

        if (userUpdateDto.getLastName() != null) {
            user.setLastName(userUpdateDto.getLastName());
        }

        if (userUpdateDto.getRoleName() != null && !userUpdateDto.getRoleName().equals(user.getRole().getName())) {
            Role newRole = roleRepository.findByName(userUpdateDto.getRoleName())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", userUpdateDto.getRoleName()));
            user.setRole(newRole);

            // If changing to admin or readonly role, clear any existing account assignments
            if (newRole.getName().equals(Role.ROLE_ADMIN) || newRole.getName().equals(Role.ROLE_READ_ONLY)) {
                user.getAssignedAccounts().clear();
            }
        }

        if (userUpdateDto.getAccountIds() != null) {
            // Check if user has admin or readonly role - these roles shouldn't have account assignments
            if (user.getRole().getName().equals(Role.ROLE_ADMIN) || user.getRole().getName().equals(Role.ROLE_READ_ONLY)) {
                throw new BadRequestException("Admin and Read-Only users automatically have access to all accounts");
            }

            if (user.getRole().getName().equals(Role.ROLE_CUSTOMER)) {
                Set<CloudAccount> accounts = userUpdateDto.getAccountIds().stream()
                        .map(accountId -> cloudAccountRepository.findById(accountId)
                                .orElseThrow(() -> new ResourceNotFoundException("CloudAccount", "id", accountId)))
                        .collect(Collectors.toSet());
                user.setAssignedAccounts(accounts);
            } else {
                throw new ForbiddenException("Only Customer role can have accounts assigned");
            }
        }

        User updatedUser = userRepository.save(user);
        log.info("Updated user: {}", updatedUser.getUsername());

        return mapUserToDto(updatedUser);
    }

    @Override
    @Transactional
    public UserDto assignAccountsToUser(Long userId, List<Long> accountIds) {
        User user = userRepository.findByIdWithAccounts(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if user has admin or readonly role - these roles shouldn't have account assignments
        if (user.getRole().getName().equals(Role.ROLE_ADMIN) || user.getRole().getName().equals(Role.ROLE_READ_ONLY)) {
            throw new BadRequestException("Admin and Read-Only users automatically have access to all accounts");
        }

        // Only Customer role can have accounts assigned
        if (!user.getRole().getName().equals(Role.ROLE_CUSTOMER)) {
            throw new ForbiddenException("Only Customer role can have accounts assigned");
        }

        if (accountIds != null && !accountIds.isEmpty()) {
            for (Long accountId : accountIds) {
                CloudAccount account = cloudAccountRepository.findById(accountId)
                        .orElseThrow(() -> new ResourceNotFoundException("CloudAccount", "id", accountId));
                user.addAccount(account);
            }
        }

        User updatedUser = userRepository.save(user);
        log.info("Assigned accounts to user: {}", updatedUser.getUsername());

        return mapUserToDto(updatedUser);
    }

    @Override
    @Transactional
    public UserDto removeAccountsFromUser(Long userId, List<Long> accountIds) {
        User user = userRepository.findByIdWithAccounts(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if user has admin or readonly role - these roles shouldn't have account assignments
        if (user.getRole().getName().equals(Role.ROLE_ADMIN) || user.getRole().getName().equals(Role.ROLE_READ_ONLY)) {
            throw new BadRequestException("Admin and Read-Only users automatically have access to all accounts");
        }

        if (accountIds != null && !accountIds.isEmpty()) {
            for (Long accountId : accountIds) {
                CloudAccount account = cloudAccountRepository.findById(accountId)
                        .orElseThrow(() -> new ResourceNotFoundException("CloudAccount", "id", accountId));
                user.removeAccount(account);
            }
        }

        User updatedUser = userRepository.save(user);
        log.info("Removed accounts from user: {}", updatedUser.getUsername());

        return mapUserToDto(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    // Helper method to map User entity to UserDto
    private UserDto mapUserToDto(User user) {
        Set<CloudAccountDto> accountDtos = new HashSet<>();
        if (user.getAssignedAccounts() != null) {
            accountDtos = user.getAssignedAccounts().stream()
                    .map(this::mapCloudAccountToDto)
                    .collect(Collectors.toSet());
        }

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .roleName(user.getRole().getName())
                .createdAt(user.getCreatedAt())
                .assignedAccounts(accountDtos)
                .build();
    }

    // Helper method to map CloudAccount entity to CloudAccountDto
    private CloudAccountDto mapCloudAccountToDto(CloudAccount account) {
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

    // Email service
    @Override
    @Transactional
    public boolean forgotPassword(String email) {
        // Try to find the user by email
        return userRepository.findByEmail(email)
                .map(user -> {
                    // Generate a token
                    String token = UUID.randomUUID().toString();

                    // Create a token entity
                    PasswordResetToken resetToken = PasswordResetToken.builder()
                            .token(token)
                            .user(user)
                            .expiryDate(LocalDateTime.now().plusMinutes(30)) // Token valid for 30 minutes
                            .used(false)
                            .createdAt(LocalDateTime.now())
                            .build();

                    // Save the token
                    passwordResetTokenRepository.save(resetToken);

                    // Send email
                    emailService.sendPasswordResetEmail(user, token);

                    log.info("Password reset token generated for user: {}", user.getEmail());
                    return true;
                })
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validatePasswordResetToken(String token) {
        return passwordResetTokenRepository.findByToken(token)
                .map(resetToken -> !resetToken.isExpired() && !resetToken.getUsed())
                .orElse(false);
    }

    @Override
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        return passwordResetTokenRepository.findByToken(token)
                .filter(resetToken -> !resetToken.isExpired() && !resetToken.getUsed())
                .map(resetToken -> {
                    // Get the user
                    User user = resetToken.getUser();

                    // Update password
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(user);

                    // Mark token as used
                    resetToken.setUsed(true);
                    passwordResetTokenRepository.save(resetToken);

                    log.info("Password reset successful for user: {}", user.getEmail());
                    return true;
                })
                .orElse(false);
    }
}

