package com.payTrackEdu.application.utils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

@Component
@RequiredArgsConstructor
public class SenderMail {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public String sendEmail(String subject,String sentTo,String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(from);
        helper.setTo(sentTo);
        helper.setSubject(subject);
        String htmlContent = buildEmailTemplate(subject,otp);
        helper.setText(htmlContent, true);
        mailSender.send(message);
        return "mail sent successfully";
    }

    private String buildEmailTemplate(String subject, String otp) {
        String escapedOtp = HtmlUtils.htmlEscape(otp);
        return "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>" +
                "<body style='margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;'>" +
                "<table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f4f4f4;padding:20px;'><tr><td align='center'>" +
                "<table width='600' cellpadding='0' cellspacing='0' style='background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);'>" +
                "<tr><td style='background:linear-gradient(135deg,#2563eb 0%,#1e40af 100%);padding:40px 20px;text-align:center;'>" +
                "<h1 style='color:#ffffff;margin:0;font-size:28px;'>payTrackEdu</h1></td></tr>" +
                "<tr><td style='padding:40px 30px;'>" +
                "<h2 style='color:#333333;margin:0 0 20px;font-size:24px;text-align:center;'>" + HtmlUtils.htmlEscape(subject) + "</h2>" +
                "<p style='color:#666666;font-size:16px;line-height:24px;margin:0 0 30px;text-align:center;'>Use this one-time password to reset your password:</p>" +
                "<p style='margin:0 0 30px;text-align:center;'><span style='display:inline-block;background-color:#eff6ff;border:2px dashed #2563eb;border-radius:8px;padding:16px 24px;color:#1e40af;font-size:32px;font-weight:bold;letter-spacing:8px;font-family:monospace;'>" + escapedOtp + "</span></p>" +
                "<p style='color:#999999;font-size:14px;line-height:20px;margin:0;text-align:center;'>This OTP expires in 2 minutes and can be used once. Do not share it with anyone.</p>" +
                "</td></tr>" +
                "<tr><td style='background-color:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #e0e0e0;'>" +
                "<p style='color:#999999;font-size:14px;margin:0;'>If you did not request a password reset, you can safely ignore this email.</p>" +
                "</td></tr></table></td></tr></table></body></html>";
    }



}
