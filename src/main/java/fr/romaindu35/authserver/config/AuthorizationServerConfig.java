package fr.romaindu35.authserver.config;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import fr.romaindu35.authserver.repository.OAuth2ClientRepository;
import fr.romaindu35.authserver.service.JpaRegisteredClientRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.FileSystemResource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;

@Configuration
public class AuthorizationServerConfig {

    @Bean
    @Order(1)
    public SecurityFilterChain authServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .authorizationEndpoint(authorizationEndpoint -> authorizationEndpoint.consentPage("/oauth2/consent"));
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
}