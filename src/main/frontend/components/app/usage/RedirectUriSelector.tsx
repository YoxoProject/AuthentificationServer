import { Icon } from '@vaadin/react-components/Icon';
import '@vaadin/icons';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface RedirectUriSelectorProps {
    redirectUris: string[];
    selectedUri: string | undefined;
    onUriChange: (uri: string) => void;
}

export function RedirectUriSelector({ redirectUris, selectedUri, onUriChange }: RedirectUriSelectorProps) {
    if (redirectUris.length === 0) {
        return (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                    <Icon icon="vaadin:warning" className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium mb-1">Aucune URI de redirection configurée</p>
                        <p className="text-yellow-700 dark:text-yellow-300">
                            Vous devez d'abord configurer au moins une URI de redirection dans l'onglet "Configuration"
                            pour utiliser le flux OAuth2 Authorization Code.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URI de redirection
                </label>
                <Select
                    value={selectedUri || redirectUris[0]}
                    onValueChange={onUriChange}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner une URI" />
                    </SelectTrigger>
                    <SelectContent>
                        {redirectUris.map((uri) => (
                            <SelectItem key={uri} value={uri}>
                                {uri}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Sélectionnez l'URI de redirection à utiliser pour les exemples de code ci-dessous.
                    Tous les exemples seront automatiquement mis à jour avec l'URI sélectionnée.
                </p>
            </div>

            {redirectUris.length > 1 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Icon icon="vaadin:info-circle" className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                            Vous avez configuré {redirectUris.length} URIs de redirection.
                            Chacune peut être utilisée selon votre environnement (développement, production, etc.).
                        </p>
                    </div>
                </div>
            )}

            <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">URI sélectionnée : </span>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded break-all">
                        {selectedUri || redirectUris[0]}
                    </code>
                </div>
            </div>
        </div>
    );
}
