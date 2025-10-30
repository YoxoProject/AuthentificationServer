package fr.romaindu35.authserver.dto;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

/**
 * DTO représentant les credentials d'un client OAuth2.
 * Utilisé dans l'onglet "Credentials" de la page de détails.
 * Le clientSecret est null pour les clients de type CLIENT (PKCE flow).
 */
public record ClientCredentialsDTO(
        /**
         * Identifiant client OAuth2 (utilisé pour l'authentification)
         */
        @Nonnull String clientId,

        /**
         * Secret du client (null pour les clients de type CLIENT)
         * Ce champ ne contient jamais le hash, seulement le secret en clair lors de la génération
         */
        @Nullable String clientSecret
) {
}
