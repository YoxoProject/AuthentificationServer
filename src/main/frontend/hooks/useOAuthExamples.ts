import { useMemo } from 'react';
import ClientType from "@/generated/fr/romaindu35/authserver/entity/OAuth2Client/ClientType";

const AUTH_SERVER_BASE_URL = 'https://auth.yoxo.software';

interface UseOAuthExamplesProps {
    clientId: string;
    clientType: ClientType;
    redirectUri?: string;
    scopes: string[];
    hasClientSecret: boolean;
}

interface OAuthExample {
    // URLs complètes
    authorizationUrl: string;
    tokenEndpoint: string;

    // Descriptions des requêtes HTTP
    authorizationRequestDescription: string;
    tokenRequestDescription: string;
    tokenRequestBody: string;
    refreshTokenDescription?: string;

    // Exemples cURL
    curlTokenRequest: string;
    curlRefreshToken?: string;
    curlApiRequest?: string;
}

export function useOAuthExamples({
    clientId,
    clientType,
    redirectUri,
    scopes,
    hasClientSecret
}: UseOAuthExamplesProps): OAuthExample {
    return useMemo(() => {
        const scopeString = scopes.join(' ');
        const encodedScopes = encodeURIComponent(scopeString);
        const encodedRedirectUri = redirectUri ? encodeURIComponent(redirectUri) : '';

        const tokenEndpoint = `${AUTH_SERVER_BASE_URL}/oauth2/token`;

        // Construction de l'URL d'autorisation pour CLIENT et SERVER
        const authorizationUrl = clientType !== ClientType.SERVICE
            ? `${AUTH_SERVER_BASE_URL}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUri}&scope=${encodedScopes}&state=RANDOM_STATE_VALUE${clientType === ClientType.CLIENT ? '&code_challenge=CODE_CHALLENGE_VALUE&code_challenge_method=S256' : ''}`
            : '';

        // Descriptions des requêtes
        let authorizationRequestDescription = '';
        let tokenRequestDescription = '';
        let tokenRequestBody = '';
        let refreshTokenDescription = '';

        // cURL examples
        let curlTokenRequest = '';
        let curlRefreshToken = '';
        let curlApiRequest = '';

        if (clientType === ClientType.CLIENT) {
            // CLIENT - PKCE Flow
            authorizationRequestDescription = `**GET** \`/oauth2/authorize\`

**Paramètres requis :**
- \`response_type=code\` : Type de réponse OAuth2
- \`client_id=${clientId}\` : Votre Client ID
- \`redirect_uri=${redirectUri || 'YOUR_REDIRECT_URI'}\` : URI de redirection configurée
- \`scope=${scopeString}\` : Scopes demandés
- \`state=RANDOM_VALUE\` : Valeur aléatoire pour prévenir les attaques CSRF
- \`code_challenge=SHA256_HASH\` : Hash SHA-256 du code_verifier (PKCE)
- \`code_challenge_method=S256\` : Méthode de hash utilisée`;

            tokenRequestDescription = `**POST** \`/oauth2/token\`

**Headers :**
- \`Content-Type: application/x-www-form-urlencoded\`

**Body (form-urlencoded) :**`;

            tokenRequestBody = `grant_type=authorization_code
code=AUTHORIZATION_CODE_FROM_CALLBACK
client_id=${clientId}
redirect_uri=${redirectUri || 'YOUR_REDIRECT_URI'}
code_verifier=ORIGINAL_CODE_VERIFIER_FROM_STEP_1`;

            curlTokenRequest = `curl -X POST '${tokenEndpoint}' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=authorization_code' \\
  -d 'code=AUTHORIZATION_CODE' \\
  -d 'client_id=${clientId}' \\
  -d 'redirect_uri=${redirectUri || 'YOUR_REDIRECT_URI'}' \\
  -d 'code_verifier=CODE_VERIFIER_FROM_STEP_1'`;

            curlRefreshToken = `curl -X POST '${tokenEndpoint}' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=refresh_token' \\
  -d 'refresh_token=YOUR_REFRESH_TOKEN' \\
  -d 'client_id=${clientId}'`;

        } else if (clientType === ClientType.SERVER) {
            // SERVER - Authorization Code Flow
            authorizationRequestDescription = `**GET** \`/oauth2/authorize\`

**Paramètres requis :**
- \`response_type=code\` : Type de réponse OAuth2
- \`client_id=${clientId}\` : Votre Client ID
- \`redirect_uri=${redirectUri || 'YOUR_REDIRECT_URI'}\` : URI de redirection configurée
- \`scope=${scopeString}\` : Scopes demandés
- \`state=RANDOM_VALUE\` : Valeur aléatoire pour prévenir les attaques CSRF`;

            tokenRequestDescription = `**POST** \`/oauth2/token\`

**Headers :**
- \`Content-Type: application/x-www-form-urlencoded\`

**Body (form-urlencoded) :**`;

            tokenRequestBody = `grant_type=authorization_code
code=AUTHORIZATION_CODE_FROM_CALLBACK
client_id=${clientId}
client_secret=YOUR_CLIENT_SECRET
redirect_uri=${redirectUri || 'YOUR_REDIRECT_URI'}`;

            curlTokenRequest = `curl -X POST '${tokenEndpoint}' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=authorization_code' \\
  -d 'code=AUTHORIZATION_CODE' \\
  -d 'client_id=${clientId}' \\
  -d 'client_secret=YOUR_CLIENT_SECRET' \\
  -d 'redirect_uri=${redirectUri || 'YOUR_REDIRECT_URI'}'`;

            refreshTokenDescription = `**POST** \`/oauth2/token\`

**Headers :**
- \`Content-Type: application/x-www-form-urlencoded\`

**Body (form-urlencoded) :**
\`\`\`
grant_type=refresh_token
refresh_token=YOUR_REFRESH_TOKEN
client_id=${clientId}
client_secret=YOUR_CLIENT_SECRET
\`\`\``;

            curlRefreshToken = `curl -X POST '${tokenEndpoint}' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=refresh_token' \\
  -d 'refresh_token=YOUR_REFRESH_TOKEN' \\
  -d 'client_id=${clientId}' \\
  -d 'client_secret=YOUR_CLIENT_SECRET'`;

        } else {
            // SERVICE - Client Credentials Flow
            tokenRequestDescription = `**POST** \`/oauth2/token\`

**Headers :**
- \`Content-Type: application/x-www-form-urlencoded\`

**Body (form-urlencoded) :**`;

            tokenRequestBody = `grant_type=client_credentials
client_id=${clientId}
client_secret=YOUR_CLIENT_SECRET
scope=${scopeString}`;

            curlTokenRequest = `curl -X POST '${tokenEndpoint}' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=client_credentials' \\
  -d 'client_id=${clientId}' \\
  -d 'client_secret=YOUR_CLIENT_SECRET' \\
  -d 'scope=${scopeString}'`;
        }

        // Exemple d'appel API avec le token (commun à tous)
        curlApiRequest = `curl -X GET 'https://api.yoxo.software/v1/resource' \\
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'`;

        return {
            authorizationUrl,
            tokenEndpoint,
            authorizationRequestDescription,
            tokenRequestDescription,
            tokenRequestBody,
            refreshTokenDescription,
            curlTokenRequest,
            curlRefreshToken,
            curlApiRequest,
        };
    }, [clientId, clientType, redirectUri, scopes, hasClientSecret]);
}
