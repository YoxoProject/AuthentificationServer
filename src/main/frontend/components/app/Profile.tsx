import {useAuth} from '@/auth';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {cn} from '@/lib/utils';
import {AppWindow, Cable, LogOut, User} from 'lucide-react';
import {useNavigate} from 'react-router';
import {buttonVariants} from "@/components/ui/button";

/**
 * Composant Profile avec avatar et menu déroulant
 *
 * Affiche l'avatar de l'utilisateur (avec username sur écrans md+) et propose un menu
 * avec des liens de navigation et une option de déconnexion.
 *
 * @example
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <Profile />
 *   <ThemeToggle />
 * </div>
 * ```
 */
export function Profile() {
    const {state, logout} = useAuth();
    const navigate = useNavigate();

    // Ne pas afficher si l'utilisateur n'est pas authentifié
    if (!state.user) {
        return null;
    }

    const username = state.user.username || 'User';
    const avatarUrl = `https://skins.nationsglory.fr/face/${username}/15`;
    const initials = username.substring(0, 2).toUpperCase();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(buttonVariants({variant: "outline"}))}
            >
                <Avatar className="size-8">
                    <AvatarImage src={avatarUrl} alt={username}/>
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block font-medium">
                    {username}
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/account')}>
                    <User className="mr-2 size-4"/>
                    <span>Mon compte</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/connections')}>
                    <Cable className="mr-2 size-4"/>
                    <span>Mes connections</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app')}>
                    <AppWindow className="mr-2 size-4"/>
                    <span>Mes applications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 size-4"/>
                    <span>Déconnexion</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
