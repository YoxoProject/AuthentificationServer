package fr.romaindu35.authserver.dto;

import jakarta.annotation.Nonnull;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * DTO représentant un événement d'autorisation dans l'historique d'un utilisateur.
 * Chaque événement capture un moment significatif dans le cycle de vie d'une autorisation OAuth2,
 * avec toutes les métadonnées contextuelles au moment de l'événement.
 */
public record AuthorizationEventDTO(
        /**
         * Identifiant unique de l'événement (correspond à l'ID de l'entrée d'historique).
         */
        @Nonnull UUID id,

        /**
         * Type de l'événement (autorisation initiale, ajout de scopes, ou révocation).
         */
        @Nonnull AuthorizationEventType eventType,

        /**
         * Timestamp de l'événement.
         * Pour les autorisations et ajouts de scopes : correspond à grantedAt.
         * Pour les révocations : correspond à revokedAt.
         */
        @Nonnull Instant timestamp,

        /**
         * Ensemble des scopes concernés par cet événement.
         * - Pour AUTHORIZATION : tous les scopes initialement autorisés
         * - Pour SCOPE_ADDITION : tous les scopes de la nouvelle autorisation (incluant les anciens)
         * - Pour REVOCATION : null (les scopes ne sont pas pertinents pour une révocation)
         */
        @Nonnull Set<String> scopes,

        /**
         * Identifiant du client OAuth2 concerné.
         */
        @Nonnull UUID clientId,

        /**
         * Nom d'affichage du client OAuth2.
         */
        @Nonnull String clientName,

        /**
         * Adresse IP du client au moment de l'événement.
         */
        String ipAddress,

        /**
         * Nom du navigateur utilisé.
         */
        String browser,

        /**
         * Type d'appareil (Computer, Mobile, Tablet).
         */
        String deviceType,

        /**
         * Système d'exploitation utilisé.
         */
        String os,

        /**
         * Pays déterminé par géolocalisation de l'IP.
         */
        String country,

        /**
         * Ville déterminée par géolocalisation de l'IP.
         */
        String city
) {
}
