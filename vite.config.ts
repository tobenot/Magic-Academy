import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 8000,
    cors: true
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    }
  },
  envDir: './env'
}) 