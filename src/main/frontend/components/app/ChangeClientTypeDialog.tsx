import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info } from "lucide-react";
import ClientType from "@/generated/fr/romaindu35/authserver/entity/OAuth2Client/ClientType";

interface ChangeClientTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentType: ClientType;
    onConfirm: (newType: ClientType) => Promise<void>;
}

interface ClientTypeOption {
    value: ClientType;
    title: string;
    description: string;
    technicalDetails: string;
    badge: string;
    badgeVariant: "default" | "secondary" | "destructive" | "outline";
}

const clientTypeOptions: ClientTypeOption[] = [
    {
        value: ClientType.CLIENT,
        title: "Client (Application Web/Mobile)",
        description: "Pour les applications client-side (SPA, React, Vue, applications mobiles)",
        technicalDetails: "Utilise PKCE flow, pas de secret client",
        badge: "Recommandé pour SPA",
        badgeVariant: "secondary",
    },
    {
        value: ClientType.SERVER,
        title: "Server (Backend sécurisé)",
        description: "Pour les applications avec un serveur backend sécurisé",
        technicalDetails: "Utilise Authorization Code flow avec client secret",
        badge: "Nécessite secret",
        badgeVariant: "secondary",
    },
    {
        value: ClientType.SERVICE,
        title: "Service (Machine-to-Machine)",
        description: "Pour les services API sans interaction utilisateur",
        technicalDetails: "Utilise Client Credentials flow",
        badge: "M2M",
        badgeVariant: "secondary",
    },
];

export function ChangeClientTypeDialog({
    open,
    onOpenChange,
    currentType,
    onConfirm,
}: ChangeClientTypeDialogProps) {
    const [selectedType, setSelectedType] = useState<ClientType>(currentType);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
        if (!isSubmitting) {
            setSelectedType(currentType);
            onOpenChange(newOpen);
        }
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm(selectedType);
        } catch (error) {
            console.error("Error changing client type:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasChanged = selectedType !== currentType;

    const getImpactMessage = () => {
        if (!hasChanged) return null;

        if (currentType === ClientType.CLIENT && selectedType !== ClientType.CLIENT) {
            return {
                icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
                variant: "destructive" as const,
                title: "Ce changement va :",
                items: [
                    "Générer un nouveau client secret",
                    "Désactiver l'authentification PKCE",
                    "Nécessiter l'utilisation du secret dans votre backend",
                    "Désactiver les CORS"
                ],
            };
        }

        if (currentType !== ClientType.CLIENT && selectedType === ClientType.CLIENT) {
            return {
                icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
                variant: "destructive" as const,
                title: "Ce changement va :",
                items: [
                    "Supprimer définitivement le client secret existant",
                    "Activer l'authentification PKCE uniquement"
                ],
            };
        }

        // SERVER ↔ SERVICE
        return {
            icon: <Info className="h-5 w-5 text-blue-600" />,
            variant: "info" as const,
            title: "Ce changement modifiera uniquement les flows OAuth2 disponibles.",
            items: ["Le client secret sera conservé"],
        };
    };

    const impactMessage = getImpactMessage();

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Changer le type de client</DialogTitle>
                    <DialogDescription>
                        Sélectionnez le type de client approprié selon votre cas d'utilisation
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <RadioGroup
                        value={selectedType}
                        onValueChange={(value) => setSelectedType(value as ClientType)}
                    >
                        {clientTypeOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                                    selectedType === option.value
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                }`}
                                onClick={() => setSelectedType(option.value)}
                            >
                                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={option.value} className="text-base font-semibold cursor-pointer">
                                            {option.title}
                                        </Label>
                                        <Badge variant={option.badgeVariant}>{option.badge}</Badge>
                                        {currentType === option.value && (
                                            <Badge variant="outline" className="text-xs">
                                                Actuel
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{option.description}</p>
                                    <p className="text-xs text-muted-foreground italic">
                                        {option.technicalDetails}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>

                    {impactMessage && (
                        <div
                            className={`rounded-lg border p-4 ${
                                impactMessage.variant === "destructive"
                                    ? "border-destructive/50 bg-destructive/10"
                                    : "border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20"
                            }`}
                        >
                            <div className="flex gap-3">
                                {impactMessage.icon}
                                <div className="flex-1 space-y-2">
                                    <p className="text-sm font-semibold">{impactMessage.title}</p>
                                    <ul className="text-sm space-y-1 list-disc list-inside">
                                        {impactMessage.items.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!hasChanged || isSubmitting}
                        variant={
                            impactMessage?.variant === "destructive" ? "destructive" : "default"
                        }
                    >
                        {isSubmitting ? "Changement en cours..." : "Changer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
