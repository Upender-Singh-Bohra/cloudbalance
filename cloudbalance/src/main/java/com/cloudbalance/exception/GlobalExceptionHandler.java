package com.cloudbalance.exception;

import com.cloudbalance.dto.ApiResponseDto;
import com.cloudbalance.dto.ResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponseDto<Object>> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        log.error("Resource not found: {}", ex.getMessage());
        return new ResponseEntity<>(ApiResponseDto.error(ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponseDto<Object>> handleBadRequestException(
            BadRequestException ex, WebRequest request) {
        log.error("Bad request: {}", ex.getMessage());
        return new ResponseEntity<>(ApiResponseDto.error(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponseDto<Object>> handleUnauthorizedException(
            UnauthorizedException ex, WebRequest request) {
        log.error("Unauthorized: {}", ex.getMessage());
        return new ResponseEntity<>(ApiResponseDto.error(ex.getMessage()), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponseDto<Object>> handleForbiddenException(
            ForbiddenException ex, WebRequest request) {
        log.error("Forbidden: {}", ex.getMessage());
        return new ResponseEntity<>(ApiResponseDto.error(ex.getMessage()), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponseDto<Object>> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {
        log.error("Bad credentials: {}", ex.getMessage());
        return new ResponseEntity<>(ApiResponseDto.error("Invalid username or password"),
                HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponseDto<Object>> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        log.error("Access denied: {}", ex.getMessage());
        return new ResponseEntity<>(ApiResponseDto.error("Access denied"), HttpStatus.FORBIDDEN);
    }

    //    @ExceptionHandler(MethodArgumentNotValidException.class)
//    public ResponseEntity<ApiResponseDto<Map<String, String>>> handleValidationExceptions(
//            MethodArgumentNotValidException ex) {
//        Map<String, String> errors = new HashMap<>();
//        ex.getBindingResult().getAllErrors().forEach((error) -> {
//            String fieldName = ((FieldError) error).getField();
//            String errorMessage = error.getDefaultMessage();
//            errors.put(fieldName, errorMessage);
//        });
//        log.error("Validation error: {}", errors);
//        return new ResponseEntity<>(ApiResponseDto.error("Validation failed").builder()
//                .data(errors).build(), HttpStatus.BAD_REQUEST);
//
//    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseDto<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        log.error("Validation error: {}", errors);

        ApiResponseDto<Map<String, String>> response = ApiResponseDto.<Map<String, String>>error("Validation failed");
        response.setData(errors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDto<Object>> handleGlobalException(
            Exception ex, WebRequest request) {
        log.error("Internal server error: ", ex);
        return new ResponseEntity<>(
                ApiResponseDto.error("An unexpected error occurred. Please try again later."),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

// ResponseDTO
    @ExceptionHandler(AwsServiceException.class)
    public ResponseEntity<ResponseDTO<Object>> handleAwsServiceException(AwsServiceException ex) {
        ResponseDTO<Object> response = new ResponseDTO<>();
        response.setSuccess(false);
        response.setMessage("AWS Service Error: " + ex.getMessage() + " [Service: " + ex.getService() +
                ", Account: " + ex.getAccountId() + "]");

        return new ResponseEntity<>(response, HttpStatus.SERVICE_UNAVAILABLE);
    }

    // ApiResponseDTO
//    @ExceptionHandler(AwsServiceException.class)
//    public ResponseEntity<ApiResponseDto<Object>> handleAwsServiceException(
//            AwsServiceException ex, WebRequest request) {
//        log.error("AWS Service Error: {}", ex.getMessage());
//        String errorMessage = "AWS Service Error: " + ex.getMessage() +
//                " [Service: " + ex.getService() +
//                ", Account: " + ex.getAccountId() + "]";
//        return new ResponseEntity<>(ApiResponseDto.error(errorMessage),
//                HttpStatus.SERVICE_UNAVAILABLE);
//    }
}