package fr.romaindu35.authserver.auth.controller;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import fr.romaindu35.authserver.auth.config.AuthProperties;
import lombok.AllArgsConstructor;

@BrowserCallable
@AnonymousAllowed
@AllArgsConstructor
public class LoginController {

    private final AuthProperties authProperties;

    public String getRedirectURLToNationsGloryOAuth() {
        return String.format(
                "https://publicapi.nationsglory.fr/oauth/auth?client_id=%s&redirect_uri=%s",
                authProperties.getNgClientId(),
                authProperties.getNgRedirectUri()
        );
    }

}