import AuthLayout from "@/layout/AuthLayout";
import {Button} from "@/components/ui/button";
import {Typography} from "@/components/ui/typography";
import {useAuth} from "@/auth";
import {AppWindow, Cable, LogOut, User} from "lucide-react";

import '@/styles/index.css'; /* Permet d'importer les styles globaux + Tailwind CSS */

interface ActionCard {
    icon: React.ReactNode;
    title: string;
    titleAuthenticated: string;
    description: string;
    route: string;
    color: string;
}

export default function Home() {
    const {state, logout} = useAuth();
    const isAuthenticated = state.user !== undefined;
    const username = state.user?.username || '';

    const actionCards: ActionCard[] = [
        {
            icon: <User className="size-6"/>,
            title: "Gérez mon compte",
            titleAuthenticated: "Mon compte",
            description: "Liez vos doubles comptes NationsGlory ainsi que votre compte Discord, ou supprimez définitivement votre compte.",
            route: "/account",
            color: "bg-blue-500"
        },
        {
            icon: <Cable className="size-6"/>,
            title: "Gérez mes connections",
            titleAuthenticated: "Mes connections",
            description: "Gérez les autorisations accordées aux applications et suivez leur utilisation.",
            route: "/connections",
            color: "bg-green-500"
        },
        {
            icon: <AppWindow className="size-6"/>,
            title: "Gérez mes applications",
            titleAuthenticated: "Mes applications",
            description: "Pour les développeurs : créez vos clients OAuth2 pour intégrer les API Yoxo dans vos applications.",
            route: "/app",
            color: "bg-purple-500"
        }
    ];

    const handleLogout = async () => {
        await logout();
        window.location.reload();
    };

    const handleLogin = () => {
        window.location.href = "/login"
    }

    return (
        <AuthLayout>
            <div
                className="mx-4 gap-2 grid w-full max-w-2xl rounded-lg border border-border px-4 backdrop-blur-[2px] md:px-8 py-4">
                <div className="flex gap-2 flex-col text-center">
                    <div className="mx-auto mb-2">
                        <img
                            src="/images/yoxo_logo_128x128.png"
                            alt="Yoxo"
                            className="mx-auto h-20 w-20 rounded-lg"
                        />
                    </div>
                    <Typography variant="h1" className="lg:text-4xl text-3xl font-bold tracking-tight">
                        {isAuthenticated ? (
                            <>
                                Bienvenue {username}
                            </>
                        ) : (
                            "Serveur d'Authentification Yoxo"
                        )}
                    </Typography>
                    <p className="text-base text-muted-foreground max-w-lg mx-auto">
                        Bienvenue sur le serveur d'authentification OAuth2 de Yoxo.
                        Gérez votre compte et connectez-vous de manière sécurisée à tous les services Yoxo.
                    </p>
                </div>

                <div className="grid gap-2 md:grid-cols-1">
                    {actionCards.map((card, index) => (
                        <button
                            key={index}
                            onClick={() => window.location.href = card.route}
                            className="group grid rounded-lg border border-border/50 bg-card/50 p-4 text-left transition-all hover:border-border hover:bg-card/80 hover:shadow-md active:scale-[0.98] hover:cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`rounded-lg ${card.color} p-2 text-white transition-transform group-hover:scale-110`}>
                                    {card.icon}
                                </div>
                                <Typography variant="h3" className="text-xl font-semibold">
                                    {isAuthenticated ? card.titleAuthenticated : card.title}
                                </Typography>
                            </div>
                            <p className="text-sm text-muted-foreground pl-[52px]">
                                {card.description}
                            </p>
                        </button>
                    ))}
                </div>

                {isAuthenticated ? (
                    <div className="flex justify-center py-2">
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            className="w-full"
                        >
                            <LogOut className="mr-2 size-4"/>
                            Se déconnecter
                        </Button>
                    </div>
                ) : (
                    <div className="flex justify-center py-2">
                        <Button
                            className="flex-1 bg-[#003366] hover:bg-[#003366]/90 text-white"
                            onClick={handleLogin}
                        >
                            Se connecter
                            <img
                                src="/images/ng_logo.svg"
                                alt="NationsGlory"
                                className="ml-2 size-4"
                                width={16}
                                height={16}
                            />
                        </Button>
                    </div>
                )}

                <div className="text-center pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                        © 2025 Yoxo - Tous droits réservés
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
