import {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";

interface CreateClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (clientName: string) => Promise<void>;
}

/**
 * Dialog pour créer un nouveau client OAuth2.
 * Demande uniquement un nom, les autres paramètres sont configurables après création.
 */
export function CreateClientDialog({
                                       open,
                                       onOpenChange,
                                       onSubmit,
                                   }: CreateClientDialogProps) {
    const [clientName, setClientName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(clientName);
            setClientName(""); // Reset form
            onOpenChange(false);
        } catch (error) {
            console.error("Erreur lors de la création du client:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Créer une nouvelle application</DialogTitle>
                        <DialogDescription>
                            Donnez un nom à votre application OAuth2. Vous pourrez configurer
                            les autres paramètres après la création.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="clientName">Nom de l'application</Label>
                        <Input
                            id="clientName"
                            placeholder="Mon application"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            autoFocus
                            required
                            disabled={isSubmitting}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !clientName.trim()}>
                            {isSubmitting ? "Création..." : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
