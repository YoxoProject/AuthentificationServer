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
    logLevel: env.mode === 'production' ? 'info' : 'info',
    css: {
        postcss: {}
    },
    build: {
        reportCompressedSize: false,
        rollupOptions: {
            output: {
                manualChunks: undefined,
            }
        }
    },
});

export default overrideVaadinConfig(customConfig);