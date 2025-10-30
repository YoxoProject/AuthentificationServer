import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Copy, Eye, EyeOff, RefreshCw} from "lucide-react";
import {toast} from "sonner";

interface CredentialFieldProps {
    label: string;
    value: string;
    onRegenerate?: () => Promise<string>;
    isSecret?: boolean;
    canRegenerate?: boolean;
    description?: string;
    /** Indique si la valeur est vide/non générée (désactive la copie) */
    isEmpty?: boolean;
}

/**
 * Composant pour afficher et gérer les credentials (Client ID / Client Secret).
 * Permet de copier dans le presse-papier et de régénérer les credentials.
 */
export function CredentialField({
                                    label,
                                    value,
                                    onRegenerate,
                                    isSecret = false,
                                    canRegenerate = true,
                                    description,
                                    isEmpty = false,
                                }: CredentialFieldProps) {
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [displayValue, setDisplayValue] = useState(value);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(displayValue);
            toast.success("Copié dans le presse-papier");
        } catch (error) {
            toast.error("Erreur lors de la copie");
        }
    };

    const handleRegenerate = async () => {
        if (!onRegenerate) return;

        const confirmed = confirm(
            `Êtes-vous sûr de vouloir régénérer ce ${
                isSecret ? "secret" : "client ID"
            } ?\n\nCette action est irréversible et invalidera toutes les configurations existantes.`
        );

        if (!confirmed) return;

        setIsRegenerating(true);
        try {
            const newValue = await onRegenerate();
            setDisplayValue(newValue);
            toast.success(
                `${isSecret ? "Secret" : "Client ID"} régénéré avec succès`
            );
        } catch (error) {
            toast.error("Erreur lors de la régénération");
            console.error(error);
        } finally {
            setIsRegenerating(false);
        }
    };

    const getDisplayedValue = () => {
        if (isSecret && !showSecret) {
            return "•".repeat(40);
        }
        return displayValue;
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={getDisplayedValue()}
                        readOnly
                        disabled={isEmpty}
                        className="pr-10 font-mono text-sm"
                    />
                    {isSecret && !isEmpty && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowSecret(!showSecret)}
                        >
                            {showSecret ? (
                                <EyeOff className="h-4 w-4"/>
                            ) : (
                                <Eye className="h-4 w-4"/>
                            )}
                        </Button>
                    )}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    disabled={isEmpty}
                    title={isEmpty ? "Secret non généré" : "Copier"}
                >
                    <Copy className="h-4 w-4"/>
                </Button>

                {canRegenerate && onRegenerate && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        title="Régénérer"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
                        />
                    </Button>
                )}
            </div>

            {isSecret && (
                <p className="text-xs text-muted-foreground">
                    ⚠️ Le secret n'est affiché qu'une seule fois. Copiez-le et conservez-le
                    en lieu sûr.
                </p>
            )}
        </div>
    );
}
