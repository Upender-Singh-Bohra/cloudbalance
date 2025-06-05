package com.cloudbalance.service;

import com.cloudbalance.model.User;

public interface EmailService {
    void sendPasswordResetEmail(User user, String token);
}