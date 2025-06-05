package com.cloudbalance.service.impl;

import com.cloudbalance.exception.BadRequestException;
import com.cloudbalance.exception.ResourceNotFoundException;
import com.cloudbalance.exception.UnauthorizedException;
import com.cloudbalance.model.Role;
import com.cloudbalance.model.User;
import com.cloudbalance.model.UserSession;
import com.cloudbalance.repository.UserRepository;
import com.cloudbalance.repository.UserSessionRepository;
import com.cloudbalance.service.UserSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSessionServiceImpl implements UserSessionService {

    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;

    @Value("${spring.session.timeout:900}")
    private int sessionTimeoutInSeconds;

@Override
@Transactional
public UserSession createSession(User user, String ipAddress, String userAgent) {
    // Calculate expiration time (default 15 minutes)
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime expiresAt = now.plusSeconds(sessionTimeoutInSeconds);

    // Generate a unique session token
    String sessionToken = UUID.randomUUID().toString();

    // Create and save the session
    UserSession session = UserSession.builder()
            .user(user)
            .sessionToken(sessionToken)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .expiresAt(expiresAt)
            .lastActivity(now)
            .isActive(true)
            .createdAt(now)
            .build();

    return userSessionRepository.save(session);
}

    @Override
    @Transactional(readOnly = true)
    public String validateSessionToken(String sessionToken) {
        UserSession session = userSessionRepository.findBySessionToken(sessionToken)
                .orElse(null);

        if (session == null || !session.getIsActive()) {
            return null;
        }

        if (session.isExpired()) {
            // Deactivate expired session
            session.setIsActive(false);
            userSessionRepository.save(session);
        }

        // Check for inactivity (15 minutes default)
        if (session.isInactive(sessionTimeoutInSeconds / 60)) {
            session.setIsActive(false);
            userSessionRepository.save(session);
            return null;
        }

        return session.getUser().getUsername();
    }

    @Override
    @Transactional
    public UserSession updateSessionActivity(String sessionToken) {
        UserSession session = userSessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "token", sessionToken));

        if (!session.getIsActive() || session.isExpired()) {
            throw new UnauthorizedException("Session is no longer valid");
        }

        // Update the last activity time
        session.setLastActivity(LocalDateTime.now());

        // Extend the expiration time
        session.setExpiresAt(LocalDateTime.now().plusSeconds(sessionTimeoutInSeconds));

        return userSessionRepository.save(session);
    }

    @Override
    @Transactional
    public void invalidateSession(String sessionToken) {
        UserSession session = userSessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "token", sessionToken));

        session.setIsActive(false);
        userSessionRepository.save(session);
        log.debug("Session invalidated: {}", sessionToken);
    }

    @Override
    @Transactional
    public void invalidateAllUserSessions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<UserSession> sessions = userSessionRepository.findByUser(user);
        sessions.forEach(session -> session.setIsActive(false));
        userSessionRepository.saveAll(sessions);
        log.debug("All sessions for user {} invalidated", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSession> getActiveSessionsForUser(Long userId) {
        return userSessionRepository.findActiveSessionsByUserId(userId);
    }

    @Override
    @Transactional
    @Scheduled(fixedRate = 3600000) // hourly job
    public void cleanupSessions() {
        LocalDateTime now = LocalDateTime.now();

        // Deactivate expired sessions
        int expiredCount = userSessionRepository.deactivateExpiredSessions(now);

        // Deactivate inactive sessions
        LocalDateTime inactiveTime = now.minusSeconds(sessionTimeoutInSeconds);
        int inactiveCount = userSessionRepository.deactivateInactiveSessions(inactiveTime);
        log.info("Session cleanup complete. Deactivated {} expired and {} inactive session", inactiveCount, expiredCount);
        System.out.print("cleanup: " + inactiveCount + " " +  expiredCount); // remove later
    }

    // For switchuser

    @Override
    @Transactional
    public UserSession createImpersonationSession(Long adminUserId, Long targetUserId,
                                                  String adminSessionToken, String ipAddress,
                                                  String userAgent) {
        // Start with basic logging
        log.info("Starting impersonation - Admin ID: {}, Target ID: {}", adminUserId, targetUserId);

        try {
            // Verify the admin session token
            UserSession adminSession = userSessionRepository.findBySessionToken(adminSessionToken)
                    .orElseThrow(() -> new UnauthorizedException("Invalid admin session"));

            log.info("Found admin session: {}", adminSession.getSessionToken());

            if (!adminSession.getIsActive() || adminSession.isExpired()) {
                log.warn("Admin session is no longer valid - Active: {}, Expired: {}",
                        adminSession.getIsActive(), adminSession.isExpired());
                throw new UnauthorizedException("Admin session is no longer valid");
            }

            // Check if this is already an impersonation session
            if (adminSession.getOriginalAdminSession() != null) {
                log.warn("Attempted nested impersonation");
                throw new BadRequestException("Cannot create nested impersonation sessions");
            }

            // Get the admin user
            User adminUser = adminSession.getUser();
            log.info("Admin user: {} (ID: {})", adminUser.getUsername(), adminUser.getId());

            if (adminUser == null) {
                log.error("No user associated with session");
                throw new UnauthorizedException("Invalid user session");
            }

            if (!adminUser.getId().equals(adminUserId)) {
                log.error("User ID mismatch: Session user ID = {}, Provided admin ID = {}",
                        adminUser.getId(), adminUserId);
                throw new UnauthorizedException("User ID mismatch with session");
            }

            // Detailed role logging
            Role adminRole = adminUser.getRole();
            if (adminRole == null) {
                log.error("Admin user has no role assigned");
                throw new UnauthorizedException("User has no role assigned");
            }

            log.info("Admin role details - ID: {}, Name: {}",
                    adminRole.getId(), adminRole.getName());

            // Ensure the user is an admin with more flexible checking
            boolean isAdmin = "ROLE_ADMIN".equals(adminRole.getName()) ||
                    "ADMIN".equals(adminRole.getName());

            log.info("Is admin check result: {}", isAdmin);

            if (!isAdmin) {
                log.error("User {} does not have admin role. Actual role: {}",
                        adminUser.getUsername(), adminRole.getName());
                throw new UnauthorizedException("Only admin users can impersonate other users");
            }

            // Get the target user with detailed logging
            User targetUser = userRepository.findById(targetUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

            log.info("Target user: {} (ID: {})", targetUser.getUsername(), targetUser.getId());

            // Detailed role logging for target user
            Role targetRole = targetUser.getRole();
            if (targetRole == null) {
                log.error("Target user has no role assigned");
                throw new BadRequestException("Target user has no role assigned");
            }

            log.info("Target user role details - ID: {}, Name: {}",
                    targetRole.getId(), targetRole.getName());

            // More flexible customer role check
            boolean isCustomer = "ROLE_CUSTOMER".equals(targetRole.getName()) ||
                    "CUSTOMER".equals(targetRole.getName());

            log.info("Is customer check result: {}", isCustomer);

            if (!isCustomer) {
                log.error("Target user {} does not have customer role. Actual role: {}",
                        targetUser.getUsername(), targetRole.getName());
                throw new BadRequestException("Admin can only impersonate customers");
            }

            // Prevent self-impersonation
            if (adminUser.getId().equals(targetUserId)) {
                log.warn("Attempted self-impersonation");
                throw new BadRequestException("Cannot impersonate yourself");
            }

            // Create a new session for impersonation
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiresAt = now.plusSeconds(sessionTimeoutInSeconds);

            // Generate a unique session token
            String sessionToken = UUID.randomUUID().toString();

            // Create and save the impersonation session with a reference to the admin
            UserSession impersonationSession = UserSession.builder()
                    .user(targetUser)
                    .sessionToken(sessionToken)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .expiresAt(expiresAt)
                    .lastActivity(now)
                    .isActive(true)
                    .createdAt(now)
                    .originalAdminSession(adminSession) // Store reference to admin session
                    .build();

            log.info("Successfully created impersonation session for admin {} impersonating user {}",
                    adminUser.getUsername(), targetUser.getUsername());

            return userSessionRepository.save(impersonationSession);
        } catch (Exception e) {
            log.error("Error in createImpersonationSession", e);
            throw e;
        }
    }

//    @Override
//    @Transactional
//    public UserSession revertImpersonationSession(String impersonationSessionToken,
//                                                  String ipAddress, String userAgent) {
//        // Find the impersonation session
//        UserSession impersonationSession = userSessionRepository.findBySessionToken(impersonationSessionToken)
//                .orElseThrow(() -> new ResourceNotFoundException("Session", "token", impersonationSessionToken));
//
//        // Validate this is an impersonation session
//        UserSession adminSession = impersonationSession.getOriginalAdminSession();
//        if (adminSession == null) {
//            throw new BadRequestException("This is not an impersonation session");
//        }
//
//        // Check admin session is still valid
//        if (!adminSession.getIsActive() || adminSession.isExpired()) {
//            // Invalidate the impersonation session since admin session is no longer valid
//            impersonationSession.setIsActive(false);
//            userSessionRepository.save(impersonationSession);
//            throw new UnauthorizedException("Original admin session is no longer valid");
//        }
//
//        // Invalidate the impersonation session
//        impersonationSession.setIsActive(false);
//        userSessionRepository.save(impersonationSession);
//
//        // Update the admin session activity and extend expiration
//        adminSession.setLastActivity(LocalDateTime.now());
//        adminSession.setExpiresAt(LocalDateTime.now().plusSeconds(sessionTimeoutInSeconds));
//
//        log.info("User {} reverted impersonation back to admin {}",
//                impersonationSession.getUser().getUsername(),
//                adminSession.getUser().getUsername());
//
//        return userSessionRepository.save(adminSession);
//    }
// Modified version of revertImpersonationSession
@Override
@Transactional
public UserSession revertImpersonationSession(String impersonationSessionToken,
                                              String ipAddress, String userAgent) {
    // Find the impersonation session
    UserSession impersonationSession = userSessionRepository.findBySessionToken(impersonationSessionToken)
            .orElseThrow(() -> new ResourceNotFoundException("Session", "token", impersonationSessionToken));

    // Validate this is an impersonation session
    UserSession adminSession = impersonationSession.getOriginalAdminSession();
    if (adminSession == null) {
        throw new BadRequestException("This is not an impersonation session");
    }

    // Invalidate the impersonation session regardless of admin session status
    impersonationSession.setIsActive(false);
    userSessionRepository.save(impersonationSession);

    // Check admin session is still valid
    if (!adminSession.getIsActive() || adminSession.isExpired()) {
        // Instead of throwing an exception, create a new admin session
        User adminUser = adminSession.getUser();

        // Create a new session for the admin
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(sessionTimeoutInSeconds);

        String sessionToken = UUID.randomUUID().toString();

        UserSession newAdminSession = UserSession.builder()
                .user(adminUser)
                .sessionToken(sessionToken)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .expiresAt(expiresAt)
                .lastActivity(now)
                .isActive(true)
                .createdAt(now)
                .build();

        log.info("Created new admin session as original one expired");
        return userSessionRepository.save(newAdminSession);
    }

    // Update the existing admin session activity and extend expiration
    adminSession.setLastActivity(LocalDateTime.now());
    adminSession.setExpiresAt(LocalDateTime.now().plusSeconds(sessionTimeoutInSeconds));

    log.info("Reusing existing admin session");
    return userSessionRepository.save(adminSession);
}
}