package fr.romaindu35.authserver.dto;

/**
 * Type d'événement d'autorisation dans l'historique d'un utilisateur.
 * Ces événements représentent les actions significatives effectuées sur une autorisation OAuth2.
 */
public enum AuthorizationEventType {
    /**
     * Événement d'autorisation initiale - première fois que l'utilisateur consent à un client OAuth2.
     */
    AUTHORIZATION,

    /**
     * Événement d'ajout de scopes - l'utilisateur a consenti à des scopes supplémentaires
     * pour un client déjà autorisé.
     */
    SCOPE_ADDITION,

    /**
     * Événement de révocation - l'utilisateur a révoqué manuellement l'accès à un client.
     */
    REVOCATION
}
