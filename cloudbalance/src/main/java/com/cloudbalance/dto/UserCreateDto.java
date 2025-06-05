package com.cloudbalance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateDto {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Role is required")
    private String roleName;

    private Set<Long> accountIds;

    public static UserCreateDtoBuilder builder() {
        return new UserCreateDtoBuilder();
    }

    public static class UserCreateDtoBuilder {
        private @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username;
        private @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters") String password;
        private @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must not exceed 100 characters") String firstName;
        private @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must not exceed 100 characters") String lastName;
        private @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        @Size(max = 100, message = "Email must not exceed 100 characters") String email;
        private @NotBlank(message = "Role is required") String roleName;
        private Set<Long> accountIds;

        UserCreateDtoBuilder() {
        }

        public UserCreateDtoBuilder username(@NotBlank(message = "Username is required") @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username) {
            this.username = username;
            return this;
        }

        public UserCreateDtoBuilder password(@NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password) {
            this.password = password;
            return this;
        }

        public UserCreateDtoBuilder firstName(@NotBlank(message = "First name is required") @Size(max = 100, message = "First name must not exceed 100 characters") String firstName) {
            this.firstName = firstName;
            return this;
        }

        public UserCreateDtoBuilder lastName(@NotBlank(message = "Last name is required") @Size(max = 100, message = "Last name must not exceed 100 characters") String lastName) {
            this.lastName = lastName;
            return this;
        }

        public UserCreateDtoBuilder email(@NotBlank(message = "Email is required") @Email(message = "Email should be valid") @Size(max = 100, message = "Email must not exceed 100 characters") String email) {
            this.email = email;
            return this;
        }

        public UserCreateDtoBuilder roleName(@NotBlank(message = "Role is required") String roleName) {
            this.roleName = roleName;
            return this;
        }

        public UserCreateDtoBuilder accountIds(Set<Long> accountIds) {
            this.accountIds = accountIds;
            return this;
        }

        public UserCreateDto build() {
            return new UserCreateDto(this.username, this.password, this.firstName, this.lastName, this.email, this.roleName, this.accountIds);
        }

        public String toString() {
            return "UserCreateDto.UserCreateDtoBuilder(username=" + this.username + ", password=" + this.password + ", firstName=" + this.firstName + ", lastName=" + this.lastName + ", email=" + this.email + ", roleName=" + this.roleName + ", accountIds=" + this.accountIds + ")";
        }
    }
}