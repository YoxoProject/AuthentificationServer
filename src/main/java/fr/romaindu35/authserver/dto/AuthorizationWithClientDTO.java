package fr.romaindu35.authserver.dto;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * DTO representing an OAuth2 authorization with enriched client information.
 * Used for displaying authorization history in the /connections page.
 */
public record AuthorizationWithClientDTO(
        /**
         * Unique identifier of the authorization history entry
         */
        @Nonnull UUID id,

        /**
         * Immutable client ID (UUID from oauth2_client table)
         */
        @Nonnull UUID clientId,

        /**
         * Display name of the client
         */
        @Nonnull String clientName,

        /**
         * Set of scopes authorized by the user
         */
        @Nonnull Set<String> authorizedScopes,

        /**
         * IP address from which the authorization was granted
         */
        @Nonnull String ipAddress,

        /**
         * Browser name (parsed from user agent)
         */
        @Nullable String browser,

        /**
         * Device type (Computer, Mobile, Tablet)
         */
        @Nullable String deviceType,

        /**
         * Operating system
         */
        @Nullable String os,

        /**
         * Country from geolocation
         */
        @Nullable String country,

        /**
         * City from geolocation
         */
        @Nullable String city,

        /**
         * Timestamp when the authorization was granted
         */
        @Nonnull Instant grantedAt,

        /**
         * Timestamp when the authorization was revoked (null if not revoked)
         */
        @Nullable Instant revokedAt,

        /**
         * Whether this authorization is currently active
         */
        boolean isActive
) {
}
