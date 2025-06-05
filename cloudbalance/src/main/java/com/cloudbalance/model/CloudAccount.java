package com.cloudbalance.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "cloud_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloudAccount extends BaseEntity {

    @Column(name = "account_id", unique = true, nullable = false)
    private String accountId;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(name = "arn")
    private String arn;

    @Column(name = "region", nullable = false)
    private String region;

    @Column(name = "provider", nullable = false)
    private String provider;  // e.g., "AWS"

    @Column(name = "access_key")
    private String accessKey;  // Encrypted

    @Column(name = "secret_key")
    private String secretKey;  // Encrypted
    @Column(name = "is_active", nullable = false)
    @Builder.Default // temp
    private Boolean isActive = true;


    @ManyToMany(mappedBy = "assignedAccounts", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> users = new HashSet<>();
}