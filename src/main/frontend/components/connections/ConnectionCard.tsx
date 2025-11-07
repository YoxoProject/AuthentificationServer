import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {formatDistanceToNow} from "date-fns";
import {fr} from "date-fns/locale";
import {Loader2, Shield} from "lucide-react";
import React, {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import AuthorizationWithClientDTO from "@/generated/fr/romaindu35/authserver/dto/AuthorizationWithClientDTO";
import AuthorizationEventDTO from "@/generated/fr/romaindu35/authserver/dto/AuthorizationEventDTO";
import {AuthorizationManagementController} from "@/generated/endpoints";
import {AuthorizationHistoryItem} from "./AuthorizationHistoryItem";
import {useConfirm} from "@/contexts/ConfirmDialogContext";

interface ConnectionCardProps {
    authorization: AuthorizationWithClientDTO;
}

/**
 * Composant Card pour afficher une connexion OAuth2 active ou inactive.
 * Inclut un accordéon pour afficher l'historique complet des autorisations.
 */
export function ConnectionCard({authorization}: ConnectionCardProps) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const confirm = useConfirm();

    // Fetch events only when accordion is opened
    const {data: events = [], isLoading: isLoadingHistory} = useQuery({
        queryKey: ['authorization-events', authorization.clientId],
        queryFn: async () => {
            return await AuthorizationManagementController.getAuthorizationEvents(authorization.clientId);
        },
        enabled: isOpen, // Only fetch when accordion is open
    });

    // Revoke mutation
    const revokeMutation = useMutation({
        mutationFn: () => AuthorizationManagementController.revokeAuthorization(authorization.clientId),
        onSuccess: (success) => {
            if (success) {
                toast.success("Autorisation révoquée avec succès");
                queryClient.invalidateQueries({queryKey: ['active-authorizations']});
                queryClient.invalidateQueries({queryKey: ['inactive-authorizations']});
                queryClient.invalidateQueries({queryKey: ['authorization-events', authorization.clientId]});
            } else {
                toast.error("Impossible de révoquer l'autorisation");
            }
        },
        onError: () => {
            toast.error("Erreur lors de la révocation de l'autorisation");
        },
    });

    const formatDate = (timestamp: string | undefined) => {
        if (!timestamp) return "Date inconnue";
        return formatDistanceToNow(new Date(timestamp), {
            addSuffix: true,
            locale: fr
        });
    };

    const handleRevoke = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent accordion from toggling

        const confirmed = await confirm({
            title: "Révoquer l'accès",
            description: `Êtes-vous sûr de vouloir révoquer l'accès à l'application "${authorization.clientName}" ? Cette application ne pourra plus accéder à vos données.`,
            confirmLabel: "Révoquer",
            cancelLabel: "Annuler",
            variant: "destructive",
            confirmText: "Révoquer"
        });

        if (confirmed) {
            revokeMutation.mutate();
        }
    };


    const cardClassName = authorization.isActive
        ? "border-primary/50 bg-card hover:shadow-md transition-all"
        : "border-muted bg-muted/30 hover:shadow-sm transition-all";

    return (
        <Card className={cardClassName}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-5 w-5 text-primary flex-shrink-0"/>
                            <h3 className="text-lg font-semibold truncate">{authorization.clientName}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={authorization.isActive ? "default" : "secondary"}>
                                {authorization.isActive ? "Actif" : authorization.revokedAt ? "Révoqué" : "Remplacé"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Autorisé {formatDate(authorization.grantedAt)}
                            </span>
                        </div>
                    </div>
                    {authorization.isActive && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRevoke}
                            disabled={revokeMutation.isPending}
                        >
                            {revokeMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                                    Révocation...
                                </>
                            ) : (
                                "Révoquer"
                            )}
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {/* Scopes */}
                <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Scopes autorisés :</p>
                    <div className="flex flex-wrap gap-1.5">
                        {Array.from(authorization.authorizedScopes || []).map((scope) => (
                            <Badge key={scope} variant="outline" className="text-xs">
                                {scope}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* History Accordion */}
                <Accordion
                    type="single"
                    collapsible
                    onValueChange={(value) => setIsOpen(value === "history")}
                >
                    <AccordionItem value="history" className="border-0">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline py-2">
                            Voir l'historique complet
                        </AccordionTrigger>
                        <AccordionContent>
                            {isLoadingHistory ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
                                </div>
                            ) : events.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4">Aucun historique disponible</p>
                            ) : (
                                <div className="space-y-0 mt-2">
                                    {events
                                        .filter((event): event is AuthorizationEventDTO => event !== undefined)
                                        .map((event, index, array) => (
                                            <AuthorizationHistoryItem
                                                key={event.id}
                                                event={event}
                                                nextEventType={array[index + 1]?.eventType}
                                                isFirst={index === 0}
                                                isLast={index === array.length - 1}
                                            />
                                        ))}
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
