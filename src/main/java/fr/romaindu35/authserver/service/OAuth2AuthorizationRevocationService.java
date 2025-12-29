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
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsent;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Service for revoking OAuth2 authorizations.
 * Handles revocation of authorization history and invalidation of all associated tokens.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class OAuth2AuthorizationRevocationService {

    private final OAuth2AuthorizationHistoryRepository authorizationHistoryRepository;
    private final OAuth2AuthorizationService authorizationService;
    private final OAuth2AuthorizationConsentService authorizationConsentService;
    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final OAuth2ClientRepository clientRepository;

    /**
     * Revokes an authorization for a specific user and client.
     * This will:
     * 1. Mark the authorization history entry as revoked
     * 2. Find all active authorizations for this user/client pair
     * 3. Mark their tokens (Access, Refresh, Code) as invalidated in the database
     * 4. Remove the user consent for this client
     *
     * @param userId the user's UUID
     * @param clientId the OAuth2 client ID
     * @return true if revocation was successful (history found), false otherwise
     */
    @Transactional
    public boolean revokeAuthorization(UUID userId, UUID clientId) {
        log.info("Attempting to revoke authorization for user {} and client {}", userId, clientId);

        // 1. Mark history as revoked
        Optional<OAuth2AuthorizationHistory> activeAuth =
                authorizationHistoryRepository.findByUserIdAndClientIdAndIsActiveTrue(userId, clientId);

        if (activeAuth.isEmpty()) {
            log.warn("No active authorization history found for user {} and client {}", userId, clientId);
            return false;
        }

        OAuth2AuthorizationHistory authorizationHistory = activeAuth.get();
        authorizationHistory.markAsRevoked();
        authorizationHistoryRepository.save(authorizationHistory);

        log.info("Authorization history marked as revoked for user {} and client {}", userId, clientId);

        // 2. Find User Principal Name
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));

        // 3. Find and Invalidate all Spring Authorization Server sessions
        // Since the standard service doesn't support finding by User+Client, we query IDs manually via JDBC
        String findIdsSql = "SELECT id FROM oauth2_authorization WHERE principal_name = ? AND registered_client_id = ?";
        List<String> authorizationIds = jdbcTemplate.queryForList(findIdsSql, String.class, user.getUsername(), clientId.toString());

        int invalidatedCount = 0;
        for (String authId : authorizationIds) {
            OAuth2Authorization authorization = authorizationService.findById(authId);
            if (authorization == null) continue;

            OAuth2Authorization.Builder builder = OAuth2Authorization.from(authorization);
            boolean modified = false;

            // Invalidate Access Token
            OAuth2Authorization.Token<OAuth2AccessToken> accessToken = authorization.getAccessToken();
            if (accessToken != null && !accessToken.isInvalidated()) {
                builder.token(accessToken.getToken(),
                        (metadata) -> metadata.put(OAuth2Authorization.Token.INVALIDATED_METADATA_NAME, true));
                modified = true;
            }

            // Invalidate Refresh Token
            OAuth2Authorization.Token<OAuth2RefreshToken> refreshToken = authorization.getRefreshToken();
            if (refreshToken != null && !refreshToken.isInvalidated()) {
                builder.token(refreshToken.getToken(),
                        (metadata) -> metadata.put(OAuth2Authorization.Token.INVALIDATED_METADATA_NAME, true));
                modified = true;
            }

            // Invalidate Authorization Code (if exists and valid)
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

        log.info("Successfully revoked authorization for user {} and client {}. " +
                        "Invalidated {} authorization sessions.",
                userId, clientId, invalidatedCount);

        // 4. Remove Consent
        OAuth2AuthorizationConsent consent = authorizationConsentService.findById(clientId.toString(), user.getUsername());
        if (consent != null) {
            authorizationConsentService.remove(consent);
            log.info("Consent removed for user {} and client {}", user.getUsername(), clientId);
        } else {
            log.debug("No consent found to remove for user {} and client {}", user.getUsername(), clientId);
        }

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