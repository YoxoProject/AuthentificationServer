package fr.romaindu35.authserver.utils;

import jakarta.annotation.Nonnull;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

@AllArgsConstructor
@Getter
public enum Permissions {

    PROFILE("profile", "Obtenir votre nom d'utilisateur", true),
    API_ACCESS("api_access", "Réaliser des requêtes API en votre nom", true);

    private final String scopeName;
    private final String description;
    private final boolean alwaysGranted;

    public record PermissionData(@Nonnull String scopeName, @Nonnull String description) { }

    public static PermissionData[] valuesData() {
        Permissions[] permissions = values();
        PermissionData[] data = new PermissionData[permissions.length];
        for (int i = 0; i < permissions.length; i++) {
            data[i] = new PermissionData(permissions[i].getScopeName(), permissions[i].getDescription());
        }
        return data;
    }

    public static PermissionData toPermissionData(String scopeName) {
        for (Permissions permission : values()) {
            if (permission.getScopeName().equals(scopeName)) {
                return new PermissionData(permission.getScopeName(), permission.getDescription());
            }
        }
        return null;
    }

    public static Permissions[] getAlwaysGrantedPermissions() {
        return Arrays.stream(values())
                .filter(Permissions::isAlwaysGranted)
                .toArray(Permissions[]::new);
    }
}