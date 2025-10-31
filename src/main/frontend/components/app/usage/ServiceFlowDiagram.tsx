export function ServiceFlowDiagram() {
    return (
        <svg viewBox="0 0 800 500" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            {/* Background */}
            <rect width="800" height="500" fill="transparent"/>

            {/* Title */}
            <text x="400" y="30" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-bold text-xl">
                Flux OAuth2 - SERVICE (Machine-to-Machine)
            </text>

            {/* Actors */}
            {/* Your Service */}
            <g id="service">
                <rect x="50" y="80" width="160" height="60" rx="8" className="fill-indigo-100 dark:fill-indigo-900 stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2"/>
                <text x="130" y="105" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-semibold text-sm">Votre Service</text>
                <text x="130" y="125" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">(Backend/Cron/Script)</text>
            </g>

            {/* Auth Server */}
            <g id="authserver">
                <rect x="320" y="80" width="160" height="60" rx="8" className="fill-purple-100 dark:fill-purple-900 stroke-purple-600 dark:stroke-purple-400" strokeWidth="2"/>
                <text x="400" y="105" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-semibold text-sm">Serveur Auth</text>
                <text x="400" y="125" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">auth.yoxo.software</text>
            </g>

            {/* Resource API */}
            <g id="api">
                <rect x="590" y="80" width="160" height="60" rx="8" className="fill-green-100 dark:fill-green-900 stroke-green-600 dark:stroke-green-400" strokeWidth="2"/>
                <text x="670" y="105" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-semibold text-sm">API Protégée</text>
                <text x="670" y="125" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">(Ressources)</text>
            </g>

            {/* Step 1: Token Request */}
            <g id="step1">
                <circle cx="30" cy="200" r="14" className="fill-indigo-600 dark:fill-indigo-400"/>
                <text x="30" y="205" textAnchor="middle" className="fill-white font-bold text-sm">1</text>
                <line x1="210" y1="200" x2="320" y2="200" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2" markerEnd="url(#arrowindigo)"/>
                <text x="265" y="190" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">POST /oauth2/token</text>
                <text x="265" y="215" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-mono">grant_type=client_credentials</text>
                <text x="265" y="230" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-mono">+ client_id + client_secret</text>
            </g>

            {/* Step 2: Verify Credentials */}
            <g id="step2">
                <circle cx="30" cy="270" r="14" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="30" y="275" textAnchor="middle" className="fill-white font-bold text-sm">2</text>
                <rect x="320" y="255" width="160" height="30" rx="4" className="fill-purple-50 dark:fill-purple-950 stroke-purple-300 dark:stroke-purple-700" strokeWidth="1"/>
                <text x="400" y="275" textAnchor="middle" className="fill-gray-800 dark:fill-gray-200 text-xs font-medium">Vérification des credentials</text>
            </g>

            {/* Step 3: Access Token Response */}
            <g id="step3">
                <circle cx="30" cy="330" r="14" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="30" y="335" textAnchor="middle" className="fill-white font-bold text-sm">3</text>
                <line x1="320" y1="330" x2="210" y2="330" className="stroke-purple-600 dark:stroke-purple-400" strokeWidth="2" markerEnd="url(#arrowpurple)"/>
                <text x="265" y="320" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">access_token</text>
                <text x="265" y="345" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs">(Pas de refresh_token)</text>
            </g>

            {/* Step 4: API Request */}
            <g id="step4">
                <circle cx="30" cy="400" r="14" className="fill-green-600 dark:fill-green-400"/>
                <text x="30" y="405" textAnchor="middle" className="fill-white font-bold text-sm">4</text>
                <line x1="210" y1="400" x2="590" y2="400" className="stroke-green-600 dark:stroke-green-400" strokeWidth="2" markerEnd="url(#arrowgreen)"/>
                <text x="400" y="390" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Requête API avec scope API_ACCESS</text>
                <text x="400" y="415" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-mono">Authorization: Bearer [token]</text>
            </g>

            {/* Step 5: API Response */}
            <g id="step5">
                <circle cx="30" cy="460" r="14" className="fill-green-600 dark:fill-green-400"/>
                <text x="30" y="465" textAnchor="middle" className="fill-white font-bold text-sm">5</text>
                <line x1="590" y1="460" x2="210" y2="460" className="stroke-green-600 dark:stroke-green-400" strokeWidth="2" markerEnd="url(#arrowgreen)"/>
                <text x="400" y="450" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Données de l'API</text>
            </g>

            {/* Arrow markers */}
            <defs>
                <marker id="arrowindigo" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" className="fill-indigo-600 dark:fill-indigo-400"/>
                </marker>
                <marker id="arrowpurple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" className="fill-purple-600 dark:fill-purple-400"/>
                </marker>
                <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" className="fill-green-600 dark:fill-green-400"/>
                </marker>
            </defs>

            {/* Info boxes */}
            <g id="info2" transform="translate(550, 180)">
                <rect x="0" y="0" width="200" height="95" rx="4" className="fill-yellow-50 dark:fill-yellow-900/20 stroke-yellow-400 dark:stroke-yellow-700" strokeWidth="1"/>
                <text x="100" y="20" textAnchor="middle" className="fill-yellow-800 dark:fill-yellow-200 font-semibold text-xs">⚠️ Important</text>
                <text x="100" y="38" textAnchor="middle" className="fill-yellow-700 dark:fill-yellow-300 text-xs">Scope unique: API_ACCESS</text>
                <text x="100" y="53" textAnchor="middle" className="fill-yellow-700 dark:fill-yellow-300 text-xs">Token sans refresh</text>
                <text x="100" y="68" textAnchor="middle" className="fill-yellow-700 dark:fill-yellow-300 text-xs">Redemander un token</text>
                <text x="100" y="83" textAnchor="middle" className="fill-yellow-700 dark:fill-yellow-300 text-xs">quand il expire</text>
            </g>

            <g id="info3" transform="translate(550, 300)">
                <rect x="0" y="0" width="200" height="80" rx="4" className="fill-green-50 dark:fill-green-900/20 stroke-green-400 dark:stroke-green-700" strokeWidth="1"/>
                <text x="100" y="20" textAnchor="middle" className="fill-green-800 dark:fill-green-200 font-semibold text-xs">🔒 Sécurité</text>
                <text x="100" y="38" textAnchor="middle" className="fill-green-700 dark:fill-green-300 text-xs">Client secret requis</text>
                <text x="100" y="53" textAnchor="middle" className="fill-green-700 dark:fill-green-300 text-xs">Stocker en variable</text>
                <text x="100" y="68" textAnchor="middle" className="fill-green-700 dark:fill-green-300 text-xs">d'environnement</text>
            </g>

            {/* Use case examples */}
            <g id="usecases" transform="translate(630, 405)">
                <text x="0" y="0" className="fill-gray-700 dark:fill-gray-300 font-semibold text-xs">Cas d'usage:</text>
                <text x="0" y="18" className="fill-gray-600 dark:fill-gray-400 text-xs">• Jobs planifiés (cron)</text>
                <text x="0" y="33" className="fill-gray-600 dark:fill-gray-400 text-xs">• Services backend</text>
                <text x="0" y="48" className="fill-gray-600 dark:fill-gray-400 text-xs">• Intégrations M2M</text>
                <text x="0" y="63" className="fill-gray-600 dark:fill-gray-400 text-xs">• Scripts automatisés</text>
            </g>
        </svg>
    );
}
