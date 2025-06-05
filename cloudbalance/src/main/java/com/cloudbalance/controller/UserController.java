package com.cloudbalance.controller;

import com.cloudbalance.dto.*;
import com.cloudbalance.exception.BadRequestException;
import com.cloudbalance.exception.ResourceNotFoundException;
import com.cloudbalance.exception.UnauthorizedException;
import com.cloudbalance.model.User;
import com.cloudbalance.model.UserSession;
import com.cloudbalance.service.UserService;
import com.cloudbalance.service.UserSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final UserSessionService userSessionService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponseDto<UserDto>> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        // Extract token from Authorization header
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        UserDto user = userService.getCurrentUser(token);
        return ResponseEntity.ok(ApiResponseDto.success(user));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_READ_ONLY')")
    public ResponseEntity<ApiResponseDto<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponseDto.success(users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_READ_ONLY')")
    public ResponseEntity<ApiResponseDto<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponseDto.success(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponseDto<UserDto>> createUser(
            @Valid @RequestBody UserCreateDto userCreateDto) {
        UserDto createdUser = userService.createUser(userCreateDto);
        return new ResponseEntity<>(ApiResponseDto.success("User created successfully", createdUser),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponseDto<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDto userUpdateDto) {
        UserDto updatedUser = userService.updateUser(id, userUpdateDto);
        return ResponseEntity.ok(ApiResponseDto.success("User updated successfully", updatedUser));
    }

    @PostMapping("/{id}/accounts")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponseDto<UserDto>> assignAccountsToUser(
            @PathVariable Long id,
            @RequestBody List<Long> accountIds) {
        UserDto updatedUser = userService.assignAccountsToUser(id, accountIds);
        return ResponseEntity.ok(ApiResponseDto.success("Accounts assigned successfully", updatedUser));
    }

    @DeleteMapping("/{id}/accounts")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponseDto<UserDto>> removeAccountsFromUser(
            @PathVariable Long id,
            @RequestBody List<Long> accountIds) {
        UserDto updatedUser = userService.removeAccountsFromUser(id, accountIds);
        return ResponseEntity.ok(ApiResponseDto.success("Accounts removed successfully", updatedUser));
    }

    @PostMapping("/impersonate")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponseDto<ImpersonateUserResponseDto>> impersonateUser(
            @RequestBody @Valid ImpersonateUserRequestDto requestDto,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest request) {
        try {
            // Extract the token from the Authorization header
            String sessionToken = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                sessionToken = authHeader.substring(7);
            } else {
                throw new UnauthorizedException("Invalid authorization format");
            }

            //
            log.info("Impersonation attempt - Token length: {}, Target user ID: {}",
                    sessionToken != null ? sessionToken.length() : 0,
                    requestDto.getTargetUserId());

            // Get the admin user details
            String adminUsername = userSessionService.validateSessionToken(sessionToken);
            if (adminUsername == null) {
                throw new UnauthorizedException("Invalid session");
            }

            log.info("Admin user validated: {}", adminUsername);

            UserDto adminUserDto = userService.getCurrentUser(sessionToken);
            Long adminUserId = adminUserDto.getId();

            log.info("Admin user ID: {}", adminUserId);

            // Create impersonation session
            UserSession impersonationSession = userSessionService.createImpersonationSession(
                    adminUserId,
                    requestDto.getTargetUserId(),
                    sessionToken,
                    request.getRemoteAddr(),
                    request.getHeader("User-Agent")
            );

            User targetUser = impersonationSession.getUser();
            log.info("Target user: {}", targetUser.getUsername());

            // Building the response
            ImpersonateUserResponseDto responseDto = ImpersonateUserResponseDto.builder()
                    .sessionToken(impersonationSession.getSessionToken())
                    .userId(targetUser.getId())
                    .username(targetUser.getUsername())
                    .firstName(targetUser.getFirstName())
                    .lastName(targetUser.getLastName())
                    .email(targetUser.getEmail())
                    .role(targetUser.getRole().getName())
                    .isImpersonating(true)
                    .build();

            return ResponseEntity.ok(ApiResponseDto.success("Successfully impersonating user", responseDto));
        } catch (UnauthorizedException | BadRequestException | ResourceNotFoundException e) {
            // Log the error
            log.error("Error during impersonation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDto.error(e.getMessage()));
        } catch (Exception e) {
            // Log unexpected errors
            log.error("Unexpected error during impersonation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("An unexpected error occurred"));
        }
    }

    @PostMapping("/revert-impersonation")
    public ResponseEntity<ApiResponseDto<ImpersonateUserResponseDto>> revertImpersonation(
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest request) {
        try {
            // Extract the token from the Authorization header
            String sessionToken = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                sessionToken = authHeader.substring(7);
                log.info("Extracted token for reversion: {}", sessionToken);
            } else {
                log.error("Invalid Authorization header format: {}", authHeader);
                throw new UnauthorizedException("Invalid authorization format");
            }

            // Revert to admin session
            UserSession adminSession = userSessionService.revertImpersonationSession(
                    sessionToken,
                    request.getRemoteAddr(),
                    request.getHeader("User-Agent")
            );

            User adminUser = adminSession.getUser();
            log.info("Successfully reverted to admin user: {}", adminUser.getUsername());

            // Build the response
            ImpersonateUserResponseDto responseDto = ImpersonateUserResponseDto.builder()
                    .sessionToken(adminSession.getSessionToken())
                    .userId(adminUser.getId())
                    .username(adminUser.getUsername())
                    .firstName(adminUser.getFirstName())
                    .lastName(adminUser.getLastName())
                    .email(adminUser.getEmail())
                    .role(adminUser.getRole().getName())
                    .isImpersonating(false)
                    .build();

            return ResponseEntity.ok(ApiResponseDto.success("Successfully reverted to admin user", responseDto));
        } catch (UnauthorizedException | BadRequestException | ResourceNotFoundException e) {
            // Log the error
            log.error("Error reverting impersonation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDto.error(e.getMessage()));
        } catch (Exception e) {
            // Log unexpected errors
            log.error("Unexpected error reverting impersonation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("An unexpected error occurred"));
        }
    }
    }