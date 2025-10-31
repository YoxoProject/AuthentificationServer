import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Copy, RefreshCw} from 'lucide-react';
import {toast} from 'sonner';
import {generatePKCEPair} from '@/utils/pkce';

interface PKCEGeneratorProps {
    onGenerate: (verifier: string, challenge: string) => void;
}

export function PKCEGenerator({onGenerate}: PKCEGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [pkceValues, setPkceValues] = useState<{verifier: string, challenge: string} | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const values = await generatePKCEPair();
            setPkceValues(values);
            onGenerate(values.verifier, values.challenge);
            toast.success('Valeurs PKCE générées avec succès');
        } catch (error) {
            toast.error('Erreur lors de la génération PKCE');
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copié dans le presse-papier`);
        } catch (error) {
            toast.error('Erreur lors de la copie');
        }
    };

    const isEmpty = !pkceValues;

    return (
        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium">Générateur PKCE</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        Générez des valeurs PKCE pour tester votre intégration
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`}/>
                    {isEmpty ? 'Générer' : 'Régénérer'}
                </Button>
            </div>

            <div className="space-y-3">
                {/* Code Verifier */}
                <div className="space-y-2">
                    <Label htmlFor="code-verifier">Code Verifier</Label>
                    <div className="flex gap-2">
                        <Input
                            id="code-verifier"
                            value={pkceValues?.verifier || ''}
                            readOnly
                            disabled={isEmpty}
                            className="font-mono text-sm"
                            placeholder="Cliquez sur 'Générer' pour créer les valeurs"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopy(pkceValues!.verifier, 'Code verifier')}
                            disabled={isEmpty}
                            title="Copier le code verifier"
                        >
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>

                {/* Code Challenge */}
                <div className="space-y-2">
                    <Label htmlFor="code-challenge">Code Challenge</Label>
                    <div className="flex gap-2">
                        <Input
                            id="code-challenge"
                            value={pkceValues?.challenge || ''}
                            readOnly
                            disabled={isEmpty}
                            className="font-mono text-sm"
                            placeholder="Calculé automatiquement depuis le verifier"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopy(pkceValues!.challenge, 'Code challenge')}
                            disabled={isEmpty}
                            title="Copier le code challenge"
                        >
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
