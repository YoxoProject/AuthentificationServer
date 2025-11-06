package fr.romaindu35.authserver.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * DTO représentant un événement d'autorisation dans l'historique d'un utilisateur.
 * Chaque événement capture un moment significatif dans le cycle de vie d'une autorisation OAuth2,
 * avec toutes les métadonnées contextuelles au moment de l'événement.
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AuthorizationEventDTO {
    /**
     * Identifiant unique de l'événement (correspond à l'ID de l'entrée d'historique).
     */
    private UUID id;

    /**
     * Type de l'événement (autorisation initiale, ajout de scopes, ou révocation).
     */
    private AuthorizationEventType eventType;

    /**
     * Timestamp de l'événement.
     * Pour les autorisations et ajouts de scopes : correspond à grantedAt.
     * Pour les révocations : correspond à revokedAt.
     */
    private Instant timestamp;

    /**
     * Ensemble des scopes concernés par cet événement.
     * - Pour AUTHORIZATION : tous les scopes initialement autorisés
     * - Pour SCOPE_ADDITION : tous les scopes de la nouvelle autorisation (incluant les anciens)
     * - Pour REVOCATION : null (les scopes ne sont pas pertinents pour une révocation)
     */
    private Set<String> scopes;

    /**
     * Identifiant du client OAuth2 concerné.
     */
    private String clientId;

    /**
     * Nom d'affichage du client OAuth2.
     */
    private String clientName;

    /**
     * Adresse IP du client au moment de l'événement.
     */
    private String ipAddress;

    /**
     * Nom du navigateur utilisé.
     */
    private String browser;

    /**
     * Type d'appareil (Computer, Mobile, Tablet).
     */
    private String deviceType;

    /**
     * Système d'exploitation utilisé.
     */
    private String os;

    /**
     * Pays déterminé par géolocalisation de l'IP.
     */
    private String country;

    /**
     * Ville déterminée par géolocalisation de l'IP.
     */
    private String city;
}
