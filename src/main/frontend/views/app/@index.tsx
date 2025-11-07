import {useState} from "react";
import {useNavigate} from "react-router";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {ClientManagementController} from "Frontend/generated/endpoints";
import {ClientCard} from "@/components/app/ClientCard";
import {CreateClientDialog} from "@/components/app/CreateClientDialog";
import {Button} from "@/components/ui/button";
import {Loader2, Plus} from "lucide-react";
import {toast} from "sonner";
import ClientListItemDTO from "@/generated/fr/romaindu35/authserver/dto/ClientListItemDTO";
import {Profile} from "@/components/Profile";
import {ThemeToggle} from "@/components/theme/ThemeToggle";

/**
 * Configuration de la route - nécessite l'authentification
 */
export const config = {
    loginRequired: true,
};

/**
 * Page principale de gestion des clients OAuth2.
 * Affiche la liste des clients de l'utilisateur sous forme de grid de cards.
 * Permet de créer de nouveaux clients via un dialog.
 */
export default function AppPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Query pour charger la liste des clients
    const {data: clients = [], isLoading} = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const fetchedClients = await ClientManagementController.getMyClients();
            // Filtrer les valeurs undefined du tableau retourné par Hilla
            return (fetchedClients || []).filter((client): client is ClientListItemDTO => client !== undefined);
        },
    });

    // Mutation pour créer un nouveau client
    const createClientMutation = useMutation({
        mutationFn: (clientName: string) => ClientManagementController.createClient(clientName),
        onSuccess: (newClientId) => {
            toast.success("Application créée avec succès");
            // Invalider le cache pour recharger la liste
            queryClient.invalidateQueries({queryKey: ['clients']});
            // Rediriger vers la page de configuration du nouveau client
            navigate(`/app/${newClientId}`);
        },
        onError: (error) => {
            console.error("Erreur lors de la création du client:", error);
            toast.error("Erreur lors de la création de l'application");
        },
    });

    const handleCreateClient = async (clientName: string) => {
        try {
            await createClientMutation.mutateAsync(clientName);
        } catch (error) {
            // L'erreur est déjà gérée par onError
            throw error; // Re-throw pour que le dialog puisse gérer l'erreur
        }
    };

    const handleClientClick = (clientId: string) => {
        navigate(`/app/${clientId}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between mb-8 max-md:flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Mes Applications</h1>
                        <p className="text-muted-foreground mt-1">
                            Gérez vos clients OAuth2 et leurs configurations
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex-1">
                            <Plus className="mr-2 h-4 w-4"/>
                            Créer une application
                        </Button>
                        <Profile />
                        <ThemeToggle />
                    </div>
                </div>

                {/* Contenu principal */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                    </div>
                ) : clients.length === 0 ? (
                    // État vide
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="rounded-full bg-muted p-6 mb-4">
                            <Plus className="h-12 w-12 text-muted-foreground"/>
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">
                            Aucune application
                        </h2>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Vous n'avez pas encore créé d'application OAuth2. Commencez par
                            en créer une pour permettre à d'autres services de s'authentifier.
                        </p>
                        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
                            <Plus className="mr-2 h-4 w-4"/>
                            Créer ma première application
                        </Button>
                    </div>
                ) : (
                    // Grid de cards
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {clients.map((client) => (
                            <ClientCard
                                key={client.id}
                                client={client}
                                onClick={() => handleClientClick(client.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Dialog de création */}
            <CreateClientDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSubmit={handleCreateClient}
            />
        </div>
    );
}
