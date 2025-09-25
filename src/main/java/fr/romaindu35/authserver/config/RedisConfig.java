package fr.romaindu35.authserver.config;

import fr.romaindu35.authserver.convert.*;
import fr.romaindu35.authserver.repository.OAuth2AuthorizationGrantAuthorizationRepository;
import fr.romaindu35.authserver.repository.OAuth2UserConsentRepository;
import fr.romaindu35.authserver.service.RedisOAuth2AuthorizationConsentService;
import fr.romaindu35.authserver.service.RedisOAuth2AuthorizationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisClientConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.convert.RedisCustomConversions;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

import java.util.Arrays;

@Configuration(proxyBeanMethods = false)
@EnableRedisRepositories
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;
    @Value("${spring.data.redis.port}")
    private int redisPort;
    @Value("${spring.data.redis.password}")
    private String redisPassword;
    @Value("${spring.data.redis.username}")
    private String redisUsername;
    @Value("${spring.data.redis.ssl.enabled}")
    private boolean redisSslEnabled;

    @Bean
    @Order(1)
    public JedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration(redisHost, redisPort);
        redisStandaloneConfiguration.setPassword(redisPassword);
        redisStandaloneConfiguration.setUsername(redisUsername);


        JedisClientConfiguration.JedisClientConfigurationBuilder jedisClientConfigurationBuilder = JedisClientConfiguration.builder();
        if (redisSslEnabled) jedisClientConfigurationBuilder.useSsl();

        return new JedisConnectionFactory(redisStandaloneConfiguration, jedisClientConfigurationBuilder.build());
    }

    @Bean
    @Order(2)
    public RedisTemplate<?, ?> redisTemplate(JedisConnectionFactory connectionFactory) {
        RedisTemplate<byte[], byte[]> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        return template;
    }

    @Bean
    @Order(3)
    public RedisCustomConversions redisCustomConversions() {
        return new RedisCustomConversions(
                Arrays.asList(new UsernamePasswordAuthenticationTokenToBytesConverter(), new BytesToUsernamePasswordAuthenticationTokenConverter(),
                        new OAuth2AuthorizationRequestToBytesConverter(), new BytesToOAuth2AuthorizationRequestConverter(), new ClaimsHolderToBytesConverter(),
                        new BytesToClaimsHolderConverter()));
    }

    @Bean
    @Order(4)
    public RedisOAuth2AuthorizationService authorizationService(RegisteredClientRepository registeredClientRepository,
                                                                OAuth2AuthorizationGrantAuthorizationRepository authorizationGrantAuthorizationRepository) {
        return new RedisOAuth2AuthorizationService(registeredClientRepository, authorizationGrantAuthorizationRepository);
    }

    @Bean
    @Order(5)
    public RedisOAuth2AuthorizationConsentService authorizationConsentService(OAuth2UserConsentRepository userConsentRepository) {
        return new RedisOAuth2AuthorizationConsentService(userConsentRepository);
    }
}