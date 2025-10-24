package com.kanjimaster.backend.service.impl;

import com.kanjimaster.backend.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailServiceImpl implements EmailService {
    JavaMailSender javaMailSender;
    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Value("${kanji.master.frontend.url}")
    @NonFinal
    String frontendUrl;

    @Async("taskExecutor")
    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        String subject = "[Kanji Master] Vui lòng xác thực email của bạn";
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;

        log.info("Đang tạo email xác thực cho {}. Đường link: {}", toEmail, verificationUrl);

        String containerColor = "#ffffff";
        String textColor = "#2d3748";
        String buttonTextColor = "#ffffff";
        String borderColor = "#e2e8f0";
        String secondaryTextColor = "#64748b";

        String htmlContent = "<!DOCTYPE html>"
                + "<html lang=\"vi\">"
                + "<head>"
                + "  <meta charset=\"UTF-8\">"
                + "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                + "  <title>Xác thực Email</title>"
                + "</head>"
                + "<body style=\"margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #fef5f8 0%, #fef8fa 50%, #ffffff 100%);\">"
                + "  <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">"
                + "    <tr>"
                + "      <td align=\"center\" style=\"padding: 40px 20px;\">"
                + "        <!-- Container chính -->"
                + "        <table width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: " + containerColor + "; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(47, 68, 84, 0.08); border: 1px solid #f5e9ee;\">"
                + "          <tr>"
                + "            <td style=\"padding: 48px 40px;\">"
                + "              <!-- Logo/Brand -->"
                + "              <div style=\"text-align: center; margin-bottom: 32px;\">"
                + "                <div style=\"display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #2F4454 0%, #DA7B93 100%); border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(47, 68, 84, 0.2);\">"
                + "                  <span style=\"color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;\">漢</span>"
                + "                </div>"
                + "                <h1 style=\"background: linear-gradient(135deg, #2F4454 0%, #2E151B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;\">Kanji Master</h1>"
                + "              </div>"
                + "              <!-- Nội dung -->"
                + "              <div style=\"text-align: center; margin-bottom: 32px;\">"
                + "                <h2 style=\"color: #2F4454; font-size: 20px; margin: 0 0 16px; font-weight: 600;\">Chào mừng bạn đến với Kanji Master! </h2>"
                + "                <p style=\"color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;\">"
                + "                  Vui lòng nhấp vào nút bên dưới để kích hoạt tài khoản và bắt đầu hành trình học tiếng Nhật của bạn."
                + "                </p>"
                + "              </div>"
                + "              <!-- Nút CTA -->"
                + "              <table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin: 0 auto 32px;\">"
                + "                <tr>"
                + "                  <td align=\"center\" style=\"background: linear-gradient(135deg, #2E151B 0%, #DA7B93 100%); border-radius: 10px; box-shadow: 0 6px 16px rgba(47, 68, 84, 0.25);\">"
                + "                    <a href=\"" + verificationUrl + "\" target=\"_blank\" style=\"display: inline-block; padding: 15px 36px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;\">"
                + "                      Kích hoạt tài khoản"
                + "                    </a>"
                + "                  </td>"
                + "                </tr>"
                + "              </table>"
                + "              <!-- Info box -->"
                + "              <div style=\"background: linear-gradient(135deg, #fef5f8 0%, #fef8fa 100%); border-left: 4px solid #DA7B93; padding: 16px; border-radius: 8px; margin-bottom: 24px;\">"
                + "                <p style=\"color: #2E151B; font-size: 14px; line-height: 1.5; margin: 0; font-weight: 500;\">"
                + "                  Đường link này sẽ hết hạn sau 15 phút."
                + "                </p>"
                + "              </div>"
                + "              <!-- Divider -->"
                + "              <div style=\"border-top: 1px solid #f5e9ee; margin: 32px 0;\"></div>"
                + "              <!-- Footer -->"
                + "              <p style=\"color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;\">"
                + "                Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này."
                + "              </p>"
                + "              <p style=\"color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 12px 0 0; text-align: center;\">"
                + "                © 2025 Kanji Master. All rights reserved."
                + "              </p>"
                + "            </td>"
                + "          </tr>"
                + "        </table>"
                + "      </td>"
                + "    </tr>"
                + "  </table>"
                + "</body>"
                + "</html>";

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("no-reply@kanjimaster.com", "Kanji Master");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(message);
            log.info("Email xác thực đã gửi thành công tới {}", toEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Gửi email thất bại tới {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Gửi email thất bại: " + e.getMessage(), e);
        }
    }
}