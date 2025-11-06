package fr.romaindu35.authserver.service;

import fr.romaindu35.authserver.dto.AuthorizationEventDTO;
import fr.romaindu35.authserver.dto.AuthorizationEventType;
import fr.romaindu35.authserver.entity.OAuth2AuthorizationGrantAuthorization;
import fr.romaindu35.authserver.entity.OAuth2AuthorizationHistory;
import fr.romaindu35.authserver.entity.OAuth2Client;
import fr.romaindu35.authserver.entity.User;
import fr.romaindu35.authserver.repository.OAuth2AuthorizationGrantAuthorizationRepository;
import fr.romaindu35.authserver.repository.OAuth2AuthorizationHistoryRepository;
import fr.romaindu35.authserver.repository.OAuth2ClientRepository;
import fr.romaindu35.authserver.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Service for revoking OAuth2 authorizations.
 * Handles revocation of authorization history and deletion of all associated tokens.
 */
@Service
@Slf4j
@AllArgsConstructor
public class OAuth2AuthorizationRevocationService {

    private final OAuth2AuthorizationHistoryRepository authorizationHistoryRepository;
    private final OAuth2AuthorizationGrantAuthorizationRepository authorizationGrantAuthorizationRepository;
    private final UserRepository userRepository;
    private final OAuth2ClientRepository clientRepository;

    /**
     * Revokes an authorization for a specific user and client.
     * This will:
     * 1. Mark the authorization history entry as revoked
     * 2. Delete all tokens (access tokens, refresh tokens) from Redis
     * 3. Keep the consent intact (user won't need to re-consent)
     *
     * @param userId the user's UUID
     * @param clientId the OAuth2 client ID
     * @return true if revocation was successful, false if no active authorization was found
     */
    @Transactional
    public boolean revokeAuthorization(UUID userId, String clientId) {
        log.info("Attempting to revoke authorization for user {} and client {}", userId, clientId);

        // Find and mark the active authorization history entry as revoked
        Optional<OAuth2AuthorizationHistory> activeAuth =
                authorizationHistoryRepository.findByUserIdAndClientIdAndIsActiveTrue(userId, clientId);

        if (activeAuth.isEmpty()) {
            log.warn("No active authorization found for user {} and client {}", userId, clientId);
            return false;
        }

        OAuth2AuthorizationHistory authorization = activeAuth.get();
        authorization.markAsRevoked();
        authorizationHistoryRepository.save(authorization);

        log.info("Authorization history marked as revoked for user {} and client {}", userId, clientId);

        // Find user to get principal name
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));

        // TODO: Vérifier si ce code fonctionne ou pas
        // Delete all tokens from Redis for this client-user pair
        List<OAuth2AuthorizationGrantAuthorization> authorizations =
                authorizationGrantAuthorizationRepository.findByRegisteredClientIdAndPrincipalName(
                        clientId, user.getUsername());

        int deletedCount = 0;
        for (OAuth2AuthorizationGrantAuthorization auth : authorizations) {
            authorizationGrantAuthorizationRepository.deleteById(auth.getId());
            deletedCount++;
        }

        log.info("Successfully revoked authorization for user {} and client {}. " +
                        "Deleted {} token entries from Redis.",
                userId, clientId, deletedCount);

        return true;
    }

    /**
     * Gets the authorization events for a specific user and client.
     * Transforms raw authorization history into typed events (AUTHORIZATION, SCOPE_ADDITION, REVOCATION).
     * Each event contains all metadata and is properly typed for frontend consumption.
     *
     * @param userId the user's UUID
     * @param clientId the OAuth2 client ID
     * @return List of authorization events sorted by timestamp DESC (most recent first)
     */
    public List<AuthorizationEventDTO> getAuthorizationEvents(UUID userId, String clientId) {
        log.debug("Getting authorization events for user {} and client {}", userId, clientId);

        // Récupérer l'historique complet pour ce user-client
        List<OAuth2AuthorizationHistory> history =
                authorizationHistoryRepository.findByUserIdAndClientIdOrderByGrantedAtAsc(userId, clientId);

        if (history.isEmpty()) {
            log.debug("No authorization history found for user {} and client {}", userId, clientId);
            return List.of();
        }

        // Récupérer les informations du client
        OAuth2Client client = clientRepository.findById(clientId).orElse(null);
        String clientName = client != null ? client.getClientName() : "Client inconnu";

        // Transformer l'historique en événements
        List<AuthorizationEventDTO> events = new ArrayList<>();
        boolean nextIsScopeAddition = false;
        // Parcourir l'historique en ordre ASC (plus vieux en premier). On viendra inverser à la fin. Ce choix est réalisé afin de plus facilement gérer l'ajout de scopes.
        for (OAuth2AuthorizationHistory historyItem : history) {
            if (!nextIsScopeAddition) {
                events.add(createEventDTO(historyItem, AuthorizationEventType.AUTHORIZATION, historyItem.getGrantedAt(), historyItem.getAuthorizedScopes(), clientName));
            } else {
                events.add(createEventDTO(historyItem, AuthorizationEventType.SCOPE_ADDITION, historyItem.getGrantedAt(), historyItem.getAuthorizedScopes(), clientName));
            }
            if (historyItem.getRevokedAt() != null) {
                // Sur les événements révoqués, on d'indique pas l'ip, le navigateur, etc.
                events.add(new AuthorizationEventDTO(
                        historyItem.getId(),
                        AuthorizationEventType.REVOCATION,
                        historyItem.getRevokedAt(),
                        Collections.emptySet(),
                        historyItem.getClientId(),
                        clientName,
                        null, null, null, null, null, null
                ));
            }
            // Si révoqué et nul, alors il s'agit d'un changement de scope
            nextIsScopeAddition = historyItem.getRevokedAt() == null && !historyItem.isActive();
        }

        log.debug("Transformed {} history entries into {} events for user {} and client {}",
                history.size(), events.size(), userId, clientId);

        return events.reversed();
    }

    /**
     * Helper method to create an AuthorizationEventDTO from an authorization history entry.
     */
    private AuthorizationEventDTO createEventDTO(
            OAuth2AuthorizationHistory auth,
            AuthorizationEventType eventType,
            Instant timestamp,
            Set<String> scopes,
            String clientName) {

        return new AuthorizationEventDTO(
                auth.getId(),
                eventType,
                timestamp,
                scopes,
                auth.getClientId(),
                clientName,
                auth.getIpAddress() != null ? auth.getIpAddress().getHostAddress() : null,
                auth.getBrowser(),
                auth.getDeviceType(),
                auth.getOs(),
                auth.getCountry() != null ? auth.getCountry() : "Inconnu",
                auth.getCity() != null ? auth.getCity() : "Inconnu"
        );
    }
}
