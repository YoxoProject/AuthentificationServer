package fr.romaindu35.authserver.service;

import fr.romaindu35.authserver.entity.OAuth2Client;
import fr.romaindu35.authserver.repository.OAuth2ClientRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
@AllArgsConstructor
public class CorsService {

    private final OAuth2ClientRepository oAuth2ClientRepository;

    /**
     * Vérifie si une origine est autorisée pour un client spécifique
     */
    public boolean isOriginAllowedForClient(String origin, String clientId) {
        if (origin == null || clientId == null) {
            return false;
        }

        Optional<OAuth2Client> clientOpt = oAuth2ClientRepository.findByClientId(clientId);
        if (clientOpt.isEmpty()) {
            return false;
        }
        OAuth2Client client = clientOpt.get();

        // Seuls les clients de type CLIENT peuvent utiliser CORS
        if (!OAuth2Client.ClientType.CLIENT.equals(client.getClientType())) {
            return false;
        }

        // Vérifier si l'origine est dans la liste des URLs CORS autorisées pour ce client
        Set<String> corsUrls = client.getCorsUrl();
        return corsUrls != null && corsUrls.contains(origin);
    }
}