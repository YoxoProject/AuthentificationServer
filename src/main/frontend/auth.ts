import { UserController } from 'Frontend/generated/endpoints';
import { configureAuth } from "@vaadin/hilla-react-auth";

/**
 * Configuration centralisée de l'authentification pour l'application.
 * Utilise le UserController backend pour récupérer les informations de l'utilisateur authentifié.
 */
const auth = configureAuth(UserController.getAuthenticatedUser);

/**
 * Hook React pour accéder à l'état d'authentification dans les composants.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, user, logout } = useAuth();
 *
 *   if (state === 'authenticated') {
 *     return <div>Bonjour {user.username}</div>;
 *   }
 *   return <div>Non authentifié</div>;
 * }
 * ```
 */
export const useAuth = auth.useAuth;

/**
 * Provider d'authentification à wrapper autour de l'application.
 * Gère l'état d'authentification global et la redirection automatique vers /login.
 */
export const AuthProvider = auth.AuthProvider;
