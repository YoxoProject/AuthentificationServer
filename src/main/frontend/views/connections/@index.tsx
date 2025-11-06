import {useQuery} from "@tanstack/react-query";
import {AuthorizationManagementController} from "@/generated/endpoints";
import {Profile} from "@/components/app/Profile";
import {ThemeToggle} from "@/components/theme/ThemeToggle";
import {Loader2, ShieldAlert} from "lucide-react";
import {ConnectionCard} from "@/components/app/ConnectionCard";
import AuthorizationWithClientDTO from "@/generated/fr/romaindu35/authserver/dto/AuthorizationWithClientDTO";

export const config = {
    loginRequired: true,
};

/**
 * Page /connections - Gestion des autorisations OAuth2 de l'utilisateur.
 * Affiche les autorisations actives et inactives avec possibilité de les révoquer.
 */
export default function ConnectionsPage() {
    // Fetch active authorizations
    const {
        data: activeAuthorizations = [],
        isLoading: isLoadingActive
    } = useQuery({
        queryKey: ['active-authorizations'],
        queryFn: async () => {
            return await AuthorizationManagementController.getMyActiveAuthorizations();
        },
    });

    // Fetch inactive authorizations
    const {
        data: inactiveAuthorizations = [],
        isLoading: isLoadingInactive
    } = useQuery({
        queryKey: ['inactive-authorizations'],
        queryFn: async () => {
            return await AuthorizationManagementController.getMyInactiveAuthorizations();
        },
    });

    const isLoading = isLoadingActive || isLoadingInactive;
    const hasNoConnections = activeAuthorizations.length === 0 && inactiveAuthorizations.length === 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between mb-8 max-md:flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Mes Connexions</h1>
                        <p className="text-muted-foreground mt-1">
                            Gérez les applications qui ont accès à votre compte
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Profile/>
                        <ThemeToggle/>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && hasNoConnections && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <ShieldAlert className="h-16 w-16 text-muted-foreground mb-4"/>
                        <h2 className="text-xl font-semibold mb-2">Aucune connexion</h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            Vous n'avez autorisé aucune application à accéder à votre compte.
                            Les applications autorisées apparaîtront ici.
                        </p>
                    </div>
                )}

                {/* Content */}
                {!isLoading && !hasNoConnections && (
                    <div className="space-y-8">
                        {/* Active Authorizations */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                Connexions actives
                                <span
                                    className="text-sm font-normal text-muted-foreground">({activeAuthorizations.length})</span>
                            </h2>
                            {activeAuthorizations.length > 0 ? (
                                <div className="space-y-4">
                                    {activeAuthorizations
                                        .filter((authorization): authorization is AuthorizationWithClientDTO => authorization !== undefined)
                                        .map((authorization) => (
                                            <ConnectionCard
                                                key={authorization.id}
                                                authorization={authorization}
                                            />
                                        ))}
                                </div>
                            ) : (
                                <div
                                    className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-muted rounded-lg">
                                    <p className="text-muted-foreground text-center">
                                        Aucune connexion active actuellement
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Inactive Authorizations */}
                        {inactiveAuthorizations.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                                    Historique
                                    <span
                                        className="text-sm font-normal text-muted-foreground">({inactiveAuthorizations.length})</span>
                                </h2>
                                <div className="space-y-4">
                                    {inactiveAuthorizations
                                        .filter((authorization): authorization is AuthorizationWithClientDTO => authorization !== undefined)
                                        .map((authorization) => (
                                            <ConnectionCard
                                                key={authorization.id}
                                                authorization={authorization}
                                            />
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
