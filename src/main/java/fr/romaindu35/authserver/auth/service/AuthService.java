package fr.romaindu35.authserver.auth.service;

import fr.romaindu35.authserver.auth.config.AuthProperties;
import fr.romaindu35.authserver.auth.controller.LoginController;
import fr.romaindu35.authserver.entity.User;
import fr.romaindu35.authserver.repository.UserRepository;
import fr.romaindu35.authserver.utils.Permissions;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
public class AuthService {

    private final AuthProperties authProperties;
    private final LoginController loginController;
    private final UserRepository userRepository;

    @GetMapping("/auth/callback/nationsglory")
    public RedirectView callback(@RequestParam("access_token") String accessToken, HttpServletRequest request) {
        String checkTokenUrl = String.format(
                "https://publicapi.nationsglory.fr/oauth/checkToken?access_token=%s&client_secret=%s",
                accessToken,
                authProperties.getNgClientSecret()
        );
        RestTemplate restTemplate = new RestTemplate();
        TokenResponse tokenResponse;
        try {
            tokenResponse = restTemplate.getForObject(checkTokenUrl, TokenResponse.class);
        } catch (HttpClientErrorException.Unauthorized e) {
            return new RedirectView(loginController.getRedirectURLToNationsGloryOAuth());
        }
        Optional<User> userOpt = userRepository.findByUsername(tokenResponse.getUsername());

        Set<Permissions> userPermissions = new HashSet<>(Set.of(Permissions.getAlwaysGrantedPermissions()));
        userOpt.ifPresentOrElse(
                user -> {
                    user.setLastLoginAt(Instant.now());
                    userRepository.save(user);

                    userPermissions.addAll(user.getAdditionalPermissions());
                },
                () -> {
                    // L'utilisateur n'existe pas, on le crée
                    User newUser = new User();
                    newUser.setUsername(tokenResponse.getUsername());
                    newUser.setCreatedAt(Instant.now());
                    newUser.setLastLoginAt(Instant.now());
                    newUser.setAdditionalPermissions(new HashSet<>());
                    userRepository.save(newUser);
                }
        );

        Authentication auth = new UsernamePasswordAuthenticationToken(tokenResponse.getUsername(), null, userPermissions.stream().map(p -> new SimpleGrantedAuthority(p.getScopeName())).collect(Collectors.toSet()));
        SecurityContextHolder.getContext().setAuthentication(auth);
        request.getSession().setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

        // Redirection vers l'URL initialement demandée avant la connexion
        HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
        SavedRequest savedRequest = requestCache.getRequest(request, null);
        String redirectUrl = (savedRequest != null) ? savedRequest.getRedirectUrl() : "/";
        if (savedRequest != null) {
            requestCache.removeRequest(request, null);
        }
        return new RedirectView(redirectUrl);
    }

    @Getter
    @Setter
    @ToString
    public static class TokenResponse {
        @NonNull
        private String username;
        private String ip;
        private String grantedAt;
        private String revokedAt;
    }

}