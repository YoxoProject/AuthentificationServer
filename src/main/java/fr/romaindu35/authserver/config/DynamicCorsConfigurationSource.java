package fr.romaindu35.authserver.config;

import fr.romaindu35.authserver.service.CorsRequestAnalyzer;
import fr.romaindu35.authserver.service.CorsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@AllArgsConstructor
public class DynamicCorsConfigurationSource implements CorsConfigurationSource {

    private final CorsService corsService;
    private final CorsRequestAnalyzer corsRequestAnalyzer;

    @Override
    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
        // Ne traiter que les endpoints OAuth2
        String requestUri = request.getRequestURI();
        if (!requestUri.startsWith("/oauth2/")) {
            return null;
        }

        String origin = request.getHeader("Origin");
        if (origin == null) {
            return null;
        }

        // Extraire le client_id de la requête
        String clientId = corsRequestAnalyzer.extractClientId(request);
        if (clientId == null) {
            return null;
        }

        // Vérifier si l'origine est autorisée pour ce client spécifique
        if (!corsService.isOriginAllowedForClient(origin, clientId)) {
            return null;
        }

        // Créer une configuration CORS permissive pour ce client
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(origin));
        config.setAllowedMethods(Arrays.asList("POST", "OPTIONS", "GET"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // Cache pendant 1h

        return config;
    }
}