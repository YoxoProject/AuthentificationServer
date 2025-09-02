import AuthLayout from "@/layout/AuthLayout";
import {Button} from "@/components/ui/button";
import {LoginController} from "@/generated/endpoints";

export default function Login() {

    return (
        <AuthLayout>
            <div
                className="mx-4 grid w-full max-w-xl gap-6 rounded-lg border border-border px-3 py-4 backdrop-blur-[2px] md:p-10">
                <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">Connexion</h1>
                    <p className="text-sm text-muted-foreground">
                        La connexion à Yoxo se fait via NationsGlory. Ce processus est complètement sécurisé pour vous.
                        Nous
                        avons uniquement accès à votre nom d'utilisateur.
                        {"  "}
                        <a
                            target="_blank"
                            href="https://nationsglory.readme.io/reference/discover"
                            className="underline underline-offset-4 hover:text-primary hover:no-underline"
                        >
                            En savoir plus
                        </a>
                    </p>
                </div>
                <div className="grid gap-3">
                    <div className="text-sm text-destructive">
                        <p>A l'heure actuelle, <span className="font-bold">un bug</span> impacte l'oauth. Dans l'attente
                            d'un fix de la part de NationsGlory, voici la démarche à suivre pour vous connecter</p>
                        <ul className="list-disc ml-5">
                            <li><span className="font-bold">Cliquer sur le bouton</span> ci-dessous et <span
                                className="font-bold">entrer vos identifiants</span> NationsGlory
                            </li>
                            <li><span className="font-bold">Revenez en arrière</span> (sur cette page) puis <span
                                className="font-bold">recliquez sur le bouton</span> ci-dessous
                            </li>
                            <li>Vous êtes connecté !</li>
                        </ul>
                    </div>
                    <Button type="submit" className="w-full bg-[#003366] hover:bg-[#003366]/90"
                            onClick={() => LoginController.getRedirectURLToNationsGloryOAuth().then((redirect) => {
                                if (redirect) window.location.href = redirect;
                            })}>
                        Se connecter avec NationsGlory <img src="/images/ng_logo.svg" alt={"NationsGlory"}
                                                            className={"ml-2 size-4"} width={20} height={20}/>
                    </Button>
                </div>
                <p className="px-8 text-center text-sm text-muted-foreground">
                    En vous connectant, vous acceptez nos{" "}
                    <a
                        href="/legacy/cgu"
                        className="mr-0.5 underline underline-offset-4 hover:text-primary hover:no-underline"
                    >
                        conditions générales d'utilisation
                    </a>.
                </p>
            </div>
        </AuthLayout>
    );
}