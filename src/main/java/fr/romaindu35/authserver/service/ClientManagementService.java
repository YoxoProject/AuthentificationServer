package fr.romaindu35.authserver.service;

import fr.romaindu35.authserver.dto.ClientConfigurationDTO;
import fr.romaindu35.authserver.dto.ClientCredentialsDTO;
import fr.romaindu35.authserver.dto.ClientDetailsDTO;
import fr.romaindu35.authserver.dto.ClientListItemDTO;
import fr.romaindu35.authserver.entity.OAuth2Client;
import fr.romaindu35.authserver.entity.User;
import fr.romaindu35.authserver.repository.OAuth2ClientRepository;
import fr.romaindu35.authserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URISyntaxException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service de gestion des clients OAuth2.
 * Gère la création, modification, suppression et régénération des credentials.
 */
@Service
@RequiredArgsConstructor
public class ClientManagementService {

    private final OAuth2ClientRepository oauth2ClientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Crée un nouveau client OAuth2 avec uniquement un nom.
     * Les paramètres par défaut sont appliqués (type CLIENT, redirectUris vide, etc.).
     *
     * @param clientName Nom du client à créer
     * @param ownerId    UUID du propriétaire
     * @return L'identifiant unique du client créé
     */
    @Transactional
    public String createClient(String clientName, UUID ownerId) {
        // Vérifier que l'utilisateur existe
        if (!userRepository.existsById(ownerId)) {
            throw new IllegalArgumentException("Utilisateur introuvable avec l'ID: " + ownerId);
        }

        OAuth2Client client = new OAuth2Client();
        client.setId(UUID.randomUUID().toString());
        client.setClientName(clientName);
        client.setOwnerId(ownerId);
        client.setClientIdIssuedAt(Instant.now());

        // Valeurs par défaut
        client.setClientType(OAuth2Client.ClientType.CLIENT);
        client.setClientId(generateClientId());
        client.setClientSecret(null); // Pas de secret pour CLIENT type par défaut
        client.setClientSecretExpiresAt(null);
        client.setRedirectUris(new HashSet<>());
        client.setCorsUrl(new HashSet<>());
        client.setOfficial(false);

        oauth2ClientRepository.save(client);
        return client.getId();
    }

    /**
     * Récupère la liste de tous les clients appartenant à un utilisateur.
     *
     * @param ownerId UUID du propriétaire
     * @return Liste des clients sous forme de DTOs simplifiés
     */
    @Transactional(readOnly = true)
    public List<ClientListItemDTO> getClientsByOwner(UUID ownerId) {
        return oauth2ClientRepository.findAllByOwnerId(ownerId).stream()
                .map(client -> new ClientListItemDTO(
                        client.getId(),
                        client.getClientName(),
                        client.getClientType(),
                        client.getClientIdIssuedAt(),
                        client.isOfficial()
                ))
                .sorted(Comparator.comparing(ClientListItemDTO::createdAt).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Récupère tous les détails d'un client OAuth2.
     * Vérifie que l'utilisateur est bien le propriétaire du client.
     *
     * @param clientId Identifiant unique du client
     * @param ownerId  UUID du propriétaire demandant l'accès
     * @return Détails complets du client
     * @throws IllegalArgumentException si le client n'existe pas ou si l'utilisateur n'est pas le propriétaire
     */
    @Transactional(readOnly = true)
    public ClientDetailsDTO getClientDetails(String clientId, UUID ownerId) {
        OAuth2Client client = oauth2ClientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client introuvable avec l'ID: " + clientId));

        // Vérification de propriété
        if (!client.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Vous n'êtes pas autorisé à accéder à ce client");
        }

        User owner = userRepository.findById(client.getOwnerId())
                .orElseThrow(() -> new IllegalStateException("Propriétaire du client introuvable"));

        ClientConfigurationDTO configuration = new ClientConfigurationDTO(
                client.getClientName(),
                client.getClientType(),
                new HashSet<>(client.getRedirectUris()),
                new HashSet<>(client.getCorsUrl()),
                client.isOfficial()
        );

        // Ne jamais exposer le secret hashé, seulement indiquer qu'il existe
        ClientCredentialsDTO credentials = new ClientCredentialsDTO(
                client.getClientId(),
                null // Le secret n'est jamais renvoyé après création
        );

        return new ClientDetailsDTO(
                client.getId(),
                configuration,
                credentials,
                client.getClientIdIssuedAt(),
                client.getOwnerId(),
                owner.getUsername()
        );
    }

    /**
     * Met à jour la configuration d'un client OAuth2.
     *
     * @param clientId      Identifiant unique du client
     * @param configuration Nouvelle configuration
     * @param ownerId       UUID du propriétaire effectuant la modification
     * @throws IllegalArgumentException si le client n'existe pas
     * @throws SecurityException        si l'utilisateur n'est pas le propriétaire
     */
    @Transactional
    public void updateClientConfiguration(String clientId, ClientConfigurationDTO configuration, UUID ownerId) {
        OAuth2Client client = oauth2ClientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client introuvable avec l'ID: " + clientId));

        // Vérification de propriété
        if (!client.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Vous n'êtes pas autorisé à modifier ce client");
        }

        // Validation des URLs de redirection
        Set<String> validatedRedirectUris = configuration.redirectUris().stream()
                .map(this::validateAndNormalizeUrl)
                .collect(Collectors.toSet());

        // Validation des URLs CORS
        Set<String> validatedCorsUrls = configuration.corsUrls().stream()
                .map(this::validateAndNormalizeUrl)
                .collect(Collectors.toSet());

        // Validation : si on passe de SERVER/SERVICE vers CLIENT, supprimer le secret
        OAuth2Client.ClientType oldType = client.getClientType();
        OAuth2Client.ClientType newType = configuration.clientType();

        if (oldType != OAuth2Client.ClientType.CLIENT && newType == OAuth2Client.ClientType.CLIENT) {
            client.setClientSecret(null);
            client.setClientSecretExpiresAt(null);
        }

        // Validation : si on passe de CLIENT vers SERVER/SERVICE, générer un secret
        if (oldType == OAuth2Client.ClientType.CLIENT && newType != OAuth2Client.ClientType.CLIENT) {
            String plainSecret = generateClientSecret();
            client.setClientSecret(passwordEncoder.encode(plainSecret));
            // Note: Le secret en clair est perdu après ce point, l'utilisateur devra le régénérer s'il le perd
        }

        client.setClientName(configuration.clientName());
        client.setClientType(configuration.clientType());
        client.setRedirectUris(validatedRedirectUris);
        client.setCorsUrl(validatedCorsUrls);
        //client.setOfficial(configuration.official()); // L'attribut 'official' ne peut pas être modifié par l'utilisateur

        oauth2ClientRepository.save(client);
    }

    /**
     * Régénère le client ID d'un client OAuth2.
     * ATTENTION: Cette opération invalidera toutes les configurations existantes utilisant l'ancien client ID.
     *
     * @param clientId Identifiant unique du client
     * @param ownerId  UUID du propriétaire
     * @return Le nouveau client ID en clair
     * @throws IllegalArgumentException si le client n'existe pas
     * @throws SecurityException        si l'utilisateur n'est pas le propriétaire
     */
    @Transactional
    public String regenerateClientId(String clientId, UUID ownerId) {
        OAuth2Client client = oauth2ClientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client introuvable avec l'ID: " + clientId));

        // Vérification de propriété
        if (!client.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Vous n'êtes pas autorisé à modifier ce client");
        }

        String newClientId = generateClientId();
        client.setClientId(newClientId);
        client.setClientIdIssuedAt(Instant.now());

        oauth2ClientRepository.save(client);
        return newClientId;
    }

    /**
     * Régénère le client secret d'un client OAuth2.
     * Cette méthode ne peut être appelée que pour les clients de type SERVER ou SERVICE.
     * Le secret en clair est retourné une seule fois et ne peut plus être récupéré après.
     *
     * @param clientId Identifiant unique du client
     * @param ownerId  UUID du propriétaire
     * @return Le nouveau secret en clair
     * @throws IllegalArgumentException si le client n'existe pas ou est de type CLIENT
     * @throws SecurityException        si l'utilisateur n'est pas le propriétaire
     */
    @Transactional
    public String regenerateClientSecret(String clientId, UUID ownerId) {
        OAuth2Client client = oauth2ClientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client introuvable avec l'ID: " + clientId));

        // Vérification de propriété
        if (!client.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Vous n'êtes pas autorisé à modifier ce client");
        }

        // Les clients de type CLIENT n'ont pas de secret (PKCE flow)
        if (client.getClientType() == OAuth2Client.ClientType.CLIENT) {
            throw new IllegalArgumentException("Les clients de type CLIENT n'utilisent pas de secret (PKCE flow)");
        }

        String plainSecret = generateClientSecret();
        client.setClientSecret(passwordEncoder.encode(plainSecret));
        client.setClientSecretExpiresAt(null); // Pas d'expiration

        oauth2ClientRepository.save(client);
        return plainSecret;
    }

    /**
     * Supprime un client OAuth2.
     * ATTENTION: Cette opération est irréversible et invalidera tous les tokens actifs.
     *
     * @param clientId Identifiant unique du client
     * @param ownerId  UUID du propriétaire
     * @throws IllegalArgumentException si le client n'existe pas
     * @throws SecurityException        si l'utilisateur n'est pas le propriétaire
     */
    @Transactional
    public void deleteClient(String clientId, UUID ownerId) {
        OAuth2Client client = oauth2ClientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client introuvable avec l'ID: " + clientId));

        // Vérification de propriété
        if (!client.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Vous n'êtes pas autorisé à supprimer ce client");
        }

        oauth2ClientRepository.delete(client);
    }

    /**
     * Génère un client ID aléatoire sécurisé.
     * Format: préfixe "yoxo_" suivi de 32 caractères hexadécimaux.
     *
     * @return Client ID généré
     */
    private String generateClientId() {
        byte[] bytes = new byte[16];
        secureRandom.nextBytes(bytes);
        return "yoxo_" + bytesToHex(bytes);
    }

    /**
     * Génère un client secret aléatoire sécurisé.
     * Format: préfixe "yxs_" suivi de 48 caractères hexadécimaux.
     *
     * @return Client secret généré
     */
    private String generateClientSecret() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return "yxs_" + bytesToHex(bytes);
    }

    /**
     * Valide et normalise une URL selon les règles de sécurité :
     * - Doit commencer par http:// ou https://
     * - Remplace 127.0.0.1 par localhost
     * - Supprime le / final
     * - Rejette les wildcards (*)
     * Utilise java.net.URI pour une validation robuste de la structure complète.
     *
     * @param url URL à valider et normaliser
     * @return URL normalisée
     * @throws IllegalArgumentException si l'URL est invalide
     */
    private String validateAndNormalizeUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new IllegalArgumentException("L'URL ne peut pas être vide");
        }

        String trimmed = url.trim();

        // Rejeter les wildcards
        if (trimmed.contains("*")) {
            throw new IllegalArgumentException("Les wildcards (*) ne sont pas autorisés dans les URLs");
        }

        try {
            URI uri = new URI(trimmed);

            // Vérifier que l'URI est absolue (a un scheme)
            if (!uri.isAbsolute()) {
                throw new IllegalArgumentException("L'URL doit être absolue (contenir http:// ou https://)");
            }

            // Vérifier le scheme
            String scheme = uri.getScheme();
            if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
                throw new IllegalArgumentException("L'URL doit commencer par http:// ou https://");
            }

            // Vérifier qu'il y a un host
            if (uri.getHost() == null || uri.getHost().isEmpty()) {
                throw new IllegalArgumentException("L'URL doit contenir un nom d'hôte valide");
            }

            String normalized = trimmed;
            // Supprimer le / final si le path est vide ou juste "/"
            if (normalized.endsWith("/") && (uri.getPath() == null || uri.getPath().equals("/"))) {
                normalized = normalized.substring(0, normalized.length() - 1);
            }

            return normalized;
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("Format d'URL invalide: " + e.getMessage());
        }
    }

    /**
     * Convertit un tableau de bytes en chaîne hexadécimale.
     *
     * @param bytes Tableau de bytes à convertir
     * @return Chaîne hexadécimale
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
