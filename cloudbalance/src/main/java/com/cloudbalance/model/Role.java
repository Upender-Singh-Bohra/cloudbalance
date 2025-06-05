package com.cloudbalance.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_READ_ONLY = "ROLE_READ_ONLY";
    public static final String ROLE_CUSTOMER = "ROLE_CUSTOMER";

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> users = new HashSet<>();
}