package com.cloudbalance.controller;

import com.cloudbalance.dto.ApiResponseDto;
import com.cloudbalance.dto.LoginRequestDto;
import com.cloudbalance.dto.LoginResponseDto;
import com.cloudbalance.service.AwsService;
import com.cloudbalance.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.cloudbalance.dto.ForgotPasswordRequestDto;
import com.cloudbalance.dto.ResetPasswordRequestDto;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponseDto<LoginResponseDto>> login(
            @Valid @RequestBody LoginRequestDto loginRequest,
            HttpServletRequest request) {
        LoginResponseDto response = userService.login(loginRequest, request);
        return ResponseEntity.ok(ApiResponseDto.success("Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponseDto<Void>> logout(
            @RequestHeader("Authorization") String authHeader) {
        // Extract token from Authorization header
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        userService.logout(token);
        log.info("User logged out successfully");
        return ResponseEntity.ok(ApiResponseDto.success("Logout successful", null));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponseDto<Void>> checkAuth() {
        // If this endpoint is reached, it means the user is authenticated
        return ResponseEntity.ok(ApiResponseDto.success("Authenticated", null));
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return new ResponseEntity<>("Service is up and running", HttpStatus.OK);
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponseDto<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDto requestDto) {

        boolean emailSent = userService.forgotPassword(requestDto.getEmail());

        // Always return success to prevent email enumeration attacks
        return ResponseEntity.ok(ApiResponseDto.success(
                "If your email is registered with us, you will receive a password reset link shortly.",
                null));
    }

    @PostMapping("/validate-reset-token")
    public ResponseEntity<ApiResponseDto<Boolean>> validateResetToken(
            @RequestParam String token) {

        boolean isValid = userService.validatePasswordResetToken(token);

        if (isValid) {
            return ResponseEntity.ok(ApiResponseDto.success("Token is valid", true));
        } else {
            return ResponseEntity.badRequest().body(
                    ApiResponseDto.error("Invalid or expired token"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponseDto<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDto requestDto) {

        boolean resetSuccessful = userService.resetPassword(
                requestDto.getToken(), requestDto.getNewPassword());

        if (resetSuccessful) {
            return ResponseEntity.ok(ApiResponseDto.success(
                    "Password has been successfully reset", null));
        } else {
            return ResponseEntity.badRequest().body(
                    ApiResponseDto.error("Invalid or expired token"));
        }
    }
}
