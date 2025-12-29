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
        TokenSettings.Builder tokenSettingsBuilder = TokenSettings.builder()
                .accessTokenTimeToLive(Duration.ofMinutes(30))
                .deviceCodeTimeToLive(Duration.ofSeconds(1)); // Aucun device code ne sera utilisé

        RegisteredClient.Builder registeredClientBuilder = RegisteredClient.withId(oAuth2Client.getId().toString())
                .clientId(oAuth2Client.getClientId())
                .clientIdIssuedAt(oAuth2Client.getClientIdIssuedAt())
                .clientSecret(oAuth2Client.getClientSecret())
                .clientSecretExpiresAt(oAuth2Client.getClientSecretExpiresAt())
                .clientName(oAuth2Client.getClientName());

        // Redirect URIs
        if (!CollectionUtils.isEmpty(oAuth2Client.getRedirectUris())) {
            registeredClientBuilder.redirectUris((redirectUris) -> redirectUris.addAll(oAuth2Client.getRedirectUris()));
        }

        // Configuration spécifique par type de client
        OAuth2Client.ClientType type = oAuth2Client.getClientType();

        if (type == OAuth2Client.ClientType.SERVICE) {
            // SERVICE: Machine-to-Machine (Client Credentials)
            registeredClientBuilder.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST);
            registeredClientBuilder.authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS);
            registeredClientBuilder.scope(Permissions.API_ACCESS.getScopeName());
            
            // Pas de consentement nécessaire pour les services (implicite)
            clientSettingsBuilder.requireAuthorizationConsent(false);
            
        } else {
            // CLIENT (SPA) et SERVER (Web Confidential)
            
            // Grant Types communs
            registeredClientBuilder.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE);
            registeredClientBuilder.authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN);

            // Scopes: Plus de restriction "Officiel" pour l'accès API. Tout le monde a accès à tout (filtré ensuite par l'utilisateur)
            registeredClientBuilder.scopes(scopes -> 
                scopes.addAll(Arrays.stream(Permissions.values())
                      .map(Permissions::getScopeName)
                      .collect(Collectors.toSet()))
            );

            // Consentement: Seul "Officiel" permet de passer outre
            if (!oAuth2Client.isOfficial()) {
                clientSettingsBuilder.requireAuthorizationConsent(true);
            }

            // Refresh Token Rotation: OBLIGATOIRE pour SPA et SERVER pour la sécurité
            tokenSettingsBuilder.reuseRefreshTokens(false);

            if (type == OAuth2Client.ClientType.CLIENT) {
                // SPA: Public Client (Pas de secret stocké)
                registeredClientBuilder.clientAuthenticationMethod(ClientAuthenticationMethod.NONE);
                clientSettingsBuilder.requireProofKey(true); // PKCE Obligatoire
                tokenSettingsBuilder.refreshTokenTimeToLive(Duration.ofDays(14));
            } else {
                // SERVER: Confidential Client (Secret stocké)
                registeredClientBuilder.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST);
                tokenSettingsBuilder.refreshTokenTimeToLive(Duration.ofDays(90)); // Env. 3 mois
            }
        }

        registeredClientBuilder.clientSettings(clientSettingsBuilder.build());
        registeredClientBuilder.tokenSettings(tokenSettingsBuilder.build());
        return registeredClientBuilder.build();
    }
}