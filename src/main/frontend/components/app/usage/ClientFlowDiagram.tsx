export function ClientFlowDiagram() {
    return (
        <svg viewBox="0 0 800 600" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            {/* Background */}
            <rect width="800" height="600" fill="transparent"/>

            {/* Title */}
            <text x="400" y="30" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-bold text-xl">
                Flux OAuth2 - CLIENT (SPA/Mobile avec PKCE)
            </text>

            {/* Actors */}
            {/* User Browser */}
            <g id="browser">
                <rect x="50" y="80" width="140" height="60" rx="8" className="fill-blue-100 dark:fill-blue-900 stroke-blue-600 dark:stroke-blue-400" strokeWidth="2"/>
                <text x="120" y="105" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-semibold text-sm">Navigateur</text>
                <text x="120" y="125" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">(Application SPA)</text>
            </g>

            {/* Auth Server */}
            <g id="authserver">
                <rect x="330" y="80" width="140" height="60" rx="8" className="fill-purple-100 dark:fill-purple-900 stroke-purple-600 dark:stroke-purple-400" strokeWidth="2"/>
                <text x="400" y="105" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-semibold text-sm">Serveur Auth</text>
                <text x="400" y="125" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">auth.yoxo.software</text>
            </g>

            {/* Resource Server */}
            <g id="resourceserver">
                <rect x="610" y="80" width="140" height="60" rx="8" className="fill-green-100 dark:fill-green-900 stroke-green-600 dark:stroke-green-400" strokeWidth="2"/>
                <text x="680" y="105" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-semibold text-sm">API</text>
                <text x="680" y="125" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">(Ressources)</text>
            </g>

            {/* Step 1: Generate PKCE */}
            <g id="step1">
                <circle cx="30" cy="180" r="14" className="fill-blue-600 dark:fill-blue-400"/>
                <text x="30" y="185" textAnchor="middle" className="fill-white font-bold text-sm">1</text>
                <rect x="50" y="165" width="140" height="30" rx="4" className="fill-blue-50 dark:fill-blue-950 stroke-blue-300 dark:stroke-blue-700" strokeWidth="1"/>
                <text x="120" y="185" textAnchor="middle" className="fill-gray-800 dark:fill-gray-200 text-xs font-medium">Génération PKCE</text>
            </g>

            {/* Step 2: Authorization Request */}
            <g id="step2">
                <circle cx="30" cy="230" r="14" className="fill-blue-600 dark:fill-blue-400"/>
                <text x="30" y="235" textAnchor="middle" className="fill-white font-bold text-sm">2</text>
                <line x1="190" y1="230" x2="330" y2="230" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" markerEnd="url(#arrowblue)"/>
                <text x="260" y="220" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Redirection vers /authorize</text>
                <text x="260" y="245" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-mono">+ code_challenge</text>
            </g>

            {/* Step 3: User Authentication */}
            <g id="step3">
                <circle cx="30" cy="290" r="14" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="30" y="295" textAnchor="middle" className="fill-white font-bold text-sm">3</text>
                <rect x="330" y="275" width="140" height="30" rx="4" className="fill-purple-50 dark:fill-purple-950 stroke-purple-300 dark:stroke-purple-700" strokeWidth="1"/>
                <text x="400" y="295" textAnchor="middle" className="fill-gray-800 dark:fill-gray-200 text-xs font-medium">Authentification</text>
            </g>

            {/* Step 4: User Consent */}
            <g id="step4">
                <circle cx="30" cy="340" r="14" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="30" y="345" textAnchor="middle" className="fill-white font-bold text-sm">4</text>
                <rect x="330" y="325" width="140" height="30" rx="4" className="fill-purple-50 dark:fill-purple-950 stroke-purple-300 dark:stroke-purple-700" strokeWidth="1"/>
                <text x="400" y="345" textAnchor="middle" className="fill-gray-800 dark:fill-gray-200 text-xs font-medium">Consentement</text>
            </g>

            {/* Step 5: Authorization Code */}
            <g id="step5">
                <circle cx="30" cy="390" r="14" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="30" y="395" textAnchor="middle" className="fill-white font-bold text-sm">5</text>
                <line x1="330" y1="390" x2="190" y2="390" className="stroke-purple-600 dark:stroke-purple-400" strokeWidth="2" markerEnd="url(#arrowpurple)"/>
                <text x="260" y="380" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Redirection + code</text>
                <text x="260" y="405" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs">vers redirect_uri</text>
            </g>

            {/* Step 6: Token Request */}
            <g id="step6">
                <circle cx="30" cy="450" r="14" className="fill-blue-600 dark:fill-blue-400"/>
                <text x="30" y="455" textAnchor="middle" className="fill-white font-bold text-sm">6</text>
                <line x1="190" y1="450" x2="330" y2="450" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" markerEnd="url(#arrowblue)"/>
                <text x="260" y="440" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">POST /token</text>
                <text x="260" y="465" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-mono">+ code + code_verifier</text>
            </g>

            {/* Step 7: Access Token */}
            <g id="step7">
                <circle cx="30" cy="500" r="14" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="30" y="505" textAnchor="middle" className="fill-white font-bold text-sm">7</text>
                <line x1="330" y1="500" x2="190" y2="500" className="stroke-purple-600 dark:stroke-purple-400" strokeWidth="2" markerEnd="url(#arrowpurple)"/>
                <text x="260" y="490" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">access_token</text>
                <text x="260" y="515" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs">+ refresh_token</text>
            </g>

            {/* Step 8: API Call */}
            <g id="step8">
                <circle cx="30" cy="550" r="14" className="fill-green-600 dark:fill-green-400"/>
                <text x="30" y="555" textAnchor="middle" className="fill-white font-bold text-sm">8</text>
                <line x1="190" y1="550" x2="610" y2="550" className="stroke-green-600 dark:stroke-green-400" strokeWidth="2" markerEnd="url(#arrowgreen)"/>
                <text x="400" y="540" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Requête API</text>
                <text x="400" y="565" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-mono">Authorization: Bearer token</text>
            </g>

            {/* Arrow markers */}
            <defs>
                <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" className="fill-blue-600 dark:fill-blue-400"/>
                </marker>
                <marker id="arrowpurple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" className="fill-purple-600 dark:fill-purple-400"/>
                </marker>
                <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" className="fill-green-600 dark:fill-green-400"/>
                </marker>
            </defs>

            {/* Legend */}
            <g id="legend" transform="translate(550, 180)">
                <text x="0" y="0" className="fill-gray-700 dark:fill-gray-300 font-semibold text-xs">Légende:</text>
                <circle cx="10" cy="20" r="8" className="fill-blue-600 dark:fill-blue-400"/>
                <text x="25" y="25" className="fill-gray-600 dark:fill-gray-400 text-xs">Client</text>

                <circle cx="10" cy="45" r="8" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="25" y="50" className="fill-gray-600 dark:fill-gray-400 text-xs">Serveur Auth</text>

                <circle cx="10" cy="70" r="8" className="fill-green-600 dark:fill-green-400"/>
                <text x="25" y="75" className="fill-gray-600 dark:fill-gray-400 text-xs">API</text>
            </g>

            {/* Note about PKCE */}
            <g id="note" transform="translate(550, 280)">
                <rect x="0" y="0" width="200" height="80" rx="4" className="fill-yellow-50 dark:fill-yellow-900/20 stroke-yellow-400 dark:stroke-yellow-700" strokeWidth="1"/>
                <text x="100" y="20" textAnchor="middle" className="fill-yellow-800 dark:fill-yellow-200 font-semibold text-xs">🔒 Sécurité PKCE</text>
                <text x="100" y="38" textAnchor="middle" className="fill-yellow-700 dark:fill-yellow-300 text-xs">Pas de client_secret</text>
                <text x="100" y="53" textAnchor="middle" className="fill-yellow-700 dark:fill-yellow-300 text-xs">Code challenge protège</text>
                <text x="100" y="68" textAnchor="middle" className="fill-yellow-700 dark:fill-yellow-300 text-xs">contre l'interception</text>
            </g>
        </svg>
    );
}
