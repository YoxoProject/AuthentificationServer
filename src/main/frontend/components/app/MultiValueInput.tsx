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
                                }: MultiValueInputProps) {
    const [inputValue, setInputValue] = useState("");

    const handleAdd = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !values.includes(trimmedValue)) {
            onChange([...values, trimmedValue]);
            setInputValue("");
        }
    };

    const handleRemove = (valueToRemove: string) => {
        onChange(values.filter((v) => v !== valueToRemove));
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
            <div className="flex gap-2">
                <Input
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAdd}
                    disabled={disabled || !inputValue.trim()}
                >
                    <Plus className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
}
