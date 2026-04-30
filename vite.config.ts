import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` defaults to `./` so the build works at any GitHub Pages path.
// For project pages with a fixed repo name set VITE_BASE=/repo-name/.
// The included GitHub Actions workflow does this automatically.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? './',
})
