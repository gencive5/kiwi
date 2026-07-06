import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { transformWithEsbuild } from 'vite'
import restart from 'vite-plugin-restart'

export default defineConfig({
    root: 'src/',
    publicDir: '../public/',
    plugins: [
        // Restart server on static/public file change
        restart({ restart: [ '../public/**', ] }),

        // React support
        react(),

        // .js file support as if it was JSX
        {
            name: 'load+transform-js-files-as-jsx',
            async transform(code, id) {
                if (!id.match(/src\/.*\.js$/))
                    return null

                return transformWithEsbuild(code, id, {
                    loader: 'jsx',
                    jsx: 'automatic',
                });
            },
        },
    ],
    server: {
        host: '0.0.0.0', // Match the working config
        port: 3000, // Add explicit port
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env),
        hmr: {
            overlay: true, // Shows error overlays
            protocol: 'ws', // WebSocket protocol
            host: '172.17.172.108', // Use your IP or 'localhost'
            port: 3000,
        },
        watch: {
            usePolling: true, // Helps with some file systems
            interval: 1000, // Polling interval
        },
    },
    build: {
        outDir: '../dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: true // Add sourcemap
    },
    optimizeDeps: {
        include: ['react', 'react-dom'], // Ensure these are optimized
    },
})