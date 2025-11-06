-- =============================================================================
-- Version: 2
-- Description: Création de la table d'historique des autorisations OAuth2
-- Date: 2025-11-04
-- =============================================================================

-- =============================================================================
-- TABLE: oauth2_authorization_history
-- Description: Historique de toutes les autorisations OAuth2 accordées par
--              les utilisateurs aux clients, avec métadonnées d'appareil,
--              géolocalisation et statut de révocation
-- =============================================================================
CREATE TABLE oauth2_authorization_history (
    -- Clé primaire
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identifiants de l'autorisation
    user_id UUID NOT NULL,
    client_id VARCHAR(255) NOT NULL,

    -- Scopes accordés (tableau)
    authorized_scopes TEXT[] NOT NULL,

    -- Métadonnées de la requête
    ip_address INET NOT NULL,
    user_agent VARCHAR(255),
    browser VARCHAR(100),
    device_type VARCHAR(50),
    os VARCHAR(100),

    -- Données de géolocalisation
    country VARCHAR(100),
    city VARCHAR(100),

    -- Suivi du cycle de vie (groupés pour lisibilité)
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Contraintes de clés étrangères
    CONSTRAINT fk_authorization_history_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_authorization_history_client
        FOREIGN KEY (client_id)
        REFERENCES oauth2_client(id)
        ON DELETE CASCADE,

    -- S'assurer que revoked_at n'est défini que lorsque is_active est false
    CONSTRAINT chk_revocation_consistency
        CHECK ((is_active = true AND revoked_at IS NULL) OR (is_active = false))
);

-- Index pour trouver les autorisations actives par utilisateur (granted_at décroissant)
CREATE INDEX idx_authorization_history_user_client_active
    ON oauth2_authorization_history(user_id, granted_at DESC)
    WHERE is_active = true;

-- Index pour trouver les autorisations révoquées par utilisateur (granted_at décroissant)
CREATE INDEX idx_authorization_history_user_client_revoked
    ON oauth2_authorization_history(user_id, granted_at DESC)
    WHERE is_active = false;

-- Index pour lister l'historique des autorisations ordonnées par date d'octroi
CREATE INDEX idx_authorization_history_granted_at
    ON oauth2_authorization_history(user_id, client_id, granted_at DESC);

-- Commentaires pour la table oauth2_authorization_history
COMMENT ON TABLE oauth2_authorization_history IS 'Historique de toutes les autorisations OAuth2 accordées par les utilisateurs aux clients, avec métadonnées d''appareil, géolocalisation et statut de révocation';
COMMENT ON COLUMN oauth2_authorization_history.id IS 'Identifiant unique de l''entrée d''historique (UUID)';
COMMENT ON COLUMN oauth2_authorization_history.user_id IS 'Référence à l''utilisateur ayant accordé l''autorisation';
COMMENT ON COLUMN oauth2_authorization_history.client_id IS 'Référence au client OAuth2 ayant reçu l''autorisation';
COMMENT ON COLUMN oauth2_authorization_history.authorized_scopes IS 'Tableau des scopes (permissions) accordés au client';
COMMENT ON COLUMN oauth2_authorization_history.ip_address IS 'Adresse IP de l''appareil lors de l''octroi de l''autorisation';
COMMENT ON COLUMN oauth2_authorization_history.user_agent IS 'User-Agent HTTP complet de l''appareil';
COMMENT ON COLUMN oauth2_authorization_history.browser IS 'Nom du navigateur extrait du User-Agent';
COMMENT ON COLUMN oauth2_authorization_history.device_type IS 'Type d''appareil (ordinateur, mobile, tablette)';
COMMENT ON COLUMN oauth2_authorization_history.os IS 'Système d''exploitation de l''appareil';
COMMENT ON COLUMN oauth2_authorization_history.country IS 'Pays déduit de l''adresse IP via géolocalisation';
COMMENT ON COLUMN oauth2_authorization_history.city IS 'Ville déduite de l''adresse IP via géolocalisation';
COMMENT ON COLUMN oauth2_authorization_history.granted_at IS 'Horodatage de l''octroi de l''autorisation';
COMMENT ON COLUMN oauth2_authorization_history.revoked_at IS 'Horodatage de la révocation de l''autorisation (NULL si non révoquée)';
COMMENT ON COLUMN oauth2_authorization_history.is_active IS 'Indique si l''autorisation est actuellement active (false si révoquée ou remplacée suite à un changement de scopes)';
