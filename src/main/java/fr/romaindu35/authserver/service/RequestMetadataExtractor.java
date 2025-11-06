package fr.romaindu35.authserver.service;

import eu.bitwalker.useragentutils.UserAgent;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;

import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * Service for extracting metadata from HTTP requests.
 * This service is request-scoped to have access to the current HttpServletRequest.
 *
 * Extracts:
 * - IP address (from headers or remote address)
 * - User-Agent details (browser, device type, OS)
 * - Geolocation (country, city) via GeoLocationService
 */
@Service
@RequestScope
@Slf4j
@AllArgsConstructor
public class RequestMetadataExtractor {

    private final HttpServletRequest request;
    private final GeoLocationService geoLocationService;

    /**
     * Extracts all metadata from the current HTTP request.
     *
     * @return RequestMetadata containing IP, user-agent details, and geolocation
     */
    public RequestMetadata extract() throws UnknownHostException {
        String ipAddress = extractIpAddress();
        String userAgent = extractUserAgent();

        // Parse user agent details
        UserAgent ua = UserAgent.parseUserAgentString(userAgent);
        String browser = ua.getBrowser() != null ? ua.getBrowser().getName() : null;
        String deviceType = ua.getOperatingSystem() != null ?
                ua.getOperatingSystem().getDeviceType().getName() : null;
        String os = ua.getOperatingSystem() != null ?
                ua.getOperatingSystem().getName() : null;

        // Get geolocation
        GeoLocationService.LocationInfo location = geoLocationService.getLocationFromIp(ipAddress);

        log.debug("Extracted request metadata: IP={}, Browser={}, Device={}, OS={}, Country={}, City={}",
                ipAddress, browser, deviceType, os, location.country(), location.city());

        return new RequestMetadata(
                InetAddress.getByName(ipAddress),
                userAgent,
                browser,
                deviceType,
                os,
                location.country(),
                location.city()
        );
    }

    /**
     * Extracts the client's IP address from the request.
     * Checks multiple headers in order: X-Forwarded-For, X-Real-IP, Proxy-Client-IP,
     * WL-Proxy-Client-IP, and falls back to remote address.
     *
     * @return the client's IP address
     */
    private String extractIpAddress() {
        String[] headerNames = {
                "X-Forwarded-For",
                "X-Real-IP",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR",
                "HTTP_X_FORWARDED",
                "HTTP_X_CLUSTER_CLIENT_IP",
                "HTTP_CLIENT_IP",
                "HTTP_FORWARDED_FOR",
                "HTTP_FORWARDED",
                "HTTP_VIA",
                "REMOTE_ADDR"
        };

        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2)
                // The first one is the original client
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                log.debug("IP address extracted from header {}: {}", header, ip);
                return ip;
            }
        }

        // Fallback to remote address
        String remoteAddr = request.getRemoteAddr();
        log.debug("IP address extracted from remote address: {}", remoteAddr);
        return remoteAddr;
    }

    /**
     * Extracts the User-Agent header from the request.
     *
     * @return the User-Agent string, or "Unknown" if not present
     */
    private String extractUserAgent() {
        String userAgent = request.getHeader("User-Agent");
        return (userAgent != null && !userAgent.isBlank()) ? userAgent : "Unknown";
    }

    /**
     * Immutable record containing metadata extracted from an HTTP request.
     * Used for tracking authorization grants with device and location information.
     *
     * @param ipAddress the client's IP address (from X-Forwarded-For, X-Real-IP, or remote address)
     * @param userAgent the full User-Agent header string
     * @param browser the browser name (e.g., "Chrome", "Firefox")
     * @param deviceType the device type (e.g., "Computer", "Mobile", "Tablet")
     * @param os the operating system (e.g., "Windows 10", "Android")
     * @param country the country name from geolocation (may be null)
     * @param city the city name from geolocation (may be null)
     */
    public record RequestMetadata(
            InetAddress ipAddress,
            String userAgent,
            String browser,
            String deviceType,
            String os,
            String country,
            String city
    ) {
    }
}
