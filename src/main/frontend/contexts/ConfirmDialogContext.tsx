import React, {createContext, useCallback, useContext, useState} from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

interface ConfirmOptions {
    title: string;
    description: string;
    confirmText?: string; // Si fourni, l'utilisateur doit taper ce texte
    confirmLabel?: string; // Label du bouton (défaut: "Confirmer")
    cancelLabel?: string; // Label du bouton (défaut: "Annuler")
    variant?: "default" | "destructive"; // Style du bouton
}

interface ConfirmDialogContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({children}: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setInputValue("");
        setOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        if (resolvePromise) {
            resolvePromise(true);
        }
        setOpen(false);
        setOptions(null);
        setInputValue("");
        setResolvePromise(null);
    };

    const handleCancel = () => {
        if (resolvePromise) {
            resolvePromise(false);
        }
        setOpen(false);
        setOptions(null);
        setInputValue("");
        setResolvePromise(null);
    };

    const isConfirmDisabled = options?.confirmText != undefined && inputValue !== options.confirmText;

    return (
        <ConfirmDialogContext.Provider value={{confirm}}>
            {children}
            <AlertDialog open={open} onOpenChange={(isOpen) => {
                if (!isOpen) {
                    handleCancel();
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{options?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {options?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {options?.confirmText && (
                        <div className="space-y-2">
                            <Label>
                                Pour confirmer, tapez : <strong>{options.confirmText}</strong>
                            </Label>
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={options.confirmText}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isConfirmDisabled) {
                                        handleConfirm();
                                    }
                                }}
                            />
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>
                            {options?.cancelLabel || "Annuler"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            disabled={isConfirmDisabled}
                        >
                            {options?.confirmLabel || "Confirmer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmDialogContext.Provider>
    );
}

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
    const context = useContext(ConfirmDialogContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmDialogProvider");
    }
    return context.confirm;
}
