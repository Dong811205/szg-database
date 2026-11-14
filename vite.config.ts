import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({base:'/szg-database/',plugins:[react()],build:{outDir:'dist',rollupOptions:{input:'index.source.html'}}});
