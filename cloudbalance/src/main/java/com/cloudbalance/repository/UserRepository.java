package com.cloudbalance.repository;

import com.cloudbalance.model.Role;
import com.cloudbalance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Add this to UserRepository.java
    long countByRoleName(String roleName);

    List<User> findByRole(Role role);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.id = :id")
    Optional<User> findByIdWithRole(@Param("id") Long id);

//    @Query("SELECT u FROM User u JOIN FETCH u.assignedAccounts WHERE u.id = :id")
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.assignedAccounts WHERE u.id = :id")
    Optional<User> findByIdWithAccounts(@Param("id") Long id);
}