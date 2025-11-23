package fr.romaindu35.authserver.config;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import fr.romaindu35.authserver.repository.OAuth2ClientRepository;
import fr.romaindu35.authserver.repository.UserRepository;
import fr.romaindu35.authserver.service.JpaRegisteredClientRepository;
import fr.romaindu35.authserver.utils.Permissions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.FileSystemResource;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class AuthorizationServerConfig {

    @Bean
    @Order(1)
    public SecurityFilterChain authServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .authorizationEndpoint(authorizationEndpoint -> authorizationEndpoint.consentPage("/oauth2/consent"));
        http.cors(Customizer.withDefaults());
        http.formLogin(
                form -> form.loginPage("/login").permitAll().defaultSuccessUrl("/", false)
        );
        return http.build();
    }

    @Bean
    public RegisteredClientRepository registeredClientRepository(OAuth2ClientRepository oAuth2ClientRepository) {
        JpaRegisteredClientRepository repo = new JpaRegisteredClientRepository(oAuth2ClientRepository);
        return repo;
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource(@Value("${jwt.keystore.path}") String keystorePath,
                                                @Value("${jwt.keystore.password}") String keystorePassword,
                                                @Value("${jwt.key.alias}") String keyAlias,
                                                @Value("${jwt.key.password}") String keyPassword) throws IOException, KeyStoreException, CertificateException, NoSuchAlgorithmException, JOSEException {

        KeyStore keyStore = KeyStore.getInstance("JKS");
        try (var inputStream = new FileSystemResource(keystorePath).getInputStream()) {
            keyStore.load(inputStream, keystorePassword.toCharArray());
        }
        RSAKey rsaKey = RSAKey.load(keyStore, keyAlias, keyPassword.toCharArray());
        return new ImmutableJWKSet<>(new JWKSet(rsaKey));
    }

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> tokenCustomizer(UserRepository userRepository) {
        return context -> {
            // Par définition, un client_credentials n'a pas d'utilisateur associé. On ne filtre donc pas les scopes dans ce cas.
            // Pas besoin de faire du filtrage sur les scopes puisque spring l'aurait bloqué avant d'arriver ici
            if (AuthorizationGrantType.CLIENT_CREDENTIALS.equals(context.getAuthorizationGrantType())) {
                return;
            }

            Authentication principal = context.getPrincipal();
            String username = principal.getName();

            // On recupère l'ensemble des permissions que possède l'utilisateur
            Set<Permissions> userPermissions = new HashSet<>();
            userRepository.findByUsername(username).ifPresent((user) -> {;
                userPermissions.addAll(user.getAdditionalPermissions());
                userPermissions.addAll(Arrays.stream(Permissions.getAlwaysGrantedPermissions()).toList());
            });

            Set<String> userScopes = userPermissions.stream()
                    .map(Permissions::getScopeName)
                    .collect(Collectors.toSet());
            Set<String> requestedScopes = context.getAuthorizedScopes();

            // Ne garder que les scopes que l'utilisateur possède réellement
            Set<String> filteredScopes = requestedScopes.stream()
                    .filter(userScopes::contains)
                    .collect(Collectors.toSet());
            context.getClaims().claim("scope", filteredScopes);
        };
    }
}