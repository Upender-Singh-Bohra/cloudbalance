package com.cloudbalance.repository;

import com.cloudbalance.model.User;
import com.cloudbalance.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    Optional<UserSession> findBySessionToken(String sessionToken);

    List<UserSession> findByUser(User user);

    List<UserSession> findByUserAndIsActiveTrue(User user);

    @Query("SELECT us FROM UserSession us WHERE us.user.id = :userId AND us.isActive = true")
    List<UserSession> findActiveSessionsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE UserSession us SET us.isActive = false WHERE us.expiresAt < :now")
    int deactivateExpiredSessions(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE UserSession us SET us.isActive = false WHERE us.lastActivity < :inactiveTime")
    int deactivateInactiveSessions(@Param("inactiveTime") LocalDateTime inactiveTime);

    @Modifying
    @Query("UPDATE UserSession us SET us.isActive = false WHERE us.user.id = :userId")
    int deactivateUserSessions(@Param("userId") Long userId);
}