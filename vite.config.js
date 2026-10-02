import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind mounts do Docker Desktop (Windows -> Linux) não repassam eventos
    // de arquivo de forma confiável para o chokidar — sem polling, o Vite
    // dentro do container nunca percebe alterações feitas no host.
    watch: {
      usePolling: true,
      interval: 300
    }
  }
});
