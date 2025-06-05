package com.cloudbalance.dto;

import com.cloudbalance.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.snowflake.client.jdbc.internal.google.api.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponseDto<T> {

    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;


    public static <T> ApiResponseDto<T> success(T data) {
        return ApiResponseDto.<T>builder()
                .success(true)
                .message("Operation successful")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponseDto<T> success(String message, T data) {
        return ApiResponseDto.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponseDto<T> error(String message) {
        return ApiResponseDto.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }


    public static <T> ApiResponseDtoBuilder<T> builder() {
        return new ApiResponseDtoBuilder<T>();
    }

    public static class ApiResponseDtoBuilder<T> {
        private boolean success;
        private String message;
        private T data;
        private LocalDateTime timestamp;

        ApiResponseDtoBuilder() {
        }

        public ApiResponseDtoBuilder<T> success(boolean success) {
            this.success = success;
            return this;
        }

        public ApiResponseDtoBuilder<T> message(String message) {
            this.message = message;
            return this;
        }

        public ApiResponseDtoBuilder<T> data(T data) {
            this.data = data;
            return this;
        }

        public ApiResponseDtoBuilder<T> timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public ApiResponseDto<T> build() {
            return new ApiResponseDto<T>(this.success, this.message, this.data, this.timestamp);
        }

        public String toString() {
            return "ApiResponseDto.ApiResponseDtoBuilder(success=" + this.success + ", message=" + this.message + ", data=" + this.data + ", timestamp=" + this.timestamp + ")";
        }
    }
}