package fr.romaindu35.authserver.service;

import fr.romaindu35.authserver.entity.OAuth2AuthorizationHistory;
import fr.romaindu35.authserver.entity.OAuth2Client;
import fr.romaindu35.authserver.entity.User;
import fr.romaindu35.authserver.repository.OAuth2AuthorizationHistoryRepository;
import fr.romaindu35.authserver.repository.OAuth2ClientRepository;
import fr.romaindu35.authserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Centralized service for tracking OAuth2 authorization grants.
 * Records authorization history (Logins) based on unique Spring Authorization IDs.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class OAuth2AuthorizationTrackingService {

    private final OAuth2AuthorizationHistoryRepository authorizationHistoryRepository;
    private final RequestMetadataExtractor requestMetadataExtractor;
    private final UserRepository userRepository;
    private final OAuth2ClientRepository clientRepository;
    private final OAuth2AuthorizationRevocationService revocationService;

    /**
     * Enforces single session policy for SERVER (Confidential) clients.
     * Revokes any existing active authorization for the user/client pair before a new login.
     */
    @Transactional
    public void enforceSingleSession(OAuth2Authorization authorization) {
        // CRITICAL FIX: getAuthorizationGrantType() returns the INITIAL grant type (e.g. AUTHORIZATION_CODE)
        // even during a Refresh Token flow. We must ensure we are NOT in a refresh flow.
        // If the authorization ID is already tracked in history, it means this is a Refresh/Update, NOT a new Login.
        if (authorizationHistoryRepository.findByAuthorizationId(authorization.getId()).isPresent()) {
            return;
        }

        // Only applies to Authorization Code flow (initial login)
        if (!AuthorizationGrantType.AUTHORIZATION_CODE.equals(authorization.getAuthorizationGrantType())) {
            return;
        }

        // Wait until we have an access token (end of flow) to be sure
        if (authorization.getAccessToken() == null) return;

        UUID clientId = UUID.fromString(authorization.getRegisteredClientId());
        OAuth2Client client = clientRepository.findById(clientId).orElse(null);

        if (client != null && client.getClientType() == OAuth2Client.ClientType.SERVER) {
            String principalName = authorization.getPrincipalName();
            userRepository.findByUsername(principalName).ifPresent(user -> {
                log.info("Enforcing single session for user {} and client {} (keep authorization {})", principalName, clientId, authorization.getId());
                // We revoke ALL previous sessions found in history.
                // Since this is a NEW login (checked above), we are safe.
                // We pass the CURRENT authorization ID to exclude it from invalidation (safeguard).
                revocationService.invalidateAllTokens(user.getId(), clientId, authorization.getId());
            });
        }
    }

    /**
     * Tracks the authorization history.
     * Logic based on Spring Authorization ID uniqueness:
     * - ID exists in History -> It's a Refresh/Update -> IGNORE.
     * - ID unknown in History -> It's a New Login -> CREATE History & Enforce Session.
     */
    @Transactional
    public void track(OAuth2Authorization authorization) {
        if (authorization.getAccessToken() == null) {
            return;
        }

        // Check if this specific authorization session is already tracked
        if (authorizationHistoryRepository.findByAuthorizationId(authorization.getId()).isPresent()) {
            // It's just a refresh or update of an existing session.
            // We do NOT touch the history.
            return;
        }

        // --- It's a NEW Session ---
        try {
            // 1. Enforce Single Session Policy (if applicable)
            enforceSingleSession(authorization);

            // 2. Manage History (Archive old, Create new)
            createSessionHistory(authorization);

        } catch (Exception e) {
            log.error("Failed to track authorization for user {} and client {}",
                    authorization.getPrincipalName(),
                    authorization.getRegisteredClientId(), e);
        }
    }

    private void createSessionHistory(OAuth2Authorization authorization) {
        String principalName = authorization.getPrincipalName();
        UUID clientId = UUID.fromString(authorization.getRegisteredClientId());
        Set<String> scopes = authorization.getAuthorizedScopes();

        User user = userRepository.findByUsername(principalName)
                .orElseThrow(() -> new IllegalStateException("User not found: " + principalName));

        // Archive any PREVIOUS active history for this user/client
        // (This handles the visual "History" list in frontend)
        Optional<OAuth2AuthorizationHistory> existingAuth =
                authorizationHistoryRepository.findByUserIdAndClientIdAndIsActiveTrue(user.getId(), clientId);

        if (existingAuth.isPresent()) {
            OAuth2AuthorizationHistory existing = existingAuth.get();
            log.info("New login detected for user {} and client {}. Archiving old session.", user.getId(), clientId);
            existing.markAsInactive();
            authorizationHistoryRepository.save(existing);
        }

        createNewHistory(user, clientId, scopes, authorization.getId());
    }

    private void createNewHistory(User user, UUID clientId, Set<String> scopes, String authorizationId) {
        try {
            RequestMetadataExtractor.RequestMetadata metadata = requestMetadataExtractor.extract();

            OAuth2AuthorizationHistory history = OAuth2AuthorizationHistory.builder()
                    .userId(user.getId())
                    .clientId(clientId)
                    .authorizedScopes(new HashSet<>(scopes))
                    .authorizationId(authorizationId) // Link to Spring ID
                    .ipAddress(metadata.ipAddress())
                    .userAgent(metadata.userAgent())
                    .browser(metadata.browser())
                    .deviceType(metadata.deviceType())
                    .os(metadata.os())
                    .country(metadata.country())
                    .city(metadata.city())
                    .grantedAt(Instant.now())
                    .isActive(true)
                    .build();

            authorizationHistoryRepository.save(history);
        } catch (Exception e) {
            log.warn("Failed to extract metadata or save history", e);
        }
    }
}
