import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 8000,
    cors: true
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      VITE_API_URL: JSON.stringify(process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://magic.tobenot.top')
    }
  }
}) 