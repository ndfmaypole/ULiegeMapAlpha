import { defineConfig } from 'vite';
import { resolve, extname, basename } from 'path';
import { readdirSync } from 'fs';

function getAllHtml() {
    const root = resolve(__dirname, '');
    const files = readdirSync(root);
    const entries = {};

    files.forEach((file) => {
    if (extname(file) === '.html') {
        const name = basename(file, '.html');
        entries[name] = resolve(root, file);
    }
    });

    return entries;
}

export default defineConfig({
    base: '/ULiegeMapAlpha/',
    optimizeDeps: {
        include: ['maplibre-gl']
    },
    build: {
    rollupOptions: {
        input: getAllHtml(), 
    },
    commonjsOptions: {
      include: [/maplibre-gl/, /node_modules/]
    }
    },
});
