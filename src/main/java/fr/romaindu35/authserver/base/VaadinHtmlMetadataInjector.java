package fr.romaindu35.authserver.base;

import com.vaadin.flow.server.ServiceInitEvent;
import com.vaadin.flow.server.VaadinServiceInitListener;
import com.vaadin.flow.server.communication.IndexHtmlRequestListener;
import com.vaadin.flow.server.communication.IndexHtmlResponse;
import org.springframework.stereotype.Component;

@Component
public class VaadinHtmlMetadataInjector implements VaadinServiceInitListener {
    @Override
    public void serviceInit(ServiceInitEvent event) {
        event.addIndexHtmlRequestListener(new IndexHtmlRequestListener() {
            @Override
            public void modifyIndexHtmlResponse(IndexHtmlResponse response) {
                response.getDocument().head().append(
                        """
                        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
                        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
                        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
                        <link rel="manifest" href="/site.webmanifest"/>
                        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
                        <meta name="msapplication-TileColor" content="#ffc40d"/>
                        <meta name="theme-color" content="#ffffff"/>
                        <title>Yoxo - Authentification</title>
                        """
                );
            }
        });
    }
}