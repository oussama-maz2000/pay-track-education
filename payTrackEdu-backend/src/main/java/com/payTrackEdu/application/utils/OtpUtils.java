package com.payTrackEdu.application.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;

import static java.util.Objects.hash;

@Component
public  class OtpUtils {

    private static final SecureRandom RANDOM = new SecureRandom();
    private final SecretKeySpec key;

    public OtpUtils(@Value("${app.otp.secret}") String secret){
        this.key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }



    public  String generateOtp() {
        return String.format("%06d",  RANDOM.nextInt(1_000_000));
    }

    public boolean matches(String rawOtp, String expectedHash) {
        if (rawOtp == null || expectedHash == null) {
            return false;
        }
        try {
            byte[] actual = digest(rawOtp);
            byte[] expected = HexFormat.of().parseHex(expectedHash.trim());
            return MessageDigest.isEqual(actual, expected);
        } catch (IllegalArgumentException e) {
            return false; // stored value is not valid hex
        }
    }

    private byte[] digest(String otp) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(key);
            return mac.doFinal(otp.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    public String hash(String otp) {
        return HexFormat.of().formatHex(digest(otp));
    }
}
