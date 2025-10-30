import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {ClientManagementController} from "Frontend/generated/endpoints";
import {ClientCard} from "@/components/app/ClientCard";
import {CreateClientDialog} from "@/components/app/CreateClientDialog";
import {Button} from "@/components/ui/button";
import {Loader2, Plus} from "lucide-react";
import {toast} from "sonner";
import ClientListItemDTO from "@/generated/fr/romaindu35/authserver/dto/ClientListItemDTO";

/**
 * Configuration de la route - nécessite l'authentification
 */
export const config = {
    loginRequired: false,
};

/**
 * Page principale de gestion des clients OAuth2.
 * Affiche la liste des clients de l'utilisateur sous forme de grid de cards.
 * Permet de créer de nouveaux clients via un dialog.
 */
export default function AppPage() {
    const navigate = useNavigate();
    const [clients, setClients] = useState<ClientListItemDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Charger la liste des clients au montage du composant
    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setIsLoading(true);
        try {
            const fetchedClients =
                await ClientManagementController.getMyClients();
            // Filtrer les valeurs undefined du tableau retourné par Hilla
            setClients((fetchedClients || []).filter((client): client is ClientListItemDTO => client !== undefined));
        } catch (error) {
            console.error("Erreur lors du chargement des clients:", error);
            toast.error("Impossible de charger la liste des clients");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClient = async (clientName: string) => {
        try {
            const newClientId =
                await ClientManagementController.createClient(clientName);
            toast.success("Application créée avec succès");
            // Rediriger vers la page de configuration du nouveau client
            navigate(`/app/${newClientId}`);
        } catch (error) {
            console.error("Erreur lors de la création du client:", error);
            toast.error("Erreur lors de la création de l'application");
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Mes Applications</h1>
                        <p className="text-muted-foreground mt-1">
                            Gérez vos clients OAuth2 et leurs configurations
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
                        <Plus className="mr-2 h-4 w-4"/>
                        Créer une application
                    </Button>
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
