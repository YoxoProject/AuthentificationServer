import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Copy, Eye, EyeOff, RefreshCw} from "lucide-react";
import {toast} from "sonner";
import {useConfirm} from "@/contexts/ConfirmDialogContext";

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
    const confirm = useConfirm();
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    // Nouvelle valeur régénérée (affichée temporairement, puis synchronisée via props)
    const [regeneratedValue, setRegeneratedValue] = useState<string | null>(null);

    // Utiliser regeneratedValue si disponible, sinon value
    const currentValue = regeneratedValue || value;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentValue);
            toast.success("Copié dans le presse-papier");
        } catch (error) {
            toast.error("Erreur lors de la copie");
        }
    };

    const handleRegenerate = async () => {
        if (!onRegenerate) return;

        const credentialType = isSecret ? "secret" : "client ID";
        const confirmed = await confirm({
            title: `Régénérer ${label}`,
            description: `Êtes-vous sûr de vouloir régénérer ce ${credentialType} ? Cette action est irréversible et invalidera toutes les configurations existantes.`,
            confirmText: "REGENERER",
            confirmLabel: "Régénérer",
            cancelLabel: "Annuler",
            variant: "destructive"
        });

        if (!confirmed) return;

        setIsRegenerating(true);
        try {
            const newValue = await onRegenerate();
            // Stocker temporairement la nouvelle valeur
            // (elle sera ensuite mise à jour via les props par le parent)
            setRegeneratedValue(newValue);
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
        return currentValue;
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
