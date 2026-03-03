import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'c9dd0b8bf1c5.ngrok-free.app',
      // Add your specific host here
      // 'your-domain.com',
      // '192.168.1.100',
      // 'subdomain.your-domain.com',
    ]
  }
})