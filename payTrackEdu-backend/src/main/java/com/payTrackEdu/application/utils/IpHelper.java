package com.payTrackEdu.application.utils;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;

public class IpHelper {

    private static final List<String> IP_HEADERS = List.of(
            "X-Forwarded-For",
            "X-Real-IP",
            "CF-Connecting-IP",
            "True-Client-IP",
            "Forwarded"
    );



    public static String getClientIp(HttpServletRequest request) {
        for (String header : IP_HEADERS) {
            String ip = request.getHeader(header);
            if (isValidIp(ip)) {
                return extractFirstIp(ip);
            }
        }
        return request.getRemoteAddr();
    }

    private static String extractFirstIp(String ip) {
        return ip.split(",")[0].trim();
    }

    private static boolean isValidIp(String ip) {
        if (!StringUtils.hasText(ip)) {
            return false;
        }
        if ("unknown".equalsIgnoreCase(ip)) {
            return false;
        }
        return isPublicIp(extractFirstIp(ip));
    }

    private static boolean isPublicIp(String ip) {
        try {
            InetAddress address = InetAddress.getByName(ip);
            return !(address.isAnyLocalAddress()
                    || address.isLoopbackAddress()
                    || address.isLinkLocalAddress()
                    || address.isSiteLocalAddress());
        } catch (UnknownHostException e) {
            return false;
        }
    }

}
