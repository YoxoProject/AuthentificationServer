import AuthLayout from "@/layout/AuthLayout";
import {Button} from "@/components/ui/button";
import {Typography} from "@/components/ui/typography";

import '@/styles/index.css'; /* Permet d'importer les styles globaux + Tailwind CSS */

export default function Home() {
    return (
        <AuthLayout>
            <div className="mx-4 grid w-full max-w-2xl gap-4 rounded-lg border border-border px-4 py-6 backdrop-blur-[2px] md:px-8 md:py-8">
                <div className="flex flex-col gap-3 text-center">
                    <div className="mx-auto mb-2">
                        <img
                            src="/images/yoxo_logo_128x128.png"
                            alt="Yoxo"
                            className="mx-auto h-20 w-20 rounded-lg"
                        />
                    </div>
                    <Typography variant="h1" className="lg:text-4xl text-3xl font-bold tracking-tight">
                        Serveur d'Authentification Yoxo
                    </Typography>
                    <p className="text-base text-muted-foreground max-w-lg mx-auto">
                        Bienvenue sur le serveur d'authentification OAuth2 de Yoxo.
                        Connectez-vous de manière sécurisée à tous les services Yoxo.
                    </p>
                </div>

                <div className="grid gap-4">
                    <div className="grid gap-1 rounded-lg border border-border/50 bg-card/50 p-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <Typography variant="h3" className="text-xl font-semibold">
                                Authentification Sécurisée
                            </Typography>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Utilise le protocole OAuth2/OIDC pour une authentification sécurisée
                            avec NationsGlory comme fournisseur d'identité.
                        </p>
                    </div>


                    <div className="grid gap-1 rounded-lg border border-border/50 bg-card/50 p-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            <Typography variant="h3" className="text-xl font-semibold">
                                Tokens JWT
                            </Typography>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Authentification sécurisée sans requête supplémentaire avec
                            contrôle des permissions et des accès.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                        className="flex-1 bg-[#003366] hover:bg-[#003366]/90"
                        onClick={() => window.location.href = '/login'}
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
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open('https://datatracker.ietf.org/doc/html/rfc6749', '_blank')}
                    >
                        Documentation OAuth2
                    </Button>
                </div>

                <div className="text-center pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                        © 2025 Yoxo - Tous droits réservés
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}