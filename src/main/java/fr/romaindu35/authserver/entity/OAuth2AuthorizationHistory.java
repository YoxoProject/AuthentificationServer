package fr.romaindu35.authserver.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.net.InetAddress;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * Entity representing the history of OAuth2 authorizations granted by users to clients.
 * Tracks authorization grants with device metadata, geolocation, and revocation status.
 *
 * When scopes are added to an existing authorization, the old entry is marked as inactive
 * (is_active=false) without setting revoked_at, and a new entry is created.
 */
@Entity
@Table(name = "oauth2_authorization_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class OAuth2AuthorizationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "client_id", nullable = false)
    private String clientId;

    // Scopes granted - simple Set like OAuth2Client.redirectUris
    @Column(nullable = false)
    private Set<String> authorizedScopes;

    // Request metadata
    @Column(name = "ip_address", nullable = false)
    @JdbcTypeCode(SqlTypes.INET)
    private InetAddress ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "browser", length = 100)
    private String browser;

    @Column(name = "device_type", length = 50)
    private String deviceType;

    @Column(name = "os", length = 100)
    private String os;

    // Geolocation
    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "city", length = 100)
    private String city;

    // Lifecycle tracking
    @Column(name = "granted_at", nullable = false)
    private Instant grantedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    /**
     * Marks this authorization as revoked.
     * Sets revoked_at to current timestamp and is_active to false.
     */
    public void markAsRevoked() {
        this.revokedAt = Instant.now();
        this.isActive = false;
    }

    /**
     * Marks this authorization as inactive without setting revocation timestamp.
     * Used when scopes change and a new authorization entry is created.
     */
    public void markAsInactive() {
        this.isActive = false;
        // revoked_at remains null to indicate superseded, not revoked
    }
}
