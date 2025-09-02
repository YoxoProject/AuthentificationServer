import { UserConfigFn } from 'vite';
import { overrideVaadinConfig } from './vite.generated';
import path from "path"
import tailwindcss from "@tailwindcss/vite"

const customConfig: UserConfigFn = (env) => ({
  // Here you can add custom Vite parameters
  // https://vitejs.dev/config/
    plugins: [tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src/main/frontend"),
        },
    },
});

export default overrideVaadinConfig(customConfig);