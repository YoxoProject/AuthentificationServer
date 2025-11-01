package fr.romaindu35.authserver.auth.controller;

import com.vaadin.hilla.BrowserCallable;
import fr.romaindu35.authserver.dto.UserInfo;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Contrôleur Hilla pour la gestion de l'authentification utilisateur.
 * Expose les endpoints pour l'AuthProvider de Hilla/React.
 */
@BrowserCallable
@PermitAll
public class UserController {

    /**
     * Récupère les informations de l'utilisateur actuellement authentifié.
     * Utilisé par le AuthProvider de Hilla pour gérer l'état d'authentification.
     *
     * @return Les informations de l'utilisateur si authentifié, null sinon
     */
    public UserInfo getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Vérifier si l'utilisateur est authentifié et que ce n'est pas anonymousUser
        if (authentication == null
            || !authentication.isAuthenticated()
            || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        String username = authentication.getName();
        return new UserInfo(username);
    }
}
