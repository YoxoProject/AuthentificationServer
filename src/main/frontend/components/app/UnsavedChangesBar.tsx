import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Save } from "lucide-react";

interface UnsavedChangesBarProps {
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
}

/**
 * Barre d'action fixe en bas de page (style Discord)
 * Affichée quand il y a des modifications non sauvegardées
 */
export function UnsavedChangesBar({
  onSave,
  onReset,
  isSaving = false,
}: UnsavedChangesBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
            {/* Message d'avertissement */}
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
              <p className="text-sm font-medium">
                Attention — vous avez des modifications non enregistrées
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
