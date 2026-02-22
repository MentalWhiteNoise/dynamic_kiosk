import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Process JSX in both .js and .jsx files (project uses .js for App.js, index.js)
      include: '**/*.{js,jsx}'
    })
  ],
  esbuild: {
    // Tell Vite's esbuild to treat .js and .jsx files in src/ as JSX before import analysis runs
    include: /src\/.*\.jsx?$/,
    loader: 'jsx',
    exclude: []
  },
  optimizeDeps: {
    // Also tell the dep pre-scanner's esbuild to treat .js as JSX
    esbuildOptions: {
      loader: { '.js': 'jsx' }
    }
  },
  build: {
    outDir: 'build' // Match CRA output dir so server.js and Pi deployment are unchanged
  },
  server: {
    port: 3000 // Match CRA's default port
  }
})
