package com.cloudbalance.service;

import com.cloudbalance.model.User;
import com.cloudbalance.model.UserSession;

import java.util.List;

public interface UserSessionService {

    /**
     * Create a new session for a user
     *
     * @param user User for whom the session is created
     * @param ipAddress IP address of the client
     * @param userAgent User agent of the client
     * @return Created session
     */
    UserSession createSession(User user, String ipAddress, String userAgent);

    /**
     * Validate a session token
     *
     * @param sessionToken Session token to validate
     * @return Username if valid, null otherwise
     */
    String validateSessionToken(String sessionToken);

    /**
     * Update the last activity timestamp of a session
     *
     * @param sessionToken Session token to update
     * @return Updated session
     */
    UserSession updateSessionActivity(String sessionToken);

    /**
     * Invalidate a specific session
     *
     * @param sessionToken Session token to invalidate
     */
    void invalidateSession(String sessionToken);

    /**
     * Invalidate all sessions for a user
     *
     * @param userId User ID for whom all sessions will be invalidated
     */
    void invalidateAllUserSessions(Long userId);

    /**
     * Get all active sessions for a user
     *
     * @param userId User ID
     * @return List of active sessions
     */
    List<UserSession> getActiveSessionsForUser(Long userId);

    /**
     * Clear expired and inactive sessions
     */
    void cleanupSessions();

    // For switch user
    /**
     * Create an impersonation session where an admin user temporarily views as another user
     *
     * @param adminUserId ID of the admin user
     * @param targetUserId ID of the user to impersonate
     * @param adminSessionToken Original admin session token
     * @param ipAddress IP address of the client
     * @param userAgent User agent of the client
     * @return Created impersonation session
     */
    UserSession createImpersonationSession(Long adminUserId, Long targetUserId,
                                           String adminSessionToken, String ipAddress,
                                           String userAgent);

    /**
     * Revert back to the original admin user from an impersonation session
     *
     * @param impersonationSessionToken The impersonation session token
     * @param ipAddress IP address of the client
     * @param userAgent User agent of the client
     * @return Original admin session
     */
    UserSession revertImpersonationSession(String impersonationSessionToken,
                                           String ipAddress, String userAgent);

}