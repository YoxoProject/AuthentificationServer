package fr.romaindu35.authserver.service;

import fr.romaindu35.authserver.entity.OAuth2AuthorizationHistory;
import fr.romaindu35.authserver.entity.User;
import fr.romaindu35.authserver.repository.OAuth2AuthorizationHistoryRepository;
import fr.romaindu35.authserver.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode;
import org.springframework.stereotype.Service;

import java.net.UnknownHostException;
import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Centralized service for tracking OAuth2 authorization grants.
 * Records authorization history with device metadata, geolocation, and scope changes.
 */
@Service
@Slf4j
@AllArgsConstructor
public class OAuth2AuthorizationTrackingService {

    private final OAuth2AuthorizationHistoryRepository authorizationHistoryRepository;
    private final RequestMetadataExtractor requestMetadataExtractor;
    private final UserRepository userRepository;

    /**
     * Tracks an OAuth2 authorization if it's a new grant.
     * This is the single entry point for authorization tracking.
     *
     * @param authorization the authorization to potentially track
     */
    public void trackIfNew(OAuth2Authorization authorization) {
        if (!isNewAuthorizationGrant(authorization)) {
            return;
        }

        try {
            recordAuthorizationHistory(authorization);
        } catch (SkipTrackingException e) {
            // Scopes haven't changed, skip tracking
            log.debug("Skipping authorization tracking for user {} and client {} as scopes haven't changed.",
                    authorization.getPrincipalName(),
                    authorization.getRegisteredClientId());
        } catch (Exception e) {
            // Log error but don't fail the authorization process
            log.error("Failed to record authorization history for user {} and client {}",
                    authorization.getPrincipalName(),
                    authorization.getRegisteredClientId(), e);
        }
    }

    /**
     * Checks if this is a NEW authorization grant (as opposed to a token refresh or update).
     * A new grant has an authorization code but no access token yet.
     *
     * @param authorization the authorization to check
     * @return true if this is a new authorization grant
     */
    private boolean isNewAuthorizationGrant(OAuth2Authorization authorization) {
        // Only authorization code grant flow has authorization codes
        if (!AuthorizationGrantType.AUTHORIZATION_CODE.equals(authorization.getAuthorizationGrantType())) {
            return false;
        }

        OAuth2Authorization.Token<OAuth2AuthorizationCode> authorizationCode =
                authorization.getToken(OAuth2AuthorizationCode.class);
        OAuth2Authorization.Token<OAuth2AccessToken> accessToken =
                authorization.getAccessToken();

        // New authorization: has authorization code but no access token yet
        return authorizationCode != null &&
                authorizationCode.getToken() != null &&
                accessToken == null;
    }

    /**
     * Records the authorization grant in the history table with device metadata and geolocation.
     * Handles scope changes by marking old authorizations as inactive.
     *
     * @param authorization the authorization to record
     */
    private void recordAuthorizationHistory(OAuth2Authorization authorization) throws UnknownHostException {
        String principalName = authorization.getPrincipalName();
        UUID clientId = UUID.fromString(authorization.getRegisteredClientId());
        Set<String> newScopes = authorization.getAuthorizedScopes();

        // Find user and client entities
        User user = userRepository.findByUsername(principalName)
                .orElseThrow(() -> new IllegalStateException("User not found: " + principalName));

        // Handle existing authorizations and scope changes
        handleScopeChanges(user.getId(), clientId, newScopes);

        // Extract request metadata
        RequestMetadataExtractor.RequestMetadata metadata = requestMetadataExtractor.extract();

        // Create new authorization history entry
        OAuth2AuthorizationHistory history = OAuth2AuthorizationHistory.builder()
                .userId(user.getId())
                .clientId(clientId)
                .authorizedScopes(new HashSet<>(newScopes))
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

        log.info("Authorization history recorded for user {} and client {} with {} scopes from IP {}",
                principalName, clientId, newScopes.size(), metadata.ipAddress());
    }

    /**
     * Handles scope changes by comparing with existing active authorization.
     * If new scopes are added, marks the old authorization as inactive.
     *
     * @param userId    the user's UUID
     * @param clientId  the client ID
     * @param newScopes the new requested scopes
     */
    private void handleScopeChanges(java.util.UUID userId, UUID clientId, Set<String> newScopes) {
        Optional<OAuth2AuthorizationHistory> existingAuth =
                authorizationHistoryRepository.findByUserIdAndClientIdAndIsActiveTrue(userId, clientId);

        if (existingAuth.isEmpty()) {
            // No existing authorization, this is the first one
            return;
        }

        OAuth2AuthorizationHistory existing = existingAuth.get();
        Set<String> existingScopes = existing.getAuthorizedScopes();

        // Check if new scopes have been ADDED (not just changed)
        if (hasNewScopesAdded(existingScopes, newScopes)) {
            log.info("New scopes added for user {} and client {}. Marking old authorization as inactive.",
                    userId, clientId);
            existing.markAsInactive();
            authorizationHistoryRepository.save(existing);
        } else {
            // Scopes haven't changed or were reduced - don't create a new entry
            log.debug("No new scopes added for user {} and client {}. Skipping history entry.",
                    userId, clientId);
            throw new SkipTrackingException();
        }
    }

    /**
     * Checks if new scopes have been ADDED (not just changed).
     * Only considers additions, not removals.
     *
     * @param existingScopes the existing authorized scopes
     * @param newScopes      the new requested scopes
     * @return true if new scopes have been added
     */
    private boolean hasNewScopesAdded(Set<String> existingScopes, Set<String> newScopes) {
        // Check if newScopes contains any scope not in existingScopes
        return newScopes.stream().anyMatch(scope -> !existingScopes.contains(scope));
    }

    /**
     * Internal exception to skip tracking when scopes haven't changed.
     */
    private static class SkipTrackingException extends RuntimeException {
    }
}
