package com.cloudbalance.service;

import com.cloudbalance.dto.LoginRequestDto;
import com.cloudbalance.dto.LoginResponseDto;
import com.cloudbalance.dto.UserCreateDto;
import com.cloudbalance.dto.UserDto;
import com.cloudbalance.dto.UserUpdateDto;
import com.cloudbalance.model.User;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface UserService {

    /**
     * Authenticate a user and create a session
     *
     * @param loginRequest Login credentials
     * @param request HTTP request for IP and user agent information
     * @return Login response with session token
     */
    LoginResponseDto login(LoginRequestDto loginRequest, HttpServletRequest request);

    /**
     * Logout a user by invalidating their session
     *
     * @param sessionToken Session token to invalidate
     */
    void logout(String sessionToken);

    /**
     * Get the currently authenticated user
     *
     * @param sessionToken Session token
     * @return User DTO
     */
    UserDto getCurrentUser(String sessionToken);

    /**
     * Get all users
     *
     * @return List of all users
     */
    List<UserDto> getAllUsers();

    /**
     * Get user by ID
     *
     * @param id User ID
     * @return User DTO
     */
    UserDto getUserById(Long id);

    /**
     * Create a new user
     *
     * @param userCreateDto User creation data
     * @return Created user DTO
     */
    UserDto createUser(UserCreateDto userCreateDto);

    /**
     * Update an existing user
     *
     * @param id User ID
     * @param userUpdateDto User update data
     * @return Updated user DTO
     */
    UserDto updateUser(Long id, UserUpdateDto userUpdateDto);

    /**
     * Assign cloud accounts to a user
     *
     * @param userId User ID
     * @param accountIds List of cloud account IDs
     * @return Updated user DTO
     */
    UserDto assignAccountsToUser(Long userId, List<Long> accountIds);

    /**
     * Remove cloud accounts from a user
     *
     * @param userId User ID
     * @param accountIds List of cloud account IDs
     * @return Updated user DTO
     */
    UserDto removeAccountsFromUser(Long userId, List<Long> accountIds);

    /**
     * Get user entity by username
     *
     * @param username Username
     * @return User entity
     */
    User getUserByUsername(String username);

    /**
     * Generate a password reset token and send reset email
     *
     * @param email User's email address
     * @return true if email was sent, false if user not found
     */
    boolean forgotPassword(String email);

    /**
     * Validate a password reset token
     *
     * @param token Reset token
     * @return true if token is valid, false otherwise
     */
    boolean validatePasswordResetToken(String token);

    /**
     * Reset a user's password using a reset token
     *
     * @param token Reset token
     * @param newPassword New password
     * @return true if password was reset, false otherwise
     */
    boolean resetPassword(String token, String newPassword);


}

