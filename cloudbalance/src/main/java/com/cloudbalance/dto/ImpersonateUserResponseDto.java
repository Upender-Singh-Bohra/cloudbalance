package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImpersonateUserResponseDto {
    private String sessionToken;
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private boolean isImpersonating;
}