import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {ClientManagementController} from "@/generated/endpoints";
import ClientConfigurationDTO from "@/generated/fr/romaindu35/authserver/dto/ClientConfigurationDTO";
import ClientType from "@/generated/fr/romaindu35/authserver/entity/OAuth2Client/ClientType";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Separator} from "@/components/ui/separator";
import {MultiValueInput} from "@/components/app/MultiValueInput";
import {CredentialField} from "@/components/app/CredentialField";
import {UnsavedChangesBar} from "@/components/app/UnsavedChangesBar";
import {ArrowLeft, Loader2, Trash2} from "lucide-react";
import {toast} from "sonner";
import {Form, FormControl, FormField, FormItem, FormLabel,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Label} from "@/components/ui/label";
import {useConfirm} from "@/contexts/ConfirmDialogContext";
import {ChangeClientTypeDialog} from "@/components/app/ChangeClientTypeDialog";
import {UsageTab} from "@/components/app/usage/UsageTab";

// Schéma de validation Zod
const clientConfigSchema = z.object({
    clientName: z.string().min(1, "Le nom de l'application est requis"),
    clientType: z.nativeEnum(ClientType),
    redirectUris: z.array(
        z.string()
            .url("Format d'URL invalide")
            .refine(
                (url) => !url.includes("*"),
                {message: "Les wildcards (*) ne sont pas autorisés"}
            )
            .refine(
                (url) => url.startsWith("http://") || url.startsWith("https://"),
                {message: "L'URL doit utiliser le protocole http:// ou https://"}
            )
    ),
    corsUrls: z.array(
        z.string()
            .url("Format d'URL invalide")
            .refine(
                (url) => !url.includes("*"),
                {message: "Les wildcards (*) ne sont pas autorisés"}
            )
            .refine(
                (url) => url.startsWith("http://") || url.startsWith("https://"),
                {message: "L'URL doit utiliser le protocole http:// ou https://"}
            )
    ),
    official: z.boolean(),
});

type ClientConfigFormValues = z.infer<typeof clientConfigSchema>;

/**
 * Configuration de la route - nécessite l'authentification
 */
export const config = {
    loginRequired: true,
};

/**
 * Page de détails et configuration d'un client OAuth2.
 * Contient deux onglets : Configuration et Credentials.
 */
export default function ClientDetailsPage() {
    const {clientId} = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const confirm = useConfirm();
    const [clientTypeDialogOpen, setClientTypeDialogOpen] = useState(false);

    // Query pour charger les détails du client
    const {data: client, isLoading} = useQuery({
        queryKey: ['client', clientId],
        queryFn: async () => {
            if (!clientId) return null;
            const details = await ClientManagementController.getClientDetails(clientId);
            if (!details) {
                throw new Error("Client introuvable");
            }
            return details;
        },
        enabled: !!clientId,
    });

    // React Hook Form
    const form = useForm<ClientConfigFormValues>({
        resolver: zodResolver(clientConfigSchema),
        defaultValues: {
            clientName: "",
            clientType: ClientType.CLIENT,
            redirectUris: [],
            corsUrls: [],
            official: false,
        },
    });

    // Remplir le formulaire avec les données chargées
    useEffect(() => {
        if (client) {
            const name = client.configuration?.clientName || "";
            const type = client.configuration?.clientType || ClientType.CLIENT;
            const uris = client.configuration?.redirectUris?.filter((uri): uri is string => uri !== undefined) || [];
            const urls = client.configuration?.corsUrls?.filter((url): url is string => url !== undefined) || [];
            const official = client.configuration?.official || false;

            form.reset({
                clientName: name,
                clientType: type,
                redirectUris: uris,
                corsUrls: urls,
                official,
            });
        }
    }, [client, form]);

    // Avertir avant de quitter la page si changements non sauvegardés
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (form.formState.isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [form.formState.isDirty]);

    // Mutation pour sauvegarder la configuration
    const updateConfigMutation = useMutation({
        mutationFn: (configuration: ClientConfigurationDTO) => {
            if (!clientId) throw new Error("Client ID manquant");
            return ClientManagementController.updateClientConfiguration(clientId, configuration);
        },
        onSuccess: () => {
            toast.success("Configuration sauvegardée avec succès");
            // Marquer le formulaire comme non modifié
            form.reset(form.getValues());
            // Invalider le cache pour recharger les données
            queryClient.invalidateQueries({queryKey: ['client', clientId]});
            queryClient.invalidateQueries({queryKey: ['clients']});
        },
        onError: (error) => {
            console.error("Erreur lors de la sauvegarde:", error);
            toast.error("Erreur lors de la sauvegarde de la configuration");
        },
    });

    // Mutation pour régénérer le client ID
    const regenerateClientIdMutation = useMutation({
        mutationFn: () => {
            if (!clientId) throw new Error("Client ID manquant");
            return ClientManagementController.regenerateClientId(clientId);
        },
        onSuccess: (newClientId) => {
            // Mettre à jour le cache manuellement avec le nouveau client ID
            if (client && newClientId) {
                queryClient.setQueryData(['client', clientId], {
                    ...client,
                    credentials: {
                        ...client.credentials,
                        clientId: newClientId,
                    },
                });
            }
            // Invalider aussi la liste des clients pour mettre à jour l'affichage
            queryClient.invalidateQueries({queryKey: ['clients']});
        },
        onError: (error) => {
            console.error("Erreur lors de la régénération du client ID:", error);
            toast.error("Erreur lors de la régénération du client ID");
        },
    });

    // Mutation pour régénérer le client secret
    const regenerateClientSecretMutation = useMutation({
        mutationFn: () => {
            if (!clientId) throw new Error("Client ID manquant");
            return ClientManagementController.regenerateClientSecret(clientId);
        },
        onSuccess: (newSecret) => {
            // Mettre à jour le cache manuellement avec le nouveau secret
            // Important : ne pas invalider car le serveur ne retourne le secret qu'une seule fois
            if (client && newSecret) {
                queryClient.setQueryData(['client', clientId], {
                    ...client,
                    credentials: {
                        ...client.credentials,
                        clientSecret: newSecret,
                    },
                });
            }
        },
        onError: (error) => {
            console.error("Erreur lors de la régénération du secret:", error);
            toast.error("Erreur lors de la régénération du secret");
        },
    });

    // Mutation pour supprimer le client
    const deleteClientMutation = useMutation({
        mutationFn: () => {
            if (!clientId) throw new Error("Client ID manquant");
            return ClientManagementController.deleteClient(clientId);
        },
        onSuccess: () => {
            toast.success("Application supprimée avec succès");
            // Invalider la liste des clients
            queryClient.invalidateQueries({queryKey: ['clients']});
            navigate("/app");
        },
        onError: (error) => {
            console.error("Erreur lors de la suppression:", error);
            toast.error("Erreur lors de la suppression de l'application");
        },
    });

    const handleRegenerateClientId = async () => {
        try {
            const newClientId = await regenerateClientIdMutation.mutateAsync();
            return newClientId || "";
        } catch (error) {
            throw error;
        }
    };

    const handleRegenerateClientSecret = async () => {
        try {
            const newSecret = await regenerateClientSecretMutation.mutateAsync();
            return newSecret || "";
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteClient = async () => {
        const clientName = form.getValues("clientName");
        const confirmed = await confirm({
            title: "Supprimer l'application",
            description: `Êtes-vous sûr de vouloir supprimer l'application "${clientName}" ? Cette action est irréversible et invalidera tous les tokens actifs.`,
            confirmText: "SUPPRIMER",
            confirmLabel: "Supprimer",
            cancelLabel: "Annuler",
            variant: "destructive"
        });

        if (!confirmed) return;

        deleteClientMutation.mutate();
    };

    const handleClientTypeChange = async (newType: ClientType) => {
        const oldType = form.getValues("clientType");

        // Si pas de changement, fermer le dialog et ne rien faire
        if (oldType === newType) {
            setClientTypeDialogOpen(false);
            return;
        }

        // Déterminer le niveau de risque (destructive pour CLIENT ↔ SERVER/SERVICE)
        const isDestructive =
            (oldType === ClientType.CLIENT && newType !== ClientType.CLIENT) ||
            (oldType !== ClientType.CLIENT && newType === ClientType.CLIENT);

        // Déterminer la description selon le changement
        let description = "";
        if (oldType === ClientType.CLIENT && newType !== ClientType.CLIENT) {
            description = "Changer vers SERVER/SERVICE générera un nouveau client secret et désactivera l'authentification PKCE. Confirmez en tapant 'CHANGER'.";
        } else if (oldType !== ClientType.CLIENT && newType === ClientType.CLIENT) {
            description = "Changer vers CLIENT supprimera définitivement le secret existant et nécessitera l'utilisation de PKCE. Toutes les configurations utilisant le secret seront invalidées. Confirmez en tapant 'CHANGER'.";
        } else {
            // SERVER ↔ SERVICE
            description = "Changer le type de client modifiera les flows OAuth2 disponibles. Le secret sera conservé. Confirmez en tapant 'CHANGER'.";
        }

        // Demander toujours la confirmation textuelle "CHANGER"
        const confirmed = await confirm({
            title: "Confirmer le changement de type",
            description,
            confirmText: "CHANGER",
            confirmLabel: "Changer",
            cancelLabel: "Annuler",
            variant: isDestructive ? "destructive" : "default"
        });

        if (!confirmed) {
            setClientTypeDialogOpen(false);
            return;
        }

        form.setValue("clientType", newType, {shouldDirty: true});
        setClientTypeDialogOpen(false);
    };

    const onSubmit = (values: ClientConfigFormValues) => {
        const configuration: ClientConfigurationDTO = {
            clientName: values.clientName,
            clientType: values.clientType,
            redirectUris: values.redirectUris,
            corsUrls: values.corsUrls,
            official: values.official,
        };
        updateConfigMutation.mutate(configuration);
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

    const currentClientType = form.watch("clientType");
    const official = form.watch("official");

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
                        disabled={form.formState.isDirty}
                        title={form.formState.isDirty ? "Enregistrez vos modifications avant de quitter" : ""}
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
                <Tabs defaultValue="configuration" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="configuration">Configuration</TabsTrigger>
                        <TabsTrigger
                            value="credentials"
                            disabled={form.formState.isDirty}
                            title={form.formState.isDirty ? "Enregistrez vos modifications avant de changer d'onglet" : ""}
                        >
                            Credentials
                        </TabsTrigger>
                        <TabsTrigger
                            value="usage"
                            disabled={form.formState.isDirty}
                            title={form.formState.isDirty ? "Enregistrez vos modifications avant de changer d'onglet" : ""}
                        >
                            Utilisation
                        </TabsTrigger>
                    </TabsList>

                    {/* Onglet Configuration */}
                    <TabsContent value="configuration" className="space-y-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="bg-card border rounded-lg p-6 space-y-6">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4">
                                            Informations générales
                                        </h2>

                                        <div className="space-y-4">
                                            {/* Nom du client */}
                                            <FormField
                                                control={form.control}
                                                name="clientName"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Nom de l'application</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Type de client */}
                                            <div className="space-y-2">
                                                <Label>Type de client</Label>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-sm">
                                                        {currentClientType === ClientType.CLIENT && "Client (SPA)"}
                                                        {currentClientType === ClientType.SERVER && "Server"}
                                                        {currentClientType === ClientType.SERVICE && "Service (API)"}
                                                    </Badge>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setClientTypeDialogOpen(true)}
                                                    >
                                                        Modifier le type
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {currentClientType === ClientType.CLIENT &&
                                                        "Pour les applications client-side (SPA, applications mobiles). Utilise PKCE sans secret client."}
                                                    {currentClientType === ClientType.SERVER &&
                                                        "Pour les applications server-side avec un backend sécurisé."}
                                                    {currentClientType === ClientType.SERVICE &&
                                                        "Pour les services machine-to-machine sans utilisateur."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Indication si application officielle (lecture seule) */}
                                        {official && (
                                            <div
                                                className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mt-4">
                                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                                    ℹ️ Cette application est marquée
                                                    comme <strong>officielle</strong> par
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
                                        <FormField
                                            control={form.control}
                                            name="redirectUris"
                                            render={({field}) => (
                                                <FormItem>
                                                    <MultiValueInput
                                                        label="Redirect URIs"
                                                        placeholder="https://example.com/callback"
                                                        values={field.value}
                                                        onChange={field.onChange}
                                                        description="URIs autorisées pour la redirection après authentification (authorization code flow)"
                                                        validateUrl={true}
                                                    />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator/>

                                    {
                                        currentClientType == ClientType.CLIENT && (
                                            <>
                                                <div>
                                                    <h2 className="text-xl font-semibold mb-4">Configuration CORS</h2>
                                                    <FormField
                                                        control={form.control}
                                                        name="corsUrls"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <MultiValueInput
                                                                    label="Origines CORS autorisées"
                                                                    placeholder="https://example.com"
                                                                    values={field.value}
                                                                    onChange={field.onChange}
                                                                    description="Origines autorisées pour les requêtes cross-origin (uniquement pour les clients de type CLIENT)"
                                                                    validateUrl={true}
                                                                />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <Separator/>
                                            </>
                                        )
                                    }

                                    {/* Bouton de suppression */}
                                    <div className="flex justify-start">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={handleDeleteClient}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4"/>
                                            Supprimer l'application
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Form>

                        {/* Dialog pour changer le type de client */}
                        <ChangeClientTypeDialog
                            open={clientTypeDialogOpen}
                            onOpenChange={setClientTypeDialogOpen}
                            currentType={currentClientType}
                            onConfirm={handleClientTypeChange}
                        />
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
                                    {currentClientType !== ClientType.CLIENT && (
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

                                    {currentClientType === ClientType.CLIENT && (
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

                    {/* Onglet Utilisation */}
                    <TabsContent value="usage" className="space-y-6">
                        <UsageTab
                            clientId={client.credentials.clientId}
                            clientType={currentClientType}
                            redirectUris={form.getValues("redirectUris")}
                            hasClientSecret={!!client.credentials.clientSecret}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Barre d'action sticky pour les modifications non sauvegardées */}
            {form.formState.isDirty && (
                <UnsavedChangesBar
                    onSave={form.handleSubmit(onSubmit)}
                    onReset={() => form.reset()}
                    isSaving={updateConfigMutation.isPending}
                />
            )}
        </div>
    );
}
