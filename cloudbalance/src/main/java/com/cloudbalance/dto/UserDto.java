package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String roleName;
    private LocalDateTime createdAt;
    private Set<CloudAccountDto> assignedAccounts;

    public static UserDtoBuilder builder() {
        return new UserDtoBuilder();
    }

    public static class UserDtoBuilder {
        private Long id;
        private String username;
        private String firstName;
        private String lastName;
        private String email;
        private String roleName;
        private LocalDateTime createdAt;
        private Set<CloudAccountDto> assignedAccounts;

        UserDtoBuilder() {
        }

        public UserDtoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserDtoBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserDtoBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public UserDtoBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public UserDtoBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserDtoBuilder roleName(String roleName) {
            this.roleName = roleName;
            return this;
        }

        public UserDtoBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserDtoBuilder assignedAccounts(Set<CloudAccountDto> assignedAccounts) {
            this.assignedAccounts = assignedAccounts;
            return this;
        }

        public UserDto build() {
            return new UserDto(this.id, this.username, this.firstName, this.lastName, this.email, this.roleName, this.createdAt, this.assignedAccounts);
        }

        public String toString() {
            return "UserDto.UserDtoBuilder(id=" + this.id + ", username=" + this.username + ", firstName=" + this.firstName + ", lastName=" + this.lastName + ", email=" + this.email + ", roleName=" + this.roleName + ", createdAt=" + this.createdAt + ", assignedAccounts=" + this.assignedAccounts + ")";
        }
    }
}