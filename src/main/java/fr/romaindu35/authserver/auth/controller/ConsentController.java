package fr.romaindu35.authserver.auth.controller;

import com.vaadin.hilla.BrowserCallable;
import fr.romaindu35.authserver.entity.OAuth2Client;
import fr.romaindu35.authserver.entity.User;
import fr.romaindu35.authserver.repository.OAuth2ClientRepository;
import fr.romaindu35.authserver.repository.UserRepository;
import fr.romaindu35.authserver.utils.Permissions;
import jakarta.annotation.Nonnull;
import jakarta.annotation.security.PermitAll;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;


@BrowserCallable
@PermitAll
@AllArgsConstructor
public class ConsentController {

    private final OAuth2ClientRepository oAuth2ClientRepository;
    private final UserRepository userRepository;

    public ConsentData getConsentData(String clientId, String scope) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Permissions.PermissionData[] permissions = Arrays.stream(scope.split(" ")).map(Permissions::toPermissionData).toArray(Permissions.PermissionData[]::new);
        OAuth2Client client = oAuth2ClientRepository.findByClientId(clientId);
        if (client != null) {
            User user = userRepository.findById(client.getOwnerId()).orElseThrow();
            return new ConsentData(auth.getName(), client.getClientName(), user.getUsername(), permissions);
        }

        return null;
    }

    public record ConsentData(@Nonnull String username, @Nonnull String clientName, @Nonnull String clientOwner,
                              @Nonnull Permissions.PermissionData[] permissions) {
    }

}