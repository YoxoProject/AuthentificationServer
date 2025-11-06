import {Badge} from "@/components/ui/badge";
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import {CheckCircle2, Globe, MapPin, Monitor, PlusCircle, XCircle} from "lucide-react";
import AuthorizationEventDTO from "@/generated/fr/romaindu35/authserver/dto/AuthorizationEventDTO";
import AuthorizationEventType from "@/generated/fr/romaindu35/authserver/dto/AuthorizationEventType";

interface AuthorizationHistoryItemProps {
    event: AuthorizationEventDTO;
    nextEventType?: AuthorizationEventType;
    isFirst?: boolean;
    isLast?: boolean;
}

/**
 * Composant pour afficher un événement dans l'historique des autorisations.
 * Affiche le type d'événement, la date et les métadonnées (IP, navigateur, device, OS, localisation).
 */
export function AuthorizationHistoryItem({
                                             event,
                                             nextEventType,
                                             isFirst = false,
                                             isLast = false
                                         }: AuthorizationHistoryItemProps) {
    const getEventIcon = () => {
        switch (event.eventType) {
            case AuthorizationEventType.AUTHORIZATION:
                return <CheckCircle2 className="h-5 w-5 text-green-600"/>;
            case AuthorizationEventType.SCOPE_ADDITION:
                return <PlusCircle className="h-5 w-5 text-blue-600"/>;
            case AuthorizationEventType.REVOCATION:
                return <XCircle className="h-5 w-5 text-red-600"/>;
            default:
                return <CheckCircle2 className="h-5 w-5 text-gray-600"/>;
        }
    };

    const getEventLabel = () => {
        switch (event.eventType) {
            case AuthorizationEventType.AUTHORIZATION:
                return "Autorisation initiale";
            case AuthorizationEventType.SCOPE_ADDITION:
                return "Ajout de scopes";
            case AuthorizationEventType.REVOCATION:
                return "Révocation";
            default:
                return "Événement inconnu";
        }
    };

    const getEventBadgeVariant = (): "default" | "secondary" | "destructive" => {
        switch (event.eventType) {
            case AuthorizationEventType.AUTHORIZATION:
                return "default";
            case AuthorizationEventType.SCOPE_ADDITION:
                return "secondary";
            case AuthorizationEventType.REVOCATION:
                return "destructive";
            default:
                return "secondary";
        }
    };

    const formatDate = (timestamp: string | undefined) => {
        if (!timestamp) return "Date inconnue";
        return format(new Date(timestamp), "PPpp", {locale: fr});
    };

    const formatLocation = () => {
        const parts = [];
        if (event.city) parts.push(event.city);
        if (event.country) parts.push(event.country);
        return parts.length > 0 ? parts.join(", ") : null;
    };

    const location = formatLocation();

    // Timeline colors based on position and state
    const isActiveEvent = isFirst && event.eventType !== AuthorizationEventType.REVOCATION;
    const dotColor = isActiveEvent ? "bg-green-500" : "bg-gray-300";

    // Determine line styles
    const isLowerLineDashed = nextEventType === AuthorizationEventType.REVOCATION;
    const isUpperLineDashed = event.eventType === AuthorizationEventType.REVOCATION;

    // Compute line classes with Tailwind
    const upperLineClasses = isUpperLineDashed
        ? "w-0.5 h-[20px] mb-1 border-l-[2px] border-dashed border-gray-300"
        : `w-0.5 h-[20px] mb-1 ${isActiveEvent ? "bg-green-500" : "bg-gray-300"}`;

    const lowerLineClasses = isLowerLineDashed
        ? "w-0.5 flex-1 mt-1 border-l-[2px] border-dashed border-gray-300"
        : isActiveEvent
            ? "w-0.5 flex-1 mt-1 bg-gradient-to-b from-green-500 via-green-500/50 to-gray-300"
            : "w-0.5 flex-1 mt-1 bg-gray-300";

    return (
        <div className="flex gap-4 relative">
            {/* Timeline line */}
            <div className="flex-shrink-0 flex flex-col items-center">
                {/* Upper vertical line - connects to previous item */}
                {!isFirst && (
                    <div className={upperLineClasses}></div>
                )}
                {/* Dot */}
                <div className={`w-2 h-2 rounded-full ${dotColor} ${!isFirst ? 'mt-0' : 'mt-2'} z-10`}></div>
                {/* Lower vertical line - connects to next item */}
                {!isLast && (
                    <div className={lowerLineClasses}></div>
                )}
            </div>

            {/* Icon */}
            <div className="flex-shrink-0 py-3 mt-1">
                {getEventIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2 py-3">
                {/* Event header */}
                <div className="flex items-center gap-2 flex-wrap">
                    {isActiveEvent && (
                        <Badge variant="default" className="bg-green-600">
                            Actuelle
                        </Badge>
                    )}
                    <Badge variant={getEventBadgeVariant()}>
                        {getEventLabel()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        {formatDate(event.timestamp)}
                    </span>
                </div>

                {/* Scopes - Only for AUTHORIZATION and SCOPE_ADDITION events */}
                {event.scopes && event.scopes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        <p className="font-medium">Scopes autorisés:</p>
                        {Array.from(event.scopes).map((scope) => (
                            <Badge key={scope} variant="outline" className="text-xs">
                                {scope}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Metadata */}
                <div className="flex max-md:flex-col gap-2 md:gap-10 text-xs text-muted-foreground">
                    {/* Device info */}
                    {(event.browser || event.os || event.deviceType) && (
                        <div className="flex items-center gap-1.5">
                            <Monitor className="h-3.5 w-3.5"/>
                            <span>
                                {event.browser && <span className="font-medium">{event.browser}</span>}
                                {event.browser && event.os && " • "}
                                {event.os}
                                {(event.browser || event.os) && event.deviceType && " • "}
                                {event.deviceType}
                            </span>
                        </div>
                    )}

                    {/* Location */}
                    {location && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5"/>
                            <span>{location}</span>
                        </div>
                    )}

                    {/* IP Address */}
                    {event.ipAddress && (
                        <div className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5"/>
                            <span className="font-mono">{event.ipAddress}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
