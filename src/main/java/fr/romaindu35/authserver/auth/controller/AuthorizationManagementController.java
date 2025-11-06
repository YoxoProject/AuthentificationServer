package fr.romaindu35.authserver.auth.controller;

import com.vaadin.hilla.BrowserCallable;
import fr.romaindu35.authserver.dto.AuthorizationEventDTO;
import fr.romaindu35.authserver.dto.AuthorizationWithClientDTO;
import fr.romaindu35.authserver.entity.OAuth2AuthorizationHistory;
import fr.romaindu35.authserver.entity.OAuth2Client;
import fr.romaindu35.authserver.entity.User;
import fr.romaindu35.authserver.repository.OAuth2AuthorizationHistoryRepository;
import fr.romaindu35.authserver.repository.OAuth2ClientRepository;
import fr.romaindu35.authserver.repository.UserRepository;
import fr.romaindu35.authserver.service.OAuth2AuthorizationRevocationService;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Contrôleur Hilla pour la gestion des autorisations OAuth2.
 * Expose les endpoints via BrowserCallable pour l'interface React /connections.
 * Accessible uniquement aux utilisateurs authentifiés.
 */
@BrowserCallable
@PermitAll
@RequiredArgsConstructor
public class AuthorizationManagementController {

    private final OAuth2AuthorizationRevocationService revocationService;
    private final OAuth2AuthorizationHistoryRepository authorizationHistoryRepository;
    private final OAuth2ClientRepository clientRepository;
    private final UserRepository userRepository;

    /**
     * Récupère toutes les autorisations actives de l'utilisateur connecté.
     * Enrichit les données avec les informations du client.
     *
     * @return Liste des autorisations actives triées par grantedAt DESC
     */
    public List<AuthorizationWithClientDTO> getMyActiveAuthorizations() {
        User currentUser = getCurrentUser();
        List<OAuth2AuthorizationHistory> activeAuthorizations = authorizationHistoryRepository
                .findActiveAuthorizationsByUserId(currentUser.getId());

        return enrichWithClientInfo(activeAuthorizations);
    }

    /**
     * Récupère toutes les autorisations inactives de l'utilisateur connecté.
     * Ne retourne qu'une seule autorisation par clientId (la plus récente).
     * Exclut les clients qui ont déjà une autorisation active.
     * Enrichit les données avec les informations du client.
     *
     * @return Liste des autorisations inactives triées par revokedAt DESC (une par client)
     */
    public List<AuthorizationWithClientDTO> getMyInactiveAuthorizations() {
        User currentUser = getCurrentUser();
        List<OAuth2AuthorizationHistory> inactiveAuthorizations = authorizationHistoryRepository
                .findInactiveAuthorizationsWithoutActiveByUserId(currentUser.getId());

        return enrichWithClientInfo(inactiveAuthorizations);
    }

    /**
     * Récupère l'historique des événements d'autorisation pour un client spécifique.
     * Chaque événement est typé (AUTHORIZATION, SCOPE_ADDITION, REVOCATION) et contient
     * toutes les métadonnées nécessaires à l'affichage.
     *
     * @param clientId UUID immuable du client
     * @return Liste des événements d'autorisation triée par timestamp DESC (plus récent en premier)
     */
    public List<AuthorizationEventDTO> getAuthorizationEvents(UUID clientId) {
        User currentUser = getCurrentUser();

        return revocationService.getAuthorizationEvents(currentUser.getId(), clientId);
    }

    /**
     * Révoque une autorisation active pour un client spécifique.
     *
     * @param clientId UUID immuable du client
     * @return true si la révocation a réussi, false sinon
     */
    public boolean revokeAuthorization(UUID clientId) {
        User currentUser = getCurrentUser();

        return revocationService.revokeAuthorization(currentUser.getId(), clientId);
    }

    /**
     * Récupère l'utilisateur actuellement connecté.
     *
     * @return L'utilisateur connecté
     * @throws IllegalStateException si aucun utilisateur n'est connecté
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found: " + username));
    }

    /**
     * Enrichit les autorisations avec les informations du client.
     *
     * @param authorizations Liste des autorisations à enrichir
     * @return Liste des DTOs enrichis
     */
    private List<AuthorizationWithClientDTO> enrichWithClientInfo(List<OAuth2AuthorizationHistory> authorizations) {
        return authorizations.stream()
                .map(auth -> {
                    // Trouver le client par son id immuable
                    OAuth2Client client = clientRepository.findById(auth.getClientId())
                            .orElse(null);

                    String clientName = client != null ? client.getClientName() : "Client inconnu";
                    UUID clientUuid = client != null ? client.getId() : UUID.randomUUID();

                    return new AuthorizationWithClientDTO(
                            auth.getId(),
                            clientUuid,
                            clientName,
                            auth.getAuthorizedScopes(),
                            auth.getIpAddress().getHostAddress(),
                            auth.getBrowser(),
                            auth.getDeviceType(),
                            auth.getOs(),
                            auth.getCountry(),
                            auth.getCity(),
                            auth.getGrantedAt(),
                            auth.getRevokedAt(),
                            auth.isActive()
                    );
                })
                .collect(Collectors.toList());
    }
}
