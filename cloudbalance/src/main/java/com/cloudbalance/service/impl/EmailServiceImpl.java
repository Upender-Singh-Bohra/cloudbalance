package com.cloudbalance.service.impl;

import com.cloudbalance.model.User;
import com.cloudbalance.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Override
    public void sendPasswordResetEmail(User user, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            String subject = "CloudBalance - Password Reset";

            String htmlContent = """
                <html>
                    <body>
                        <p>Hello %s👋🏻,</p>
                        <p>You have requested to reset your password. Please click the link below to reset your password:</p>
                        <p><a href="%s">Reset Password</a></p>
                        <p>This link will expire in 30 minutes.</p>
                        <p>If you did not request a password reset, please ignore this email.</p>
                        <br>
                        <p><strong>Thank you,<br>Team CloudBalance</strong></p>
                    </body>
                </html>
                """.formatted(user.getFirstName(), resetUrl);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent to: {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

}