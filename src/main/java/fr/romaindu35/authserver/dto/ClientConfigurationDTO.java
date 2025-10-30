package fr.romaindu35.authserver.dto;

import fr.romaindu35.authserver.entity.OAuth2Client;
import jakarta.annotation.Nonnull;

import java.util.Set;

/**
 * DTO représentant la configuration d'un client OAuth2.
 * Utilisé dans l'onglet "Configuration" de la page de détails.
 */
public record ClientConfigurationDTO(
        /**
         * Nom d'affichage du client
         */
        @Nonnull String clientName,

        /**
         * Type du client (CLIENT, SERVER, ou SERVICE)
         */
        @Nonnull OAuth2Client.ClientType clientType,

        /**
         * Liste des URIs de redirection autorisées pour l'authorization code flow
         */
        @Nonnull Set<String> redirectUris,

        /**
         * Liste des origines CORS autorisées (pour les clients de type CLIENT uniquement)
         */
        @Nonnull Set<String> corsUrls,

        /**
         * Indique si le client est officiel (bypass la page de consentement)
         */
        boolean official
) {
}
