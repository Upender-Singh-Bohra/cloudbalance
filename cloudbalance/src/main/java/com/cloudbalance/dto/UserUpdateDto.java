package com.cloudbalance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDto {

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    private String roleName;

    private Set<Long> accountIds;

    public static UserUpdateDtoBuilder builder() {
        return new UserUpdateDtoBuilder();
    }

    public static class UserUpdateDtoBuilder {
        private @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username;
        private @Size(min = 6, message = "Password must be at least 6 characters") String password;
        private @Size(max = 100, message = "First name must not exceed 100 characters") String firstName;
        private @Size(max = 100, message = "Last name must not exceed 100 characters") String lastName;
        private @Email(message = "Email should be valid")
        @Size(max = 100, message = "Email must not exceed 100 characters") String email;
        private String roleName;
        private Set<Long> accountIds;

        UserUpdateDtoBuilder() {
        }

        public UserUpdateDtoBuilder username(@Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username) {
            this.username = username;
            return this;
        }

        public UserUpdateDtoBuilder password(@Size(min = 6, message = "Password must be at least 6 characters") String password) {
            this.password = password;
            return this;
        }

        public UserUpdateDtoBuilder firstName(@Size(max = 100, message = "First name must not exceed 100 characters") String firstName) {
            this.firstName = firstName;
            return this;
        }

        public UserUpdateDtoBuilder lastName(@Size(max = 100, message = "Last name must not exceed 100 characters") String lastName) {
            this.lastName = lastName;
            return this;
        }

        public UserUpdateDtoBuilder email(@Email(message = "Email should be valid") @Size(max = 100, message = "Email must not exceed 100 characters") String email) {
            this.email = email;
            return this;
        }

        public UserUpdateDtoBuilder roleName(String roleName) {
            this.roleName = roleName;
            return this;
        }

        public UserUpdateDtoBuilder accountIds(Set<Long> accountIds) {
            this.accountIds = accountIds;
            return this;
        }

        public UserUpdateDto build() {
            return new UserUpdateDto(this.username, this.password, this.firstName, this.lastName, this.email, this.roleName, this.accountIds);
        }

        public String toString() {
            return "UserUpdateDto.UserUpdateDtoBuilder(username=" + this.username + ", password=" + this.password + ", firstName=" + this.firstName + ", lastName=" + this.lastName + ", email=" + this.email + ", roleName=" + this.roleName + ", accountIds=" + this.accountIds + ")";
        }
    }
}