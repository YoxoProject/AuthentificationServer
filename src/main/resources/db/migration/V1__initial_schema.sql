-- =============================================================================
-- Version: 1
-- Description: Création du schéma initial pour les utilisateurs et clients OAuth2
-- Date: 2025-11-04
-- =============================================================================

-- =============================================================================
-- TABLE: users
-- Description: Stocke les comptes utilisateurs
-- =============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    additional_permissions TEXT[] NOT NULL DEFAULT '{}',

    -- Contraintes
    CONSTRAINT users_username_not_empty CHECK (username <> ''),
    CONSTRAINT users_username_length CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 255)
);

-- Index pour la table users
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_last_login_at ON users(last_login_at DESC);

-- Commentaires pour la table users
COMMENT ON TABLE users IS 'Comptes utilisateurs du serveur d''authentification Yoxo';
COMMENT ON COLUMN users.id IS 'Identifiant unique de l''utilisateur (UUID)';
COMMENT ON COLUMN users.username IS 'Nom d''utilisateur unique pour l''authentification (identique au pseudo NationsGlory)';
COMMENT ON COLUMN users.created_at IS 'Horodatage de la création du compte utilisateur';
COMMENT ON COLUMN users.last_login_at IS 'Horodatage de la dernière connexion réussie de l''utilisateur';
COMMENT ON COLUMN users.additional_permissions IS 'Tableau des permissions (scopes) additionnelles accordées à cet utilisateur';

-- =============================================================================
-- TABLE: oauth2_client
-- Description: Stocke les configurations des clients OAuth2
-- =============================================================================
CREATE TABLE oauth2_client (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    client_id_issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    client_secret VARCHAR(255),
    client_secret_expires_at TIMESTAMP WITH TIME ZONE,
    client_name VARCHAR(255) NOT NULL,
    client_type VARCHAR(50) NOT NULL,
    redirect_uris TEXT[] NOT NULL DEFAULT '{}',
    cors_url TEXT[] NOT NULL DEFAULT '{}',
    official BOOLEAN NOT NULL DEFAULT false,
    owner_id UUID NOT NULL,


    -- Contraintes
    CONSTRAINT oauth2_client_client_id_not_empty CHECK (client_id <> ''),
    CONSTRAINT oauth2_client_client_name_not_empty CHECK (client_name <> ''),
    CONSTRAINT oauth2_client_client_type_valid CHECK (client_type IN ('CLIENT', 'SERVER', 'SERVICE')),
    CONSTRAINT oauth2_client_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour la table oauth2_client
CREATE INDEX idx_oauth2_client_client_id ON oauth2_client(client_id);
CREATE INDEX idx_oauth2_client_owner_id ON oauth2_client(owner_id);
CREATE INDEX idx_oauth2_client_issued_at ON oauth2_client(client_id_issued_at DESC);

-- Commentaires pour la table oauth2_client
COMMENT ON TABLE oauth2_client IS 'Enregistrements des clients OAuth2';
COMMENT ON COLUMN oauth2_client.id IS 'Identifiant unique du client OAuth2 permettant de le référencer informatiquement';
COMMENT ON COLUMN oauth2_client.client_id IS 'Identifiant unique du client OAuth2 permettant de le référencer lors des requêtes (peut être régénéré)';
COMMENT ON COLUMN oauth2_client.client_id_issued_at IS 'Horodatage de l''émission du client_id';
COMMENT ON COLUMN oauth2_client.client_secret IS 'Secret client haché (BCrypt) pour l''authentification';
COMMENT ON COLUMN oauth2_client.client_secret_expires_at IS 'Horodatage d''expiration du secret client';
COMMENT ON COLUMN oauth2_client.client_name IS 'Nom lisible de l''application';
COMMENT ON COLUMN oauth2_client.client_type IS 'Type de client: CLIENT (auth utilisateur côté client), SERVER (auth utilisateur côté serveur), SERVICE (client credentials uniquement)';
COMMENT ON COLUMN oauth2_client.redirect_uris IS 'Tableau des URIs de redirection autorisées';
COMMENT ON COLUMN oauth2_client.cors_url IS 'Tableau des URLs autorisées pour CORS';
COMMENT ON COLUMN oauth2_client.official IS 'Indique si le client est officiel ou non (permet de bypass le consentement)';
COMMENT ON COLUMN oauth2_client.owner_id IS 'UUID de l''utilisateur propriétaire du client OAuth2';
