package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {

    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String sessionToken;

    public static LoginResponseDtoBuilder builder() {
        return new LoginResponseDtoBuilder();
    }

    public static class LoginResponseDtoBuilder {
        private Long userId;
        private String username;
        private String firstName;
        private String lastName;
        private String email;
        private String role;
        private String sessionToken;

        LoginResponseDtoBuilder() {
        }

        public LoginResponseDtoBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public LoginResponseDtoBuilder username(String username) {
            this.username = username;
            return this;
        }

        public LoginResponseDtoBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public LoginResponseDtoBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public LoginResponseDtoBuilder email(String email) {
            this.email = email;
            return this;
        }

        public LoginResponseDtoBuilder role(String role) {
            this.role = role;
            return this;
        }

        public LoginResponseDtoBuilder sessionToken(String sessionToken) {
            this.sessionToken = sessionToken;
            return this;
        }

        public LoginResponseDto build() {
            return new LoginResponseDto(this.userId, this.username, this.firstName, this.lastName, this.email, this.role, this.sessionToken);
        }

        public String toString() {
            return "LoginResponseDto.LoginResponseDtoBuilder(userId=" + this.userId + ", username=" + this.username + ", firstName=" + this.firstName + ", lastName=" + this.lastName + ", email=" + this.email + ", role=" + this.role + ", sessionToken=" + this.sessionToken + ")";
        }
    }
}