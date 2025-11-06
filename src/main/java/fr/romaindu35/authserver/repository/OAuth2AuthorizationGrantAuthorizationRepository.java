package fr.romaindu35.authserver.repository;

import fr.romaindu35.authserver.entity.OAuth2AuthorizationCodeGrantAuthorization;
import fr.romaindu35.authserver.entity.OAuth2AuthorizationGrantAuthorization;
import fr.romaindu35.authserver.entity.OAuth2DeviceCodeGrantAuthorization;
import fr.romaindu35.authserver.entity.OidcAuthorizationCodeGrantAuthorization;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OAuth2AuthorizationGrantAuthorizationRepository extends CrudRepository<OAuth2AuthorizationGrantAuthorization, String> {

    <T extends OAuth2AuthorizationCodeGrantAuthorization> T findByState(String state);

    <T extends OAuth2AuthorizationCodeGrantAuthorization> T findByAuthorizationCode_TokenValue(String authorizationCode);

    <T extends OAuth2AuthorizationCodeGrantAuthorization> T findByStateOrAuthorizationCode_TokenValue(String state, String authorizationCode);

    <T extends OAuth2AuthorizationGrantAuthorization> T findByAccessToken_TokenValue(String accessToken);

    <T extends OAuth2AuthorizationGrantAuthorization> T findByRefreshToken_TokenValue(String refreshToken);

    <T extends OAuth2AuthorizationGrantAuthorization> T findByAccessToken_TokenValueOrRefreshToken_TokenValue(String accessToken, String refreshToken);

    <T extends OidcAuthorizationCodeGrantAuthorization> T findByIdToken_TokenValue(String idToken);

    <T extends OAuth2DeviceCodeGrantAuthorization> T findByDeviceState(String deviceState);

    <T extends OAuth2DeviceCodeGrantAuthorization> T findByDeviceCode_TokenValue(String deviceCode);

    <T extends OAuth2DeviceCodeGrantAuthorization> T findByUserCode_TokenValue(String userCode);

    <T extends OAuth2DeviceCodeGrantAuthorization> T findByDeviceStateOrDeviceCode_TokenValueOrUserCode_TokenValue(String deviceState, String deviceCode,
      String userCode);

    /**
     * Finds all authorizations for a specific client and user (principal).
     * Used for revoking all tokens when a user revokes authorization for a client.
     *
     * @param registeredClientId the client ID
     * @param principalName the username (principal name)
     * @return List of all authorizations for the client-user pair
     */
    List<OAuth2AuthorizationGrantAuthorization> findByRegisteredClientIdAndPrincipalName(String registeredClientId, String principalName);
}