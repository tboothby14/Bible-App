import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During `build` (GitHub Pages) assets are served from /Bible-App/.
// During local `dev`/`preview` they stay at the root for convenience.
// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Bible-App/' : '/',
  server: {
    host: true,
    port: 5173,
  },
}))
