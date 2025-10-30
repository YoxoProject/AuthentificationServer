package fr.romaindu35.authserver.auth.controller;

import com.vaadin.hilla.BrowserCallable;
import fr.romaindu35.authserver.dto.ClientConfigurationDTO;
import fr.romaindu35.authserver.dto.ClientDetailsDTO;
import fr.romaindu35.authserver.dto.ClientListItemDTO;
import fr.romaindu35.authserver.entity.User;
import fr.romaindu35.authserver.repository.UserRepository;
import fr.romaindu35.authserver.service.ClientManagementService;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

/**
 * Contrôleur Hilla pour la gestion des clients OAuth2.
 * Expose les endpoints via BrowserCallable pour l'interface React.
 * Accessible uniquement aux utilisateurs authentifiés.
 */
@BrowserCallable
@PermitAll
@RequiredArgsConstructor
public class ClientManagementController {

    private final ClientManagementService clientManagementService;
    private final UserRepository userRepository;

    /**
     * Crée un nouveau client OAuth2 avec uniquement un nom.
     * Le client est créé avec des valeurs par défaut (type CLIENT, etc.).
     *
     * @param clientName Nom du client à créer
     * @return L'identifiant unique du client créé
     */
    public String createClient(String clientName) {
        User currentUser = getCurrentUser();
        return clientManagementService.createClient(clientName, currentUser.getId());
    }

    /**
     * Récupère la liste de tous les clients OAuth2 de l'utilisateur connecté.
     *
     * @return Liste des clients sous forme de DTOs simplifiés
     */
    public List<ClientListItemDTO> getMyClients() {
        User currentUser = getCurrentUser();
        return clientManagementService.getClientsByOwner(currentUser.getId());
    }

    /**
     * Récupère tous les détails d'un client OAuth2.
     * Vérifie automatiquement que l'utilisateur est le propriétaire.
     *
     * @param clientId Identifiant unique du client
     * @return Détails complets du client
     */
    public ClientDetailsDTO getClientDetails(String clientId) {
        User currentUser = getCurrentUser();
        return clientManagementService.getClientDetails(clientId, currentUser.getId());
    }

    /**
     * Met à jour la configuration d'un client OAuth2.
     *
     * @param clientId      Identifiant unique du client
     * @param configuration Nouvelle configuration
     */
    public void updateClientConfiguration(String clientId, ClientConfigurationDTO configuration) {
        User currentUser = getCurrentUser();
        clientManagementService.updateClientConfiguration(clientId, configuration, currentUser.getId());
    }

    /**
     * Régénère le client ID d'un client OAuth2.
     * ATTENTION: Cette opération invalidera toutes les configurations existantes.
     *
     * @param clientId Identifiant unique du client
     * @return Le nouveau client ID en clair
     */
    public String regenerateClientId(String clientId) {
        User currentUser = getCurrentUser();
        return clientManagementService.regenerateClientId(clientId, currentUser.getId());
    }

    /**
     * Régénère le client secret d'un client OAuth2.
     * Cette méthode ne peut être appelée que pour les clients de type SERVER ou SERVICE.
     * Le secret en clair est retourné une seule fois.
     *
     * @param clientId Identifiant unique du client
     * @return Le nouveau secret en clair
     */
    public String regenerateClientSecret(String clientId) {
        User currentUser = getCurrentUser();
        return clientManagementService.regenerateClientSecret(clientId, currentUser.getId());
    }

    /**
     * Supprime un client OAuth2.
     * ATTENTION: Cette opération est irréversible.
     *
     * @param clientId Identifiant unique du client
     */
    public void deleteClient(String clientId) {
        User currentUser = getCurrentUser();
        clientManagementService.deleteClient(clientId, currentUser.getId());
    }

    /**
     * Récupère l'utilisateur actuellement connecté depuis le contexte de sécurité.
     *
     * @return L'utilisateur connecté
     * @throws IllegalStateException si aucun utilisateur n'est connecté
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Aucun utilisateur authentifié");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable: " + username));
    }
}
