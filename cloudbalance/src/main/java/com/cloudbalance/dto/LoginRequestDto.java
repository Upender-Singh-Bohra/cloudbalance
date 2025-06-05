package com.cloudbalance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    public static LoginRequestDtoBuilder builder() {
        return new LoginRequestDtoBuilder();
    }

    public static class LoginRequestDtoBuilder {
        private @NotBlank(message = "Username is required") String username;
        private @NotBlank(message = "Password is required") String password;

        LoginRequestDtoBuilder() {
        }

        public LoginRequestDtoBuilder username(@NotBlank(message = "Username is required") String username) {
            this.username = username;
            return this;
        }

        public LoginRequestDtoBuilder password(@NotBlank(message = "Password is required") String password) {
            this.password = password;
            return this;
        }

        public LoginRequestDto build() {
            return new LoginRequestDto(this.username, this.password);
        }

        public String toString() {
            return "LoginRequestDto.LoginRequestDtoBuilder(username=" + this.username + ", password=" + this.password + ")";
        }
    }
}