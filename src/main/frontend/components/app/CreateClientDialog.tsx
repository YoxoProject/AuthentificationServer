import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

const formSchema = z.object({
    clientName: z.string().min(1, "Le nom de l'application est requis"),
});

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
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientName: "",
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await onSubmit(values.clientName);
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error("Erreur lors de la création du client:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Créer une nouvelle application</DialogTitle>
                            <DialogDescription>
                                Donnez un nom à votre application OAuth2. Vous pourrez configurer
                                les autres paramètres après la création.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <FormField
                                control={form.control}
                                name="clientName"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Nom de l'application</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Mon application"
                                                {...field}
                                                autoFocus
                                                disabled={form.formState.isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={form.formState.isSubmitting}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Création..." : "Créer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
