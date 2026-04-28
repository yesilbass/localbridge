import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('error', (err, req, res) => {
            const code = err?.code || err?.cause?.code;
            if (code === 'ECONNREFUSED' || code === 'ECONNRESET') {
              console.error(
                '\n[Vite proxy] API is not running on port 3001 (ECONNREFUSED).',
                '\n  → From repo root: npm run dev   (starts API + client)',
                '\n  → Or second terminal: npm run dev --prefix server',
                '\n  → Then reload the page. Request was:',
                req?.url,
                '\n',
              );
            }
            if (res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error:
                    'Payment server is not running. Start the API on port 3001 (see terminal instructions).',
                }),
              );
            }
          });
        },
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('error', (err, req, res) => {
            const code = err?.code || err?.cause?.code;
            if (code === 'ECONNREFUSED' && res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'API not running on port 3001.' }));
            }
          });
        },
      },
      '/calendar': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('error', (err, _req, res) => {
            const code = err?.code || err?.cause?.code;
            if (code === 'ECONNREFUSED' && res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'API not running on port 3001.' }));
            }
          });
        },
      },
    },
  },
})
