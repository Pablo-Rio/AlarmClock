// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    base: process.env.VITE_BASE_URL || '/',
});
