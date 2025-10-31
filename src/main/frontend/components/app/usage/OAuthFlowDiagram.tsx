import { ClientFlowDiagram } from './ClientFlowDiagram';
import { ServerFlowDiagram } from './ServerFlowDiagram';
import { ServiceFlowDiagram } from './ServiceFlowDiagram';
import ClientType from "@/generated/fr/romaindu35/authserver/entity/OAuth2Client/ClientType";

interface OAuthFlowDiagramProps {
    clientType: ClientType;
}

export function OAuthFlowDiagram({ clientType }: OAuthFlowDiagramProps) {
    return (
        <div className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {clientType === ClientType.CLIENT && <ClientFlowDiagram />}
            {clientType === ClientType.SERVER && <ServerFlowDiagram />}
            {clientType === ClientType.SERVICE && <ServiceFlowDiagram />}
        </div>
    );
}
