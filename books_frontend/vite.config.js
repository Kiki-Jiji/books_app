import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Add this line here

export default defineConfig({
    plugins: [react()], // Don't forget to keep your react plugin active!
    server: {
        host: "0.0.0.0",
        port: 5173,
    },
    resolve: {
        alias: {
            // This is a common use for path, in case you need it later:
            '@': path.resolve(__dirname, './src'),
        },
    },
    cacheDir: path.resolve(__dirname, 'node_modules/.vite'), 
});