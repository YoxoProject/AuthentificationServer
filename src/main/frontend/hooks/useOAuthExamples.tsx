import {useMemo} from 'react';
import ClientType from "@/generated/fr/romaindu35/authserver/entity/OAuth2Client/ClientType";

const AUTH_SERVER_BASE_URL = 'https://auth.yoxo.software';

interface UseOAuthExamplesProps {
    clientId: string;
    clientType: ClientType;
    redirectUri?: string;
    scopes: string[];
    hasClientSecret: boolean;
    pkceValues?: { verifier: string, challenge: string } | null;
}

interface OAuthExample {
    // URLs complètes
    authorizationUrl: string;
    tokenEndpoint: string;

    // Descriptions des requêtes HTTP (JSX)
    authorizationRequestDescription: JSX.Element;
    tokenRequestDescription: JSX.Element;
    tokenRequestBody: string;
    refreshTokenDescription?: JSX.Element;

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
                                     hasClientSecret,
                                     pkceValues
                                 }: UseOAuthExamplesProps): OAuthExample {
    return useMemo(() => {
        const scopeString = scopes.join(' ');
        const encodedScopes = encodeURIComponent(scopeString);
        const encodedRedirectUri = redirectUri ? encodeURIComponent(redirectUri) : '';

        const tokenEndpoint = `${AUTH_SERVER_BASE_URL}/oauth2/token`;

        // Valeurs PKCE : utiliser les valeurs générées ou des placeholders
        const codeChallenge = pkceValues?.challenge || 'CODE_CHALLENGE_VALUE';
        const codeVerifier = pkceValues?.verifier || 'CODE_VERIFIER_VALUE';

        // Construction de l'URL d'autorisation pour CLIENT et SERVER
        const authorizationUrl = clientType !== ClientType.SERVICE
            ? `${AUTH_SERVER_BASE_URL}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUri}&scope=${encodedScopes}&state=RANDOM_STATE_VALUE${clientType === ClientType.CLIENT ? `&code_challenge=${codeChallenge}&code_challenge_method=S256` : ''}`
            : '';

        // Descriptions des requêtes
        let authorizationRequestDescription: JSX.Element;
        let tokenRequestDescription: JSX.Element;
        let tokenRequestBody = '';
        let refreshTokenDescription: JSX.Element | undefined;

        // cURL examples
        let curlTokenRequest = '';
        let curlRefreshToken = '';
        let curlApiRequest = '';

        if (clientType === ClientType.CLIENT) {
            // CLIENT - PKCE Flow
            authorizationRequestDescription = (
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="text-gray-900 dark:text-gray-100">GET</strong> <code
                        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/oauth2/authorize</code>
                    </p>
                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Paramètres requis :</p>
                        <ul className="space-y-1.5 ml-4">
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">response_type=code</code> :
                                Type de réponse OAuth2
                            </li>
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">client_id={clientId}</code> :
                                Votre Client ID
                            </li>
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">redirect_uri={redirectUri || 'YOUR_REDIRECT_URI'}</code> :
                                URI de redirection configurée
                            </li>
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">scope={scopeString}</code> :
                                Scopes demandés
                            </li>
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">state=RANDOM_VALUE</code> :
                                Valeur aléatoire pour prévenir les attaques CSRF
                            </li>
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">code_challenge=SHA256_HASH</code> :
                                Hash SHA-256 du code_verifier (PKCE)
                            </li>
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">code_challenge_method=S256</code> :
                                Méthode de hash utilisée
                            </li>
                        </ul>
                    </div>
                </div>
            );

            tokenRequestDescription = (
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="text-gray-900 dark:text-gray-100">POST</strong> <code
                        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/oauth2/token</code></p>
                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Headers :</p>
                        <ul className="space-y-1.5 ml-4">
                            <li><code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Content-Type:
                                application/x-www-form-urlencoded</code></li>
                        </ul>
                    </div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Body (form-urlencoded) :</p>
                </div>
            );

            tokenRequestBody = `grant_type=authorization_code
code=AUTHORIZATION_CODE_FROM_CALLBACK
client_id=${clientId}
redirect_uri=${redirectUri || 'YOUR_REDIRECT_URI'}
code_verifier=${codeVerifier}`;

            curlTokenRequest = `curl -X POST '${tokenEndpoint}' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=authorization_code' \\
  -d 'code=AUTHORIZATION_CODE' \\
  -d 'client_id=${clientId}' \\
  -d 'redirect_uri=${redirectUri || 'YOUR_REDIRECT_URI'}' \\
  -d 'code_verifier=${codeVerifier}'`;

            curlRefreshToken = `curl -X POST '${tokenEndpoint}' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=refresh_token' \\
  -d 'refresh_token=YOUR_REFRESH_TOKEN' \\
  -d 'client_id=${clientId}'`;

        } else if (clientType === ClientType.SERVER) {
            // SERVER - Authorization Code Flow
            authorizationRequestDescription = (
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="text-gray-900 dark:text-gray-100">GET</strong> <code
                        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/oauth2/authorize</code>
                    </p>
                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Paramètres requis :</p>
                        <ul className="space-y-1.5 ml-4">
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">response_type=code</code> :
                                Type de réponse OAuth2
                            </li>
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">client_id={clientId}</code> :
                                Votre Client ID
                            </li>
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">redirect_uri={redirectUri || 'YOUR_REDIRECT_URI'}</code> :
                                URI de redirection configurée
                            </li>
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">scope={scopeString}</code> :
                                Scopes demandés
                            </li>
                            <li><code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">state=RANDOM_VALUE</code> :
                                Valeur aléatoire pour prévenir les attaques CSRF
                            </li>
                        </ul>
                    </div>
                </div>
            );

            tokenRequestDescription = (
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="text-gray-900 dark:text-gray-100">POST</strong> <code
                        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/oauth2/token</code></p>
                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Headers :</p>
                        <ul className="space-y-1.5 ml-4">
                            <li><code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Content-Type:
                                application/x-www-form-urlencoded</code></li>
                        </ul>
                    </div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Body (form-urlencoded) :</p>
                </div>
            );

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

            refreshTokenDescription = (
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="text-gray-900 dark:text-gray-100">POST</strong> <code
                        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/oauth2/token</code></p>
                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Headers :</p>
                        <ul className="space-y-1.5 ml-4">
                            <li><code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Content-Type:
                                application/x-www-form-urlencoded</code></li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Body (form-urlencoded) :</p>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
{`grant_type=refresh_token
refresh_token=YOUR_REFRESH_TOKEN
client_id=${clientId}
client_secret=YOUR_CLIENT_SECRET`}
                        </pre>
                    </div>
                </div>
            );

            curlRefreshToken = `curl -X POST '${tokenEndpoint}' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=refresh_token' \\
  -d 'refresh_token=YOUR_REFRESH_TOKEN' \\
  -d 'client_id=${clientId}' \\
  -d 'client_secret=YOUR_CLIENT_SECRET'`;

        } else {
            // SERVICE - Client Credentials Flow
            authorizationRequestDescription = <></>;

            tokenRequestDescription = (
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="text-gray-900 dark:text-gray-100">POST</strong> <code
                        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/oauth2/token</code></p>
                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Headers :</p>
                        <ul className="space-y-1.5 ml-4">
                            <li><code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Content-Type:
                                application/x-www-form-urlencoded</code></li>
                        </ul>
                    </div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Body (form-urlencoded) :</p>
                </div>
            );

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
    }, [clientId, clientType, redirectUri, scopes, hasClientSecret, pkceValues]);
}
