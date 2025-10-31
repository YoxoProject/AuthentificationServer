import {useEffect, useState} from 'react';
import {Icon} from '@vaadin/react-components/Icon';
import '@vaadin/icons';
import ClientType from "@/generated/fr/romaindu35/authserver/entity/OAuth2Client/ClientType";
import {ScopeSelector} from './ScopeSelector';
import {RedirectUriSelector} from './RedirectUriSelector';
import {CodeBlock} from './CodeBlock';
import {OAuthFlowDiagram} from './OAuthFlowDiagram';
import {PKCEGenerator} from './PKCEGenerator';
import {useOAuthExamples} from '@/hooks/useOAuthExamples';

interface UsageTabProps {
    clientId: string;
    clientType: ClientType;
    redirectUris: string[];
    hasClientSecret: boolean;
}

export function UsageTab({clientId, clientType, redirectUris, hasClientSecret}: UsageTabProps) {
    // Default scopes based on client type
    const getDefaultScopes = () => {
        switch (clientType) {
            case ClientType.SERVICE:
                return ['api_access'];
            case ClientType.CLIENT:
            case ClientType.SERVER:
            default:
                return ['profile']; // Uniquement profile pour CLIENT/SERVER
        }
    };

    const [selectedScopes, setSelectedScopes] = useState<string[]>(getDefaultScopes());
    const [selectedRedirectUri, setSelectedRedirectUri] = useState<string | undefined>(
        redirectUris.length > 0 ? redirectUris[0] : undefined
    );
    const [pkceValues, setPkceValues] = useState<{verifier: string, challenge: string} | null>(null);

    // Update selected redirect URI when redirectUris change
    useEffect(() => {
        if (redirectUris.length > 0 && !selectedRedirectUri) {
            setSelectedRedirectUri(redirectUris[0]);
        }
    }, [redirectUris, selectedRedirectUri]);

    // Reset scopes when client type changes
    useEffect(() => {
        setSelectedScopes(getDefaultScopes());
    }, [clientType]);

    const examples = useOAuthExamples({
        clientId,
        clientType,
        redirectUri: selectedRedirectUri,
        scopes: selectedScopes,
        hasClientSecret,
        pkceValues,
    });

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Guide d'utilisation OAuth2
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                    {clientType === ClientType.CLIENT && "Documentation complète pour intégrer l'authentification OAuth2 dans votre application client (SPA, Mobile) avec PKCE."}
                    {clientType === ClientType.SERVER && "Documentation complète pour intégrer l'authentification OAuth2 dans votre application backend/serveur."}
                    {clientType === ClientType.SERVICE && "Documentation complète pour l'authentification machine-to-machine (M2M) avec le flux Client Credentials."}
                </p>
            </div>

            {/* Configuration Section */}
            <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-sm font-bold">
                        1
                    </span>
                    Configuration préalable
                </h3>

                <div className="space-y-4">
                    {/* Scopes Configuration */}
                    <div
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            Scopes à demander
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Les scopes déterminent les informations auxquelles votre application aura accès.
                            Sélectionnez uniquement ceux dont vous avez réellement besoin.
                        </p>
                        <ScopeSelector
                            clientType={clientType}
                            selectedScopes={selectedScopes}
                            onScopesChange={setSelectedScopes}
                        />
                    </div>

                    {/* Redirect URI Configuration (not for SERVICE) */}
                    {clientType !== ClientType.SERVICE && (
                        <div
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                URI de redirection
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                L'URI de redirection est l'URL vers laquelle l'utilisateur sera redirigé après
                                l'authentification.
                                Elle doit correspondre exactement à une des URIs configurées dans l'onglet
                                "Configuration".
                            </p>
                            <RedirectUriSelector
                                redirectUris={redirectUris}
                                selectedUri={selectedRedirectUri}
                                onUriChange={setSelectedRedirectUri}
                            />
                        </div>
                    )}

                    {/* Important Notes */}
                    <div
                        className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Icon icon="vaadin:warning"
                                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"/>
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <p className="font-medium mb-1">Points importants</p>
                                <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
                                    {clientType === ClientType.CLIENT && (
                                        <>
                                            <li>Utilisez PKCE pour sécuriser le flux (obligatoire pour les clients
                                                publics)
                                            </li>
                                            <li>Ne stockez jamais de tokens dans le localStorage (préférez
                                                sessionStorage ou cookies httpOnly)
                                            </li>
                                            <li>Configurez correctement les CORS dans l'onglet "Configuration"</li>
                                        </>
                                    )}
                                    {clientType === ClientType.SERVER && (
                                        <>
                                            <li>Stockez le client_secret de manière sécurisée (variable
                                                d'environnement)
                                            </li>
                                            <li>Ne jamais exposer le client_secret côté client</li>
                                            <li>Gérez les refresh tokens pour prolonger la session</li>
                                        </>
                                    )}
                                    {clientType === ClientType.SERVICE && (
                                        <>
                                            <li>Stockez le client_secret dans une variable d'environnement</li>
                                            <li>Implémentez un cache pour réutiliser les tokens tant qu'ils sont
                                                valides
                                            </li>
                                            <li>Gérez automatiquement le renouvellement des tokens expirés</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flow Diagram */}
            <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-sm font-bold">
                        2
                    </span>
                    Diagramme du flux OAuth2
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Ce diagramme illustre les différentes étapes du flux d'authentification pour votre type
                    d'application.
                </p>
                <OAuthFlowDiagram clientType={clientType}/>
            </section>

            {/* Step-by-Step Guide */}
            <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 text-white text-sm font-bold">
                        3
                    </span>
                    Guide étape par étape
                </h3>

                <div className="space-y-6">
                    {clientType === ClientType.CLIENT && (
                        <>
                            {/* CLIENT Step 1: PKCE */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 1 : Génération des paramètres PKCE
                                </h4>
                                <div
                                    className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    <p>
                                        <strong>PKCE (Proof Key for Code Exchange)</strong> protège votre application
                                        contre les attaques d'interception de code.
                                    </p>
                                    <p>
                                        Vous devez générer deux valeurs :
                                    </p>
                                    <ul>
                                        <li><code>code_verifier</code> : Une chaîne aléatoire de 43-128 caractères</li>
                                        <li><code>code_challenge</code> : Hash SHA-256 du code_verifier en Base64URL
                                        </li>
                                    </ul>
                                    <p>
                                        Le <code>code_challenge</code> est envoyé avec la requête d'autorisation, et
                                        le <code>code_verifier</code> est conservé
                                        localement pour être envoyé lors de l'échange du code contre le token.
                                    </p>
                                </div>
                                <PKCEGenerator onGenerate={(verifier, challenge) => setPkceValues({verifier, challenge})} />
                            </div>

                            {/* CLIENT Step 2: Authorization */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 2 : Redirection vers la page d'autorisation
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Redirigez l'utilisateur vers le serveur d'autorisation avec les paramètres PKCE.
                                    L'utilisateur sera authentifié et devra donner son consentement.
                                </p>
                                <div className="space-y-4">
                                    {examples.authorizationRequestDescription}
                                    <div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">URL
                                            complète générée :</p>
                                        <CodeBlock code={examples.authorizationUrl} language="text"/>
                                    </div>
                                </div>
                            </div>

                            {/* CLIENT Step 3: Receive Code */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 3 : Réception du code d'autorisation
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Après authentification, l'utilisateur est redirigé vers votre <code
                                    className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">redirect_uri</code> avec
                                    un paramètre <code
                                    className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">code</code> dans l'URL.
                                </p>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                                        {selectedRedirectUri}?code=AUTHORIZATION_CODE&state=STATE_VALUE
                                    </p>
                                </div>
                            </div>

                            {/* CLIENT Step 4: Token Exchange */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 4 : Échange du code contre un token
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Échangez le code d'autorisation contre un access token en utilisant le <code
                                    className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">code_verifier</code> généré
                                    à l'étape 1.
                                </p>
                                <div className="space-y-4">
                                    {examples.tokenRequestDescription}
                                    <CodeBlock code={examples.tokenRequestBody} language="text" title="Body"/>
                                    <CodeBlock code={examples.curlTokenRequest} language="bash"
                                               title="Exemple avec cURL"/>
                                    <div
                                        className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                                        <p className="text-xs text-blue-800 dark:text-blue-200">
                                            <strong>Réponse :</strong> Vous recevrez un JSON contenant <code
                                            className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">access_token</code>,
                                            <code
                                                className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">refresh_token</code>,
                                            <code
                                                className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">expires_in</code>,
                                            et
                                            <code
                                                className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">token_type</code>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CLIENT Step 5: Use Token */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 5 : Utilisation du token
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Utilisez l'access token pour accéder aux APIs protégées en l'incluant dans l'en-tête
                                    Authorization.
                                </p>
                                <CodeBlock code={examples.curlApiRequest || ''} language="bash"
                                           title="Appel API avec le token"/>
                            </div>

                            {/* CLIENT Step 6: Refresh Token */}
                            {examples.curlRefreshToken && (
                                <div
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Étape 6 : Renouvellement du token (optionnel)
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Utilisez le <code
                                        className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">refresh_token</code> pour
                                        obtenir un nouveau access token sans redemander l'authentification.
                                    </p>
                                    <CodeBlock code={examples.curlRefreshToken} language="bash"
                                               title="Renouvellement avec cURL"/>
                                </div>
                            )}
                        </>
                    )}

                    {clientType === ClientType.SERVER && (
                        <>
                            {/* SERVER Step 1: Authorization */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 1 : Redirection vers la page d'autorisation
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Lorsqu'un utilisateur tente de se connecter, redirigez-le vers le serveur
                                    d'autorisation.
                                    Générez un paramètre <code
                                    className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">state</code> aléatoire
                                    pour la sécurité.
                                </p>
                                <div className="space-y-4">
                                    {examples.authorizationRequestDescription}
                                    <div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">URL
                                            complète générée :</p>
                                        <CodeBlock code={examples.authorizationUrl} language="text"/>
                                    </div>
                                </div>
                            </div>

                            {/* SERVER Step 2: Receive Code */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 2 : Réception du code d'autorisation
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Après authentification et consentement, l'utilisateur est redirigé vers votre <code
                                    className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">redirect_uri</code> avec
                                    le paramètre <code
                                    className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">code</code>.
                                    Vérifiez toujours le paramètre <code
                                    className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">state</code> pour
                                    prévenir les attaques CSRF.
                                </p>
                            </div>

                            {/* SERVER Step 3: Token Exchange */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 3 : Échange du code contre un token
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Échangez le code d'autorisation contre un access token en utilisant votre <code
                                    className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">client_secret</code>.
                                    Cette requête doit être faite depuis votre backend (jamais depuis le navigateur).
                                </p>
                                <div className="space-y-4">
                                    {examples.tokenRequestDescription}
                                    <CodeBlock code={examples.tokenRequestBody} language="text" title="Body"/>
                                    <CodeBlock code={examples.curlTokenRequest} language="bash"
                                               title="Exemple avec cURL"/>
                                </div>
                            </div>

                            {/* SERVER Step 4: Refresh Token */}
                            {examples.refreshTokenDescription && (
                                <div
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Étape 4 : Renouvellement du token (optionnel)
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Utilisez le <code
                                        className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">refresh_token</code> pour
                                        obtenir un nouveau access token sans redemander l'authentification.
                                    </p>
                                    <div className="space-y-4">
                                        {examples.refreshTokenDescription}
                                        {examples.curlRefreshToken && (
                                            <CodeBlock code={examples.curlRefreshToken} language="bash"
                                                       title="Exemple avec cURL"/>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SERVER Step 5: Use Token */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 5 : Utilisation du token
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Stockez les tokens de manière sécurisée (session serveur, base de données) et
                                    utilisez-les pour accéder aux ressources.
                                </p>
                                <CodeBlock code={examples.curlApiRequest || ''} language="bash"
                                           title="Appel API avec le token"/>
                            </div>
                        </>
                    )}

                    {clientType === ClientType.SERVICE && (
                        <>
                            {/* SERVICE Step 1: Token Request */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 1 : Obtenir un access token
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Le flux Client Credentials est direct : faites une requête POST au endpoint /token
                                    avec vos credentials.
                                    Aucune interaction utilisateur n'est nécessaire.
                                </p>
                                <div className="space-y-4">
                                    {examples.tokenRequestDescription}
                                    <CodeBlock code={examples.tokenRequestBody} language="text" title="Body"/>
                                    <CodeBlock code={examples.curlTokenRequest} language="bash"
                                               title="Exemple avec cURL"/>
                                    <div
                                        className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                                        <p className="text-xs text-blue-800 dark:text-blue-200">
                                            <strong>Réponse :</strong> Vous recevrez un JSON contenant <code
                                            className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">access_token</code>,
                                            <code
                                                className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">expires_in</code>,
                                            et
                                            <code
                                                className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">token_type</code>.
                                            Pas de refresh_token pour ce flux.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SERVICE Step 2: Use Token */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 2 : Utilisation du token pour les appels API
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Utilisez l'access token dans l'en-tête Authorization de vos requêtes API.
                                    Le scope <code
                                    className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">api_access</code> vous
                                    donne accès aux APIs protégées.
                                </p>
                                <CodeBlock code={examples.curlApiRequest || ''} language="bash"
                                           title="Appel API avec le token"/>
                            </div>

                            {/* SERVICE Step 3: Token Renewal */}
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Étape 3 : Gestion de l'expiration
                                </h4>
                                <div
                                    className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400">
                                    <p>
                                        Les tokens Client Credentials n'ont pas de refresh token. Vous devez redemander
                                        un nouveau token quand il expire.
                                    </p>
                                    <p>
                                        <strong>Implémentez un système de cache</strong> pour éviter de redemander un
                                        token à chaque requête :
                                    </p>
                                    <ul>
                                        <li>Enregistrez l'heure d'expiration (temps actuel + <code>expires_in</code>)
                                        </li>
                                        <li>Vérifiez si le token est toujours valide avant chaque requête</li>
                                        <li>Redemandez un nouveau token uniquement s'il est expiré</li>
                                    </ul>
                                </div>
                                <div
                                    className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Icon icon="vaadin:lightbulb"
                                              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"/>
                                        <div className="text-sm text-blue-800 dark:text-blue-200">
                                            <p className="font-medium mb-1">💡 Bonne pratique</p>
                                            <p className="text-blue-700 dark:text-blue-300">
                                                Mettez une expiration dans votre cache légèrement inférieure à celle du
                                                token
                                                (ex: si le token expire dans 3600s, mettez le cache à 3500s).
                                                Cela évite les erreurs 401 et les requêtes inutiles.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Reference Section */}
            <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 dark:bg-orange-500 text-white text-sm font-bold">
                        4
                    </span>
                    Référence des endpoints
                </h3>

                <div
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Endpoint
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                URL
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Usage
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {clientType !== ClientType.SERVICE && (
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Authorization
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                        /oauth2/authorize
                                    </code>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                    Redirection pour authentification
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                Token
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                    /oauth2/token
                                </code>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                Échange de code ou obtention de token
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Security Best Practices */}
            <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Icon icon="vaadin:shield" className="w-6 h-6 text-red-600 dark:text-red-400"/>
                    Bonnes pratiques de sécurité
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                            <Icon icon="vaadin:check-circle" className="w-5 h-5"/>
                            À faire
                        </h4>
                        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
                            <li>Toujours vérifier le paramètre state</li>
                            <li>Stocker les secrets en variables d'environnement</li>
                            <li>Utiliser HTTPS en production</li>
                            <li>Implémenter une gestion d'erreurs robuste</li>
                            <li>Logger les tentatives d'authentification</li>
                        </ul>
                    </div>

                    <div
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                            <Icon icon="vaadin:close-circle" className="w-5 h-5"/>
                            À éviter
                        </h4>
                        <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
                            <li>Exposer le client_secret côté client</li>
                            <li>Stocker des tokens dans localStorage</li>
                            <li>Utiliser HTTP en production</li>
                            <li>Ignorer la validation du state</li>
                            <li>Hardcoder les credentials dans le code</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}
