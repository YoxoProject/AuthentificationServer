package fr.romaindu35.authserver.service;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;
import com.maxmind.geoip2.record.AbstractNamedRecord;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.util.Optional;

/**
 * Service for geolocation lookup using MaxMind GeoLite2 database.
 * Provides country and city information based on IP addresses.
 */
@Service
@Slf4j
public class GeoLocationService {

    private DatabaseReader databaseReader;

    @Value("${geoip.enabled}")
    private boolean geoIpEnabled;

    @Value("${geoip.database.path}")
    private String GEOIP_DATABASE_PATH;

    /**
     * Initializes the GeoIP database reader on application startup.
     * Logs a warning if the database file is not found.
     */
    @PostConstruct
    public void init() {
        if(!geoIpEnabled) {
            log.info("GeoIP lookup is disabled by configuration.");
            return;
        }
        File database = new File(GEOIP_DATABASE_PATH);
        if (!database.exists()) {
            log.warn("GeoIP database not found at: {}. Geolocation features will be unavailable.", GEOIP_DATABASE_PATH);
            return;
        }

        try {
            this.databaseReader = new DatabaseReader.Builder(database).build();
            log.info("GeoIP database loaded successfully from: {}", GEOIP_DATABASE_PATH);
        } catch (IOException e) {
            log.error("Failed to load GeoIP database from: {}", GEOIP_DATABASE_PATH, e);
        }
    }

    /**
     * Looks up geolocation information for the given IP address.
     *
     * @param ipAddress the IP address to look up (IPv4 or IPv6)
     * @return LocationInfo containing country and city, or empty values if lookup fails
     */
    public LocationInfo getLocationFromIp(String ipAddress) {
        if (databaseReader == null) {
            log.debug("GeoIP database not available, skipping geolocation for IP: {}", ipAddress);
            return new LocationInfo(null, null);
        }

        if (ipAddress == null || ipAddress.isBlank()) {
            log.debug("Invalid IP address provided: {}", ipAddress);
            return new LocationInfo(null, null);
        }

        // Skip private/local IP addresses
        if (isPrivateOrLocalIp(ipAddress)) {
            log.debug("Private or local IP address detected: {}, skipping geolocation", ipAddress);
            return new LocationInfo(null, null);
        }

        try {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            CityResponse response = databaseReader.city(inetAddress);

            String country = Optional.ofNullable(response.getCountry())
                    .map(AbstractNamedRecord::getName)
                    .orElse(null);

            String city = Optional.ofNullable(response.getCity())
                    .map(AbstractNamedRecord::getName)
                    .orElse(null);

            log.debug("Geolocation found for IP {}: country={}, city={}", ipAddress, country, city);
            return new LocationInfo(country, city);

        } catch (IOException | GeoIp2Exception e) {
            log.debug("Failed to lookup geolocation for IP: {}", ipAddress, e);
            return new LocationInfo(null, null);
        }
    }

    /**
     * Checks if the IP address is private or local (loopback, link-local, etc.)
     *
     * @param ipAddress the IP address to check
     * @return true if the IP is private or local
     */
    private boolean isPrivateOrLocalIp(String ipAddress) {
        try {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            return inetAddress.isLoopbackAddress() ||
                   inetAddress.isLinkLocalAddress() ||
                   inetAddress.isSiteLocalAddress() ||
                   inetAddress.isAnyLocalAddress();
        } catch (Exception e) {
            log.debug("Failed to parse IP address: {}", ipAddress, e);
            return false;
        }
    }

    /**
     * Record containing geolocation information.
     *
     * @param country the country name (may be null)
     * @param city the city name (may be null)
     */
    public record LocationInfo(String country, String city) {
    }
}
