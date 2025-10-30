import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {ClientManagementController} from "@/generated/endpoints";
import ClientDetailsDTO from "@/generated/fr/romaindu35/authserver/dto/ClientDetailsDTO";
import ClientConfigurationDTO from "@/generated/fr/romaindu35/authserver/dto/ClientConfigurationDTO";
import ClientType from "@/generated/fr/romaindu35/authserver/entity/OAuth2Client/ClientType";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Separator} from "@/components/ui/separator";
import {MultiValueInput} from "@/components/app/MultiValueInput";
import {CredentialField} from "@/components/app/CredentialField";
import {UnsavedChangesBar} from "@/components/app/UnsavedChangesBar";
import {ArrowLeft, Loader2, Trash2} from "lucide-react";
import {toast} from "sonner";

/**
 * Configuration de la route - nécessite l'authentification
 */
export const config = {
    loginRequired: false,
};

/**
 * Page de détails et configuration d'un client OAuth2.
 * Contient deux onglets : Configuration et Credentials.
 */
export default function ClientDetailsPage() {
    const {clientId} = useParams<{ clientId: string }>();
    const navigate = useNavigate();

    const [client, setClient] = useState<ClientDetailsDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // État du formulaire de configuration
    const [clientName, setClientName] = useState("");
    const [clientType, setClientType] = useState<ClientType>(ClientType.CLIENT);
    const [redirectUris, setRedirectUris] = useState<string[]>([]);
    const [corsUrls, setCorsUrls] = useState<string[]>([]);
    const [official, setOfficial] = useState(false);

    // Suivre les changements non sauvegardés
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [initialFormState, setInitialFormState] = useState<string>("");
    const [currentTab, setCurrentTab] = useState<string>("configuration");

    // Charger les détails du client
    useEffect(() => {
        if (clientId) {
            loadClientDetails();
        }
    }, [clientId]);

    // Détection des changements non sauvegardés
    useEffect(() => {
        const currentState = JSON.stringify({
            clientName,
            clientType,
            redirectUris,
            corsUrls,
        });

        if (initialFormState && currentState !== initialFormState) {
            setHasUnsavedChanges(true);
        } else {
            setHasUnsavedChanges(false);
        }
    }, [clientName, clientType, redirectUris, corsUrls, initialFormState]);

    // Avertir avant de quitter la page si changements non sauvegardés
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const loadClientDetails = async () => {
        if (!clientId) return;

        setIsLoading(true);
        try {
            const details = await ClientManagementController.getClientDetails(clientId);
            if (!details) {
                throw new Error("Client introuvable");
            }
            setClient(details);

            // Remplir le formulaire avec les données existantes
            const name = details.configuration?.clientName || "";
            const type = details.configuration?.clientType || ClientType.CLIENT;
            const uris = details.configuration?.redirectUris?.filter((uri): uri is string => uri !== undefined) || [];
            const urls = details.configuration?.corsUrls?.filter((url): url is string => url !== undefined) || [];

            setClientName(name);
            setClientType(type);
            setRedirectUris(uris);
            setCorsUrls(urls);
            setOfficial(details.configuration?.official || false);

            // Sauvegarder l'état initial pour détecter les changements
            setInitialFormState(JSON.stringify({
                clientName: name,
                clientType: type,
                redirectUris: uris,
                corsUrls: urls,
            }));
        } catch (error) {
            console.error("Erreur lors du chargement du client:", error);
            toast.error("Impossible de charger les détails du client");
            navigate("/app");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfiguration = async () => {
        if (!clientId) return;

        setIsSaving(true);
        try {
            const configuration: ClientConfigurationDTO = {
                clientName,
                clientType,
                redirectUris,
                corsUrls,
                official,
            };

            await ClientManagementController.updateClientConfiguration(
                clientId,
                configuration
            );
            toast.success("Configuration sauvegardée avec succès");

            // Réinitialiser l'état des changements non sauvegardés
            setHasUnsavedChanges(false);
            setInitialFormState(JSON.stringify({
                clientName,
                clientType,
                redirectUris,
                corsUrls,
            }));

            await loadClientDetails(); // Recharger pour avoir les données à jour
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
            toast.error("Erreur lors de la sauvegarde de la configuration");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerateClientId = async () => {
        if (!clientId) return "";

        try {
            const newClientId =
                await ClientManagementController.regenerateClientId(clientId);

            // Mettre à jour l'affichage avec le nouveau client ID
            if (client && newClientId) {
                setClient({
                    ...client,
                    credentials: {
                        ...client.credentials,
                        clientId: newClientId,
                    },
                });
            }

            return newClientId || "";
        } catch (error) {
            console.error("Erreur lors de la régénération du client ID:", error);
            throw error;
        }
    };

    const handleRegenerateClientSecret = async () => {
        if (!clientId) return "";

        try {
            const newSecret =
                await ClientManagementController.regenerateClientSecret(clientId);

            // Mettre à jour l'affichage avec le nouveau secret
            if (client && newSecret) {
                setClient({
                    ...client,
                    credentials: {
                        ...client.credentials,
                        clientSecret: newSecret,
                    },
                });
            }

            return newSecret || "";
        } catch (error) {
            console.error("Erreur lors de la régénération du secret:", error);
            throw error;
        }
    };

    const handleResetChanges = async () => {
        // Recharger les données initiales
        await loadClientDetails();
        toast.info("Modifications annulées");
    };

    const handleDeleteClient = async () => {
        if (!clientId) return;

        const confirmed = confirm(
            `Êtes-vous sûr de vouloir supprimer l'application "${clientName}" ?\n\nCette action est irréversible et invalidera tous les tokens actifs.`
        );

        if (!confirmed) return;

        try {
            await ClientManagementController.deleteClient(clientId);
            toast.success("Application supprimée avec succès");
            navigate("/app");
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            toast.error("Erreur lors de la suppression de l'application");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    if (!client) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/app")}
                        className="mb-4"
                        disabled={hasUnsavedChanges}
                        title={hasUnsavedChanges ? "Enregistrez vos modifications avant de quitter" : ""}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Retour aux applications
                    </Button>
                    <h1 className="text-3xl font-bold">{client.configuration.clientName}</h1>
                    <p className="text-muted-foreground mt-1">
                        Propriétaire: {client.ownerUsername}
                    </p>
                </div>

                {/* Tabs */}
                <Tabs
                    value={currentTab}
                    onValueChange={(value) => {
                        setCurrentTab(value);
                    }}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="configuration">Configuration</TabsTrigger>
                        <TabsTrigger
                            value="credentials"
                            disabled={hasUnsavedChanges}
                            title={hasUnsavedChanges ? "Enregistrez vos modifications avant de changer d'onglet" : ""}
                        >
                            Credentials
                        </TabsTrigger>
                    </TabsList>

                    {/* Onglet Configuration */}
                    <TabsContent value="configuration" className="space-y-6">
                        <div className="bg-card border rounded-lg p-6 space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">
                                    Informations générales
                                </h2>

                                <div className="space-y-4">
                                    {/* Nom du client */}
                                    <div>
                                        <Label htmlFor="clientName">Nom de l'application</Label>
                                        <Input
                                            id="clientName"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            className="mt-2"
                                        />
                                    </div>

                                    {/* Type de client */}
                                    <div>
                                        <Label htmlFor="clientType">Type de client</Label>
                                        <Select
                                            value={clientType}
                                            onValueChange={(value: string) => setClientType(value as ClientType)}
                                        >
                                            <SelectTrigger id="clientType" className="mt-2">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ClientType.CLIENT}>
                                                    Client (SPA) - PKCE flow, pas de secret
                                                </SelectItem>
                                                <SelectItem value={ClientType.SERVER}>
                                                    Server - Authorization code flow avec secret
                                                </SelectItem>
                                                <SelectItem value={ClientType.SERVICE}>
                                                    Service (API) - Client credentials flow
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {clientType === ClientType.CLIENT &&
                                                "Pour les applications client-side (SPA, applications mobiles). Utilise PKCE sans secret client."}
                                            {clientType === ClientType.SERVER &&
                                                "Pour les applications server-side avec un backend sécurisé."}
                                            {clientType === ClientType.SERVICE &&
                                                "Pour les services machine-to-machine sans utilisateur."}
                                        </p>
                                    </div>

                                </div>

                                {/* Indication si application officielle (lecture seule) */}
                                {official && (
                                    <div
                                        className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                                        <p className="text-sm text-blue-900 dark:text-blue-100">
                                            ℹ️ Cette application est marquée comme <strong>officielle</strong> par
                                            l'administrateur.
                                            Les utilisateurs ne verront pas la page de consentement lors de
                                            l'authentification.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Separator/>

                            <div>
                                <h2 className="text-xl font-semibold mb-4">
                                    URIs de redirection
                                </h2>
                                <MultiValueInput
                                    label="Redirect URIs"
                                    placeholder="https://example.com/callback"
                                    values={redirectUris}
                                    onChange={setRedirectUris}
                                    description="URIs autorisées pour la redirection après authentification (authorization code flow)"
                                />
                            </div>

                            <Separator/>

                            <div>
                                <h2 className="text-xl font-semibold mb-4">Configuration CORS</h2>
                                <MultiValueInput
                                    label="Origines CORS autorisées"
                                    placeholder="https://example.com"
                                    values={corsUrls}
                                    onChange={setCorsUrls}
                                    description="Origines autorisées pour les requêtes cross-origin (uniquement pour les clients de type CLIENT)"
                                />
                            </div>

                            <Separator/>

                            {/* Bouton de suppression */}
                            <div className="flex justify-start">
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteClient}
                                >
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Supprimer l'application
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Onglet Credentials */}
                    <TabsContent value="credentials" className="space-y-6">
                        <div className="bg-card border rounded-lg p-6 space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">
                                    Identifiants OAuth2
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    Ces identifiants sont utilisés pour authentifier votre
                                    application auprès du serveur OAuth2.
                                </p>

                                <div className="space-y-6">
                                    {/* Client ID */}
                                    <CredentialField
                                        label="Client ID"
                                        value={client.credentials.clientId}
                                        onRegenerate={handleRegenerateClientId}
                                        description="Identifiant unique de votre application OAuth2"
                                    />

                                    {/* Client Secret (seulement pour SERVER et SERVICE) */}
                                    {clientType !== ClientType.CLIENT && (
                                        <CredentialField
                                            label="Client Secret"
                                            value={
                                                client.credentials.clientSecret ||
                                                "Cliquez sur régénérer pour créer un nouveau secret"
                                            }
                                            onRegenerate={handleRegenerateClientSecret}
                                            isSecret={!!client.credentials.clientSecret}
                                            isEmpty={!client.credentials.clientSecret}
                                            description={
                                                client.credentials.clientSecret
                                                    ? "Secret utilisé pour authentifier votre application (ne jamais partager)"
                                                    : "Générez un secret en cliquant sur le bouton de régénération"
                                            }
                                        />
                                    )}

                                    {clientType === ClientType.CLIENT && (
                                        <div className="bg-muted/50 border border-muted rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground">
                                                ℹ️ Les clients de type CLIENT n'utilisent pas de secret
                                                car ils utilisent le flow PKCE (Proof Key for Code
                                                Exchange) pour une sécurité renforcée sans secret
                                                client.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator/>

                            <div
                                className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                                    ⚠️ Important
                                </h3>
                                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                                    <li>
                                        Les secrets ne sont affichés qu'une seule fois lors de leur
                                        génération
                                    </li>
                                    <li>
                                        La régénération des credentials invalide immédiatement les
                                        anciens
                                    </li>
                                    <li>
                                        Conservez vos secrets en lieu sûr (gestionnaire de mots de
                                        passe, variables d'environnement)
                                    </li>
                                    <li>Ne partagez jamais vos secrets dans le code source</li>
                                </ul>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Barre d'action sticky pour les modifications non sauvegardées */}
            {hasUnsavedChanges && (
                <UnsavedChangesBar
                    onSave={handleSaveConfiguration}
                    onReset={handleResetChanges}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
}
