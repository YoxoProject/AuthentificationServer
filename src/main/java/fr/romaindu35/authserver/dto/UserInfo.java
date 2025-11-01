package fr.romaindu35.authserver.dto;

import jakarta.annotation.Nonnull;

/**
 * DTO représentant les informations de l'utilisateur authentifié.
 * Utilisé par le AuthProvider de Hilla pour gérer l'état d'authentification.
 */
public record UserInfo(
        /**
         * Nom d'utilisateur de l'utilisateur connecté
         */
        @Nonnull String username
) {
}
