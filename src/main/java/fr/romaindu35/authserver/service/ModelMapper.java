package fr.romaindu35.authserver.service;

import fr.romaindu35.authserver.entity.*;
import fr.romaindu35.authserver.utils.Permissions;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.util.CollectionUtils;

import java.time.Duration;
import java.util.Arrays;
import java.util.stream.Collectors;

public final class ModelMapper {

    public static RegisteredClient convertRegisteredClient(OAuth2Client oAuth2Client) {
        ClientSettings.Builder clientSettingsBuilder = ClientSettings.builder();
        if (!oAuth2Client.isOfficial()) {
            clientSettingsBuilder.requireAuthorizationConsent(true);
        }
        TokenSettings tokenSettings = TokenSettings.builder()
                .accessTokenTimeToLive(Duration.ofMinutes(30))
                .deviceCodeTimeToLive(Duration.ofSeconds(1)) // Aucun device code ne sera utilisé
                .refreshTokenTimeToLive(Duration.ofDays(365))
                .build();

        RegisteredClient.Builder registeredClientBuilder = RegisteredClient.withId(oAuth2Client.getId().toString())
                .clientId(oAuth2Client.getClientId())
                .clientIdIssuedAt(oAuth2Client.getClientIdIssuedAt())
                .clientSecret(oAuth2Client.getClientSecret())
                .clientSecretExpiresAt(oAuth2Client.getClientSecretExpiresAt())
                .clientName(oAuth2Client.getClientName());

        if (!CollectionUtils.isEmpty(oAuth2Client.getRedirectUris())) {
            registeredClientBuilder.redirectUris((redirectUris) -> redirectUris.addAll(oAuth2Client.getRedirectUris()));
        }
        if (oAuth2Client.getClientType().equals(OAuth2Client.ClientType.CLIENT)) {
            registeredClientBuilder.clientAuthenticationMethod(ClientAuthenticationMethod.NONE);
            clientSettingsBuilder.requireProofKey(true);
        } else {
            registeredClientBuilder.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST);
        }
        if (oAuth2Client.getClientType().equals(OAuth2Client.ClientType.SERVICE)) {
            registeredClientBuilder.authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS);
            registeredClientBuilder.scope(Permissions.API_ACCESS.getScopeName());
        } else {
            registeredClientBuilder.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE);
            registeredClientBuilder.authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN);
            registeredClientBuilder.scopes(scopes -> scopes.addAll(Arrays.stream(Permissions.values()).filter(permissions -> oAuth2Client.isOfficial() || !permissions.equals(Permissions.API_ACCESS)).map(Permissions::getScopeName).collect(Collectors.toSet())));
        }

        registeredClientBuilder.clientSettings(clientSettingsBuilder.build());
        registeredClientBuilder.tokenSettings(tokenSettings);
        return registeredClientBuilder.build();
    }
}