package fr.romaindu35.authserver.service;

import org.springframework.lang.Nullable;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

/**
 * Decorator for OAuth2AuthorizationService that adds tracking functionality.
 * It delegates the actual persistence to the underlying JDBC service but intercepts
 * save operations to record authorization history.
 */
public class TrackingOAuth2AuthorizationService implements OAuth2AuthorizationService {

    private final OAuth2AuthorizationService delegate;
    private final OAuth2AuthorizationTrackingService trackingService;

    public TrackingOAuth2AuthorizationService(OAuth2AuthorizationService delegate,
                                              OAuth2AuthorizationTrackingService trackingService) {
        Assert.notNull(delegate, "delegate cannot be null");
        Assert.notNull(trackingService, "trackingService cannot be null");
        this.delegate = delegate;
        this.trackingService = trackingService;
    }

    @Override
    @Transactional
    public void save(OAuth2Authorization authorization) {
        // 1. Enforce Single Session Policy (For Confidential Clients)
        // Invalidates previous sessions if applicable before saving the new one.
        this.trackingService.enforceSingleSession(authorization);

        // 2. Save to database using the standard JDBC service (Critical for integrity)
        this.delegate.save(authorization);

        // 3. Track the authorization activity (Login or Refresh)
        // This handles history creation and activity logging.
        this.trackingService.track(authorization);
    }

    @Override
    @Transactional
    public void remove(OAuth2Authorization authorization) {
        this.delegate.remove(authorization);
    }

    @Nullable
    @Override
    @Transactional(readOnly = true)
    public OAuth2Authorization findById(String id) {
        return this.delegate.findById(id);
    }

    @Nullable
    @Override
    @Transactional(readOnly = true)
    public OAuth2Authorization findByToken(String token, @Nullable OAuth2TokenType tokenType) {
        return this.delegate.findByToken(token, tokenType);
    }
}