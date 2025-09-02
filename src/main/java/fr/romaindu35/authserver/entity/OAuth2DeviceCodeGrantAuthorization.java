package fr.romaindu35.authserver.entity;

import lombok.Getter;
import org.springframework.data.redis.core.index.Indexed;

import java.security.Principal;
import java.time.Instant;
import java.util.Set;

@Getter
public class OAuth2DeviceCodeGrantAuthorization extends OAuth2AuthorizationGrantAuthorization {

    private final Principal principal;
    private final DeviceCode deviceCode;
    private final UserCode userCode;
    private final Set<String> requestedScopes;
    @Indexed
    private final String deviceState;

    public OAuth2DeviceCodeGrantAuthorization(String id, String registeredClientId, String principalName, Set<String> authorizedScopes, AccessToken accessToken,
      RefreshToken refreshToken, Principal principal, DeviceCode deviceCode, UserCode userCode, Set<String> requestedScopes, String deviceState) {
        super(id, registeredClientId, principalName, authorizedScopes, accessToken, refreshToken);
        this.principal = principal;
        this.deviceCode = deviceCode;
        this.userCode = userCode;
        this.requestedScopes = requestedScopes;
        this.deviceState = deviceState;
    }

    public static class DeviceCode extends AbstractToken {

        public DeviceCode(String tokenValue, Instant issuedAt, Instant expiresAt, boolean invalidated) {
            super(tokenValue, issuedAt, expiresAt, invalidated);
        }
    }

    public static class UserCode extends AbstractToken {

        public UserCode(String tokenValue, Instant issuedAt, Instant expiresAt, boolean invalidated) {
            super(tokenValue, issuedAt, expiresAt, invalidated);
        }
    }
}