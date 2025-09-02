import {Typography} from "@/components/ui/typography";
import {ThemeToggle} from "@/components/theme/ThemeToggle";
import React from "react";

export default function AuthLayout({children}: { children: React.ReactNode }) {

    return (
        <div className="grid min-h-screen grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <aside
                className="col-span-1 flex w-full flex-col gap-4 border border-border p-4 backdrop-blur-[2px] md:p-8 xl:col-span-2">
                <div className="flex justify-start">
                    <a href="/" className="flex items-center gap-2">
                        <img src="/images/yoxo_logo_128x128.png" width={50} height={35} alt="Yoxo"
                             className={"rounded"}/>
                        <Typography variant="h3">
                            Yoxo
                        </Typography>
                    </a>
                </div>
                <div
                    className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 text-center md:mx-0 md:text-left">
                    <div className="mx-auto grid gap-3">
                        <h1 className="text-3xl font-semibold text-foreground">
                            Yoxo
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Yoxo est une collection de système ayant pour but d'améliorer son gameplay sur le serveur
                            Minecraft NationsGlory
                        </p>
                    </div>
                </div>
                <div className="md:h-8"/>
            </aside>
            <main className="container col-span-1 mx-auto flex items-center justify-center md:col-span-1 xl:col-span-3">
                {children}
            </main>
            <div className="absolute right-4 top-4 md:right-8 md:top-8"><ThemeToggle/></div>
        </div>
    );
}