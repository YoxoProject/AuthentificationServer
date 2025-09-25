package fr.romaindu35.authserver.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class CorsRequestAnalyzer {

    /**
     * Extrait le client_id d'une requête OAuth2
     * Supporte les différents modes d'authentification :
     * - Basic Authorization header (client_secret_basic)
     * - Form parameter client_id (client_secret_post)
     * - Form parameter client_id (none - PKCE)
     */
    public String extractClientId(HttpServletRequest request) {
        // 1. Vérifier le header Authorization (Basic auth)
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Basic ")) {
            String clientId = extractClientIdFromBasicAuth(authHeader);
            if (clientId != null) {
                return clientId;
            }
        }

        // 2. Vérifier les paramètres de la requête (form data ou query params)
        String clientIdParam = request.getParameter("client_id");
        if (StringUtils.hasText(clientIdParam)) {
            return clientIdParam;
        }

        return null;
    }

    private String extractClientIdFromBasicAuth(String authHeader) {
        try {
            String base64Credentials = authHeader.substring("Basic ".length());
            byte[] decodedBytes = Base64.getDecoder().decode(base64Credentials);
            String credentials = new String(decodedBytes, StandardCharsets.UTF_8);

            // Format: "client_id:client_secret"
            int colonIndex = credentials.indexOf(':');
            if (colonIndex > 0) {
                return credentials.substring(0, colonIndex);
            }
        } catch (Exception e) {
            // Log l'erreur mais ne pas faire échouer la requête
            // Le système d'authentification OAuth2 gérera l'erreur
        }
        return null;
    }
}