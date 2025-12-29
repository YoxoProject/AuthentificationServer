package fr.romaindu35.authserver.service;

import fr.romaindu35.authserver.dto.AuthorizationEventDTO;
import fr.romaindu35.authserver.dto.AuthorizationEventType;
import fr.romaindu35.authserver.entity.OAuth2AuthorizationHistory;
import fr.romaindu35.authserver.entity.OAuth2Client;
import fr.romaindu35.authserver.entity.User;
import fr.romaindu35.authserver.repository.OAuth2AuthorizationHistoryRepository;
import fr.romaindu35.authserver.repository.OAuth2ClientRepository;
import fr.romaindu35.authserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsent;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
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
 * Handles revocation of authorization history and invalidation of all associated tokens.
 */
@Slf4j
@RequiredArgsConstructor
public class OAuth2AuthorizationRevocationService {

    private final OAuth2AuthorizationHistoryRepository authorizationHistoryRepository;
    // Use specific JDBC service to avoid circular dependency with TrackingService
    private final JdbcOAuth2AuthorizationService authorizationService;
    private final OAuth2AuthorizationConsentService authorizationConsentService;
    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final OAuth2ClientRepository clientRepository;

    /**
     * Revokes an authorization for a specific user and client (Manual User Action).
     * This will:
     * 1. Mark the authorization history entry as revoked (revokedAt = now).
     * 2. Invalidate ALL technical tokens (Access, Refresh) for this client.
     * 3. Remove the user consent for this client.
     */
    @Transactional
    public boolean revokeAuthorization(UUID userId, UUID clientId) {
        log.info("Manual revocation requested for user {} and client {}", userId, clientId);

        // 1. Mark History as REVOKED
        Optional<OAuth2AuthorizationHistory> activeAuth =
                authorizationHistoryRepository.findByUserIdAndClientIdAndIsActiveTrue(userId, clientId);

        if (activeAuth.isPresent()) {
            OAuth2AuthorizationHistory authorizationHistory = activeAuth.get();
            authorizationHistory.markAsRevoked();
            authorizationHistoryRepository.save(authorizationHistory);
            log.info("Authorization history marked as revoked.");
        } else {
            log.warn("No active authorization history found to revoke.");
        }

        // 2. Invalidate Technical Tokens (No exclusion)
        int invalidatedCount = invalidateAllTokens(userId, clientId, null);
        log.info("Invalidated {} authorization sessions.", invalidatedCount);

        // 3. Remove Consent
        User user = userRepository.findById(userId).orElseThrow();
        OAuth2AuthorizationConsent consent = authorizationConsentService.findById(clientId.toString(), user.getUsername());
        if (consent != null) {
            authorizationConsentService.remove(consent);
            log.info("Consent removed.");
        }

        return true;
    }

    /**
     * Invalidates ALL tokens for a specific user and client (Technical Action).
     * Used for enforcing Single Session policy or cleaning up during revocation.
     * Does NOT touch history or consents.
     *
     * @param excludedAuthorizationId Optional authorization ID to exclude from invalidation (e.g. current session)
     */
    @Transactional
    public int invalidateAllTokens(UUID userId, UUID clientId, String excludedAuthorizationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));

        String findIdsSql = "SELECT id FROM oauth2_authorization WHERE principal_name = ? AND registered_client_id = ?";
        List<String> authorizationIds = jdbcTemplate.queryForList(findIdsSql, String.class, user.getUsername(), clientId.toString());

        int invalidatedCount = 0;
        for (String authId : authorizationIds) {
            // SAFEGUARD: Don't invalidate the session we are currently creating/using!
            if (authId.equals(excludedAuthorizationId)) {
                continue;
            }
            log.info("Invalidating tokens for authorization ID {}", authId);

            OAuth2Authorization authorization = authorizationService.findById(authId);
            if (authorization == null) continue;

            // Optimisation: Don't invalidate if already invalidated
            if (isAlreadyInvalidated(authorization)) continue;

            OAuth2Authorization.Builder builder = OAuth2Authorization.from(authorization);
            boolean modified = false;

            // Invalidate Access Token
            if (authorization.getAccessToken() != null && !authorization.getAccessToken().isInvalidated()) {
                builder.token(authorization.getAccessToken().getToken(),
                        (metadata) -> metadata.put(OAuth2Authorization.Token.INVALIDATED_METADATA_NAME, true));
                modified = true;
            }

            // Invalidate Refresh Token
            if (authorization.getRefreshToken() != null && !authorization.getRefreshToken().isInvalidated()) {
                builder.token(authorization.getRefreshToken().getToken(),
                        (metadata) -> metadata.put(OAuth2Authorization.Token.INVALIDATED_METADATA_NAME, true));
                modified = true;
            }

            // Invalidate Authorization Code
            OAuth2Authorization.Token<OAuth2AuthorizationCode> authCode = authorization.getToken(OAuth2AuthorizationCode.class);
            if (authCode != null && !authCode.isInvalidated()) {
                builder.token(authCode.getToken(),
                        (metadata) -> metadata.put(OAuth2Authorization.Token.INVALIDATED_METADATA_NAME, true));
                modified = true;
            }

            if (modified) {
                authorizationService.save(builder.build());
                invalidatedCount++;
            }
        }
        return invalidatedCount;
    }

    private boolean isAlreadyInvalidated(OAuth2Authorization auth) {
        boolean accessInvalid = auth.getAccessToken() == null || auth.getAccessToken().isInvalidated();
        boolean refreshInvalid = auth.getRefreshToken() == null || auth.getRefreshToken().isInvalidated();
        return accessInvalid && refreshInvalid;
    }

    /**
     * Gets the authorization events for a specific user and client.
     * Transforms raw authorization history into typed events (AUTHORIZATION, SCOPE_ADDITION, REVOCATION).
     * Each event contains all metadata and is properly typed for frontend consumption.
     *
     * @param userId   the user's UUID
     * @param clientId the OAuth2 client ID
     * @return List of authorization events sorted by timestamp DESC (most recent first)
     */
    public List<AuthorizationEventDTO> getAuthorizationEvents(UUID userId, UUID clientId) {
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