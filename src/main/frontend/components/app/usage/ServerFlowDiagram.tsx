export function ServerFlowDiagram() {
    return (
        <svg viewBox="0 0 800 770" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            {/* Background */}
            <rect width="800" height="770" fill="transparent"/>

            {/* Title */}
            <text x="400" y="30" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-bold text-xl">
                Flux OAuth2 - SERVER (Application Backend)
            </text>

            {/* Actors */}
            {/* User Browser */}
            <g id="browser">
                <rect x="50" y="80" width="140" height="60" rx="8" className="fill-blue-100 dark:fill-blue-900 stroke-blue-600 dark:stroke-blue-400" strokeWidth="2"/>
                <text x="120" y="105" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-semibold text-sm">Navigateur</text>
                <text x="120" y="125" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">(Utilisateur)</text>
            </g>

            {/* Backend Server */}
            <g id="backend">
                <rect x="250" y="80" width="140" height="60" rx="8" className="fill-orange-100 dark:fill-orange-900 stroke-orange-600 dark:stroke-orange-400" strokeWidth="2"/>
                <text x="320" y="105" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-semibold text-sm">Backend</text>
                <text x="320" y="125" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">(Votre serveur)</text>
            </g>

            {/* Auth Server */}
            <g id="authserver">
                <rect x="450" y="80" width="140" height="60" rx="8" className="fill-purple-100 dark:fill-purple-900 stroke-purple-600 dark:stroke-purple-400" strokeWidth="2"/>
                <text x="520" y="105" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-semibold text-sm">Serveur Auth</text>
                <text x="520" y="125" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">auth.yoxo.software</text>
            </g>

            {/* Resource Server / API */}
            <g id="resourceserver">
                <rect x="610" y="80" width="140" height="60" rx="8" className="fill-green-100 dark:fill-green-900 stroke-green-600 dark:stroke-green-400" strokeWidth="2"/>
                <text x="680" y="105" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-semibold text-sm">API</text>
                <text x="680" y="125" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">(Ressources)</text>
            </g>

            {/* Step 1: User Request */}
            <g id="step1">
                <circle cx="30" cy="180" r="14" className="fill-blue-600 dark:fill-blue-400"/>
                <text x="30" y="185" textAnchor="middle" className="fill-white font-bold text-sm">1</text>
                <line x1="190" y1="180" x2="250" y2="180" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" markerEnd="url(#arrowblue)"/>
                <text x="220" y="170" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Demande de connexion</text>
            </g>

            {/* Step 2: Authorization Request */}
            <g id="step2">
                <circle cx="30" cy="230" r="14" className="fill-orange-600 dark:fill-orange-400"/>
                <text x="30" y="235" textAnchor="middle" className="fill-white font-bold text-sm">2</text>
                <line x1="250" y1="230" x2="190" y2="230" className="stroke-orange-600 dark:stroke-orange-400" strokeWidth="2" markerEnd="url(#arroworange)"/>
                <text x="220" y="220" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Redirection vers</text>
                <text x="220" y="245" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs">/authorize</text>
            </g>

            {/* Step 3: User redirected to Auth Server */}
            <g id="step3">
                <circle cx="30" cy="280" r="14" className="fill-blue-600 dark:fill-blue-400"/>
                <text x="30" y="285" textAnchor="middle" className="fill-white font-bold text-sm">3</text>
                <line x1="190" y1="280" x2="450" y2="280" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" markerEnd="url(#arrowblue)"/>
                <text x="320" y="270" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">GET /oauth2/authorize</text>
                <text x="320" y="295" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-mono">+ client_id + redirect_uri</text>
            </g>

            {/* Step 4: Authentication */}
            <g id="step4">
                <circle cx="30" cy="330" r="14" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="30" y="335" textAnchor="middle" className="fill-white font-bold text-sm">4</text>
                <rect x="450" y="315" width="140" height="30" rx="4" className="fill-purple-50 dark:fill-purple-950 stroke-purple-300 dark:stroke-purple-700" strokeWidth="1"/>
                <text x="520" y="335" textAnchor="middle" className="fill-gray-800 dark:fill-gray-200 text-xs font-medium">Authentification</text>
            </g>

            {/* Step 5: Consent */}
            <g id="step5">
                <circle cx="30" cy="375" r="14" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="30" y="380" textAnchor="middle" className="fill-white font-bold text-sm">5</text>
                <rect x="450" y="360" width="140" height="30" rx="4" className="fill-purple-50 dark:fill-purple-950 stroke-purple-300 dark:stroke-purple-700" strokeWidth="1"/>
                <text x="520" y="380" textAnchor="middle" className="fill-gray-800 dark:fill-gray-200 text-xs font-medium">Consentement</text>
            </g>

            {/* Step 6: Code to Backend */}
            <g id="step6">
                <circle cx="30" cy="425" r="14" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="30" y="430" textAnchor="middle" className="fill-white font-bold text-sm">6</text>
                <line x1="450" y1="425" x2="390" y2="425" className="stroke-purple-600 dark:stroke-purple-400" strokeWidth="2" markerEnd="url(#arrowpurple)"/>
                <text x="420" y="415" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Redirection</text>
                <text x="420" y="440" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs">+ code</text>
            </g>

            {/* Step 7: Token Exchange */}
            <g id="step7">
                <circle cx="30" cy="475" r="14" className="fill-orange-600 dark:fill-orange-400"/>
                <text x="30" y="480" textAnchor="middle" className="fill-white font-bold text-sm">7</text>
                <line x1="390" y1="475" x2="450" y2="475" className="stroke-orange-600 dark:stroke-orange-400" strokeWidth="2" markerEnd="url(#arroworange)"/>
                <text x="420" y="465" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">POST /token</text>
                <text x="420" y="490" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-mono">+ code + client_secret</text>
            </g>

            {/* Step 8: Access Token */}
            <g id="step8">
                <circle cx="30" cy="525" r="14" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="30" y="530" textAnchor="middle" className="fill-white font-bold text-sm">8</text>
                <line x1="450" y1="525" x2="390" y2="525" className="stroke-purple-600 dark:stroke-purple-400" strokeWidth="2" markerEnd="url(#arrowpurple)"/>
                <text x="420" y="515" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">access_token</text>
                <text x="420" y="540" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs">+ refresh_token</text>
            </g>

            {/* Step 9: Response to User */}
            <g id="step9">
                <circle cx="30" cy="570" r="14" className="fill-orange-600 dark:fill-orange-400"/>
                <text x="30" y="575" textAnchor="middle" className="fill-white font-bold text-sm">9</text>
                <line x1="250" y1="570" x2="190" y2="570" className="stroke-orange-600 dark:stroke-orange-400" strokeWidth="2" markerEnd="url(#arroworange)"/>
                <text x="220" y="560" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Session créée</text>
                <text x="220" y="585" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs">+ Cookie</text>
            </g>

            {/* Step 10: User requests page */}
            <g id="step10">
                <circle cx="30" cy="615" r="14" className="fill-blue-600 dark:fill-blue-400"/>
                <text x="30" y="620" textAnchor="middle" className="fill-white font-bold text-sm">10</text>
                <line x1="190" y1="615" x2="250" y2="615" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" markerEnd="url(#arrowblue)"/>
                <text x="220" y="605" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Demande de page</text>
                <text x="220" y="630" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs">(session active)</text>
            </g>

            {/* Step 11: Backend calls Resource Server */}
            <g id="step11">
                <circle cx="30" cy="660" r="14" className="fill-green-600 dark:fill-green-400"/>
                <text x="30" y="665" textAnchor="middle" className="fill-white font-bold text-sm">11</text>
                <line x1="390" y1="660" x2="610" y2="660" className="stroke-green-600 dark:stroke-green-400" strokeWidth="2" markerEnd="url(#arrowgreen)"/>
                <text x="500" y="650" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Requête API</text>
                <text x="500" y="675" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-mono">Authorization: Bearer token</text>
            </g>

            {/* Step 12: Resource Server responds */}
            <g id="step12">
                <circle cx="30" cy="705" r="14" className="fill-green-600 dark:fill-green-400"/>
                <text x="30" y="710" textAnchor="middle" className="fill-white font-bold text-sm">12</text>
                <line x1="610" y1="705" x2="390" y2="705" className="stroke-green-600 dark:stroke-green-400" strokeWidth="2" markerEnd="url(#arrowgreen)"/>
                <text x="500" y="695" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Données de l'API</text>
            </g>

            {/* Step 13: Backend sends page to User */}
            <g id="step13">
                <circle cx="30" cy="740" r="14" className="fill-orange-600 dark:fill-orange-400"/>
                <text x="30" y="745" textAnchor="middle" className="fill-white font-bold text-sm">13</text>
                <line x1="250" y1="740" x2="190" y2="740" className="stroke-orange-600 dark:stroke-orange-400" strokeWidth="2" markerEnd="url(#arroworange)"/>
                <text x="220" y="730" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">Page HTML</text>
                <text x="220" y="755" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs">avec données</text>
            </g>

            {/* Arrow markers */}
            <defs>
                <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" className="fill-blue-600 dark:fill-blue-400"/>
                </marker>
                <marker id="arroworange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" className="fill-orange-600 dark:fill-orange-400"/>
                </marker>
                <marker id="arrowpurple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" className="fill-purple-600 dark:fill-purple-400"/>
                </marker>
                <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" className="fill-green-600 dark:fill-green-400"/>
                </marker>
            </defs>

            {/* Legend */}
            <g id="legend" transform="translate(620, 180)">
                <text x="0" y="0" className="fill-gray-700 dark:fill-gray-300 font-semibold text-xs">Légende:</text>
                <circle cx="10" cy="20" r="8" className="fill-blue-600 dark:fill-blue-400"/>
                <text x="25" y="25" className="fill-gray-600 dark:fill-gray-400 text-xs">Navigateur</text>

                <circle cx="10" cy="45" r="8" className="fill-orange-600 dark:fill-orange-400"/>
                <text x="25" y="50" className="fill-gray-600 dark:fill-gray-400 text-xs">Backend</text>

                <circle cx="10" cy="70" r="8" className="fill-purple-600 dark:fill-purple-400"/>
                <text x="25" y="75" className="fill-gray-600 dark:fill-gray-400 text-xs">Serveur Auth</text>

                <circle cx="10" cy="95" r="8" className="fill-green-600 dark:fill-green-400"/>
                <text x="25" y="100" className="fill-gray-600 dark:fill-gray-400 text-xs">API</text>
            </g>

            {/* Note about Security */}
            <g id="note" transform="translate(620, 300)">
                <rect x="0" y="0" width="170" height="95" rx="4" className="fill-green-50 dark:fill-green-900/20 stroke-green-400 dark:stroke-green-700" strokeWidth="1"/>
                <text x="85" y="20" textAnchor="middle" className="fill-green-800 dark:fill-green-200 font-semibold text-xs">🔒 Sécurité</text>
                <text x="85" y="38" textAnchor="middle" className="fill-green-700 dark:fill-green-300 text-xs">Client secret</text>
                <text x="85" y="53" textAnchor="middle" className="fill-green-700 dark:fill-green-300 text-xs">stocké côté serveur</text>
                <text x="85" y="68" textAnchor="middle" className="fill-green-700 dark:fill-green-300 text-xs">Token jamais exposé</text>
                <text x="85" y="83" textAnchor="middle" className="fill-green-700 dark:fill-green-300 text-xs">au navigateur</text>
            </g>
        </svg>
    );
}
