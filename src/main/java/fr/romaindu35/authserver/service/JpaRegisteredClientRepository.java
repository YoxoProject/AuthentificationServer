package fr.romaindu35.authserver.service;

import fr.romaindu35.authserver.entity.OAuth2Client;
import fr.romaindu35.authserver.repository.OAuth2ClientRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.util.Assert;

import java.util.Optional;
import java.util.UUID;

@AllArgsConstructor
public class JpaRegisteredClientRepository implements RegisteredClientRepository {

    private final OAuth2ClientRepository registeredClientRepository;

    @Override
    public void save(RegisteredClient registeredClient) {
        // L'enregistrement des clients est réalisé en dehors du processus d'oauth2
    }

    @Override
    public RegisteredClient findById(String id) {
        Assert.hasText(id, "id cannot be empty");
        return this.registeredClientRepository.findById(UUID.fromString(id))
                .map(ModelMapper::convertRegisteredClient)
                .orElse(null);
    }

    @Override
    public RegisteredClient findByClientId(String clientId) {
        Assert.hasText(clientId, "clientId cannot be empty");
        Optional<OAuth2Client> oauth2RegisteredClientOpt = this.registeredClientRepository.findByClientId(clientId);
        return oauth2RegisteredClientOpt.map(ModelMapper::convertRegisteredClient).orElse(null);
    }
}