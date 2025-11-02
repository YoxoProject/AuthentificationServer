import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {formatDistanceToNow} from "date-fns";
import ClientListItemDTO from "@/generated/fr/romaindu35/authserver/dto/ClientListItemDTO";
import {fr} from "date-fns/locale";

interface ClientCardProps {
    client: ClientListItemDTO;
    onClick: () => void;
}

/**
 * Composant Card pour afficher un client OAuth2 dans la liste.
 * Affiche le nom, le type (badge), la date de création et le statut officiel.
 */
export function ClientCard({client, onClick}: ClientCardProps) {
    const getClientTypeBadge = (type: string) => {
        switch (type) {
            case "CLIENT":
                return <Badge variant="outline">Client (SPA)</Badge>;
            case "SERVER":
                return <Badge variant="outline">Server</Badge>;
            case "SERVICE":
                return <Badge variant="outline">Service (API)</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const formatDate = (timestamp: string | undefined) => {
        if (!timestamp) return "Date inconnue";
        // Hilla renvoie un string ISO pour les Instant Java
        return formatDistanceToNow(new Date(timestamp), {
            addSuffix: true,
            locale: fr
        });
    };

    return (
        <Card
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 gap-2"
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold truncate">{client.clientName}</h3>
                    {client.official && (
                        <Badge variant="default" className="ml-2 shrink-0">
                            Officiel
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="flex items-center gap-2">
                    {getClientTypeBadge(client.clientType)}
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-sm text-muted-foreground">
                    Créé {formatDate(client.createdAt)}
                </p>
            </CardFooter>
        </Card>
    );
}
