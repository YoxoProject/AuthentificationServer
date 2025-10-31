import { Checkbox } from '@vaadin/react-components/Checkbox';
import { Icon } from '@vaadin/react-components/Icon';
import '@vaadin/icons';
import ClientType from "@/generated/fr/romaindu35/authserver/entity/OAuth2Client/ClientType";
import { useQuery } from '@tanstack/react-query';
import { ClientManagementController } from '@/generated/endpoints';

interface ScopeSelectorProps {
    clientType: ClientType;
    selectedScopes: string[];
    onScopesChange: (scopes: string[]) => void;
}

interface ScopeInfo {
    value: string;
    label: string;
    description: string;
    required?: boolean;
}

export function ScopeSelector({ clientType, selectedScopes, onScopesChange }: ScopeSelectorProps) {
    // Charger les scopes disponibles depuis le backend pour CLIENT/SERVER
    const { data: availableScopes } = useQuery({
        queryKey: ['availableScopes'],
        queryFn: () => ClientManagementController.getAvailableScopes(),
        enabled: clientType !== ClientType.SERVICE,
    });

    // Construire la liste des scopes selon le type de client
    const getScopesForClientType = (): ScopeInfo[] => {
        if (clientType === ClientType.SERVICE) {
            return [
                {
                    value: 'api_access',
                    label: 'API Access',
                    description: 'Réaliser des requêtes API en votre nom',
                    required: true,
                },
            ];
        }

        // Pour CLIENT et SERVER, utiliser les scopes du backend
        if (!availableScopes) {
            return [];
        }

        return availableScopes
            .filter(scope => scope !== undefined)
            .map(scope => ({
            value: scope.scopeName,
            label: scope.scopeName.charAt(0).toUpperCase() + scope.scopeName.slice(1),
            description: scope.description,
            required: false,
        }));
    };

    const scopes = getScopesForClientType();

    const handleScopeToggle = (scopeValue: string, required: boolean = false) => {
        if (required) {
            // Les scopes requis ne peuvent pas être décochés
            return;
        }

        if (selectedScopes.includes(scopeValue)) {
            onScopesChange(selectedScopes.filter(s => s !== scopeValue));
        } else {
            onScopesChange([...selectedScopes, scopeValue]);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Icon icon="vaadin:info-circle" className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Scopes disponibles</p>
                    <p className="text-blue-700 dark:text-blue-300">
                        Les scopes déterminent quelles informations votre application peut accéder.
                        Sélectionnez uniquement ceux dont vous avez besoin.
                        {clientType === ClientType.SERVICE && (
                            <> Les applications de type SERVICE n'ont accès qu'au scope <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">api_access</code>.</>
                        )}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {scopes.map((scope) => {
                    const isChecked = selectedScopes.includes(scope.value);
                    const isRequired = scope.required || false;

                    return (
                        <div
                            key={scope.value}
                            className={`p-3 border rounded-lg transition-colors ${
                                isChecked
                                    ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    checked={isChecked}
                                    disabled={isRequired}
                                    onCheckedChanged={(e) => handleScopeToggle(scope.value, isRequired)}
                                    className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {scope.label}
                                        </span>
                                        <code className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                            {scope.value}
                                        </code>
                                        {isRequired && (
                                            <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded font-medium">
                                                Requis
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {scope.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Scopes sélectionnés : </span>
                    {selectedScopes.length > 0 ? (
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                            {selectedScopes.join(' ')}
                        </code>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400 italic">Aucun scope sélectionné</span>
                    )}
                </div>
            </div>
        </div>
    );
}
