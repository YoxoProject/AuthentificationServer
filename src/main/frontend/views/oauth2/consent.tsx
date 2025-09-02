import AuthLayout from "@/layout/AuthLayout";
import {ConsentController} from "@/generated/endpoints";
import React, {useEffect, useState} from "react";
import ConsentData from "@/generated/fr/romaindu35/authserver/auth/controller/ConsentController/ConsentData";
import {Typography} from "@/components/ui/typography";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";

export default function OAuth2Consent() {


    return (
        <AuthLayout>
            <div
                className="mx-4 grid w-full max-w-xl gap-6 rounded-lg border border-border px-3 py-4 backdrop-blur-[2px] md:p-10">
                <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">Autorisation requise</h1>
                    <ConsentForm/>
                </div>
            </div>
        </AuthLayout>
    )
}

function ConsentForm() {
    const [data, setData] = useState<ConsentData | undefined>(undefined);
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("client_id")!;
    const scope = params.get("scope")!;
    const state = params.get("state")!;

    useEffect(() => {
        ConsentController.getConsentData(clientId, scope).then((response) => {
            setData(response);
        });
    }, [clientId, scope])

    if (!data) return null;

    return (
        <form method="post" action="/oauth2/authorize" className="flex flex-col text-left gap-2">
            <Typography>L'application <span className="font-medium">{data.clientName}</span> maintenue par <span
                className="font-medium">{data.clientOwner}</span> souhaite avoir les autorisations suivantes sur votre
                compte <span className="font-medium">{data.username}</span></Typography>

            <input type="hidden" name="client_id" value={clientId}/>
            <input type="hidden" name="state" value={state}/>

            <div className="flex flex-col gap-2">
                {
                    data.permissions.map((permission) => (
                        <div key={permission?.scopeName} className="flex gap-2 items-center">
                            <input type="hidden" name="scope" value={permission?.scopeName}/>
                            <Checkbox checked disabled/>
                            <Typography>{permission?.description}</Typography>
                        </div>
                    ))
                }
            </div>

            <Typography variant="muted">
                {data.clientName} ne fait pas parti de Yoxo, c'est pourquoi vous voyez cet écran. Toutes les
                autorisations peuvent être révoquées depuis {" "}
                <a target="_blank"
                   href="https://auth.yoxo.software/"
                   className="underline underline-offset-4 hover:text-primary hover:no-underline">votre compte</a>
            </Typography>

            <div className="grid grid-cols-2 gap-2 justify-between">
                <Button type="button" variant="secondary" onClick={() => {
                    document.querySelectorAll<HTMLInputElement>('input[name="scope"]').forEach(input => input.remove());
                    document.forms[0].submit();
                }}>
                    Cancel
                </Button>
                <Button type="submit" className="btn btn-primary btn-lg">
                    Autoriser
                </Button>
            </div>
        </form>
    )
}