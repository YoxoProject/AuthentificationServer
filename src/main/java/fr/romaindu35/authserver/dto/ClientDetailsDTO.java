package fr.romaindu35.authserver.dto;

import jakarta.annotation.Nonnull;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO représentant tous les détails d'un client OAuth2.
 * Utilisé pour afficher les informations complètes sur la page /app/$clientId.
 */
public record ClientDetailsDTO(
        /**
         * Identifiant unique du client OAuth2
         */
        @Nonnull String id,

        /**
         * Configuration du client (nom, type, redirects, CORS, official)
         */
        @Nonnull ClientConfigurationDTO configuration,

        /**
         * Credentials du client (clientId et optionnellement clientSecret)
         */
        @Nonnull ClientCredentialsDTO credentials,

        /**
         * Date de création du client
         */
        @Nonnull Instant createdAt,

        /**
         * UUID du propriétaire du client
         */
        @Nonnull UUID ownerId,

        /**
         * Nom d'utilisateur du propriétaire
         */
        @Nonnull String ownerUsername
) {
}
