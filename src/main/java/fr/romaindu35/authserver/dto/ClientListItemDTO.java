package fr.romaindu35.authserver.dto;

import fr.romaindu35.authserver.entity.OAuth2Client;
import jakarta.annotation.Nonnull;

import java.time.Instant;

/**
 * DTO représentant un élément de la liste des clients OAuth2.
 * Utilisé pour l'affichage dans la grille de cards sur la page /app.
 */
public record ClientListItemDTO(
        /**
         * Identifiant unique du client OAuth2
         */
        @Nonnull String id,

        /**
         * Nom d'affichage du client
         */
        @Nonnull String clientName,

        /**
         * Type du client (CLIENT, SERVER, ou SERVICE)
         */
        @Nonnull OAuth2Client.ClientType clientType,

        /**
         * Date de création du client
         */
        @Nonnull Instant createdAt,

        /**
         * Indique si le client est officiel (bypass consent)
         */
        boolean official
) {
}