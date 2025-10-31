import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Plus, X} from "lucide-react";
import {Badge} from "@/components/ui/badge";

interface MultiValueInputProps {
    label: string;
    placeholder: string;
    values: string[];
    onChange: (values: string[]) => void;
    description?: string;
    disabled?: boolean;
    validateUrl?: boolean; // Activer la validation d'URL
}

/**
 * Valide et normalise une URL selon les règles :
 * - Doit commencer par http:// ou https://
 * - Remplace 127.0.0.1 par localhost
 * - Supprime le / final
 * - Rejette les wildcards (*)
 * Utilise le constructeur URL() pour une validation robuste de la structure complète.
 */
function validateAndNormalizeUrl(url: string): { valid: boolean; normalized?: string; error?: string } {
    const trimmed = url.trim();

    if (!trimmed) {
        return {valid: false, error: "L'URL ne peut pas être vide"};
    }

    // Rejeter les wildcards avant validation
    if (trimmed.includes("*")) {
        return {valid: false, error: "Les wildcards (*) ne sont pas autorisés"};
    }

    try {
        // Utiliser le constructeur URL pour une validation robuste
        const urlObject = new URL(trimmed);

        // Vérifier que le protocole est http ou https
        if (urlObject.protocol !== "http:" && urlObject.protocol !== "https:") {
            return {
                valid: false,
                error: "L'URL doit commencer par http:// ou https://"
            };
        }

        let normalized = urlObject.toString();

        // Supprimer le / final si le path est vide (juste "/")
        if (normalized.endsWith("/") && urlObject.pathname === "/") {
            normalized = normalized.slice(0, -1);
        }

        return {valid: true, normalized};
    } catch (error) {
        return {
            valid: false,
            error: "Format d'URL invalide"
        };
    }
}

/**
 * Composant pour gérer une liste de valeurs (redirect URIs, CORS URLs, etc.).
 * Permet d'ajouter et supprimer des valeurs dynamiquement.
 */
export function MultiValueInput({
                                    label,
                                    placeholder,
                                    values,
                                    onChange,
                                    description,
                                    disabled = false,
                                    validateUrl = false,
                                }: MultiValueInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        const trimmedValue = inputValue.trim();

        if (!trimmedValue) {
            return;
        }

        // Valider l'URL si nécessaire
        if (validateUrl) {
            const validation = validateAndNormalizeUrl(trimmedValue);
            if (!validation.valid) {
                setError(validation.error || "URL invalide");
                return;
            }

            const normalizedValue = validation.normalized!;

            if (values.includes(normalizedValue)) {
                setError("Cette URL existe déjà");
                return;
            }

            onChange([...values, normalizedValue]);
            setInputValue("");
            setError(null);
        } else {
            // Sans validation, comportement d'origine
            if (!values.includes(trimmedValue)) {
                onChange([...values, trimmedValue]);
                setInputValue("");
                setError(null);
            }
        }
    };

    const handleRemove = (valueToRemove: string) => {
        onChange(values.filter((v) => v !== valueToRemove));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Valider en temps réel si la validation URL est activée
        if (validateUrl && newValue.trim()) {
            const validation = validateAndNormalizeUrl(newValue.trim());
            if (!validation.valid) {
                setError(validation.error || "URL invalide");
            } else {
                setError(null);
            }
        } else {
            setError(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}

            {/* Liste des valeurs existantes */}
            {values.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {values.map((value) => (
                        <Badge
                            key={value}
                            variant="secondary"
                            className="pl-2 pr-1 py-1 text-sm"
                        >
                            <span className="mr-1 truncate max-w-[300px]">{value}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => handleRemove(value)}
                                disabled={disabled}
                            >
                                <X className="h-3 w-3"/>
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Input pour ajouter de nouvelles valeurs */}
            <div className="space-y-1">
                <div className="flex gap-2">
                    <Input
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAdd}
                        disabled={disabled || !inputValue.trim() || !!error}
                    >
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>
        </div>
    );
}
