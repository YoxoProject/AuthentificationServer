package fr.romaindu35.authserver.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "oauth2_client")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OAuth2Client {

    @Id
    private String id;

    @Column(name = "client_id", unique = true, nullable = false)
    private String clientId;

    @Column(nullable = false)
    private Instant clientIdIssuedAt;
    private String clientSecret;
    private Instant clientSecretExpiresAt;
    @Column(nullable = false)
    private String clientName;
    @Column(nullable = false)
    private Set<String> redirectUris;
    @Column(nullable = false)
    private boolean official;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ClientType clientType;

    @Column(nullable = false)
    private UUID ownerId;

    @Column(nullable = false)
    private Set<String> corsUrl;

    public enum ClientType {
        CLIENT, // Pour les applications dont l'utilisateur s'authentifie coté client
        SERVER, // Pour les applications dont l'utilisateur s'authentifie coté server
        SERVICE // Pour les applications sans utilisateur. Par exemple pour un accès API
    }

}