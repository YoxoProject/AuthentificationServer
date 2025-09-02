package fr.romaindu35.authserver.auth.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class AuthProperties {

    @Value("${yoxo.auth.ng-client-id}")
    private String ngClientId;

    @Value("${yoxo.auth.ng-client-secret}")
    private String ngClientSecret;

    @Value("${yoxo.auth.ng-redirect-uri}")
    private String ngRedirectUri;

}