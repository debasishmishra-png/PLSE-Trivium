import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/gemini/chat') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { handleAiChat } = await import('./src/server/gemini.ts');
              const { messages, enableHighThinking } = JSON.parse(body || '{}');
              const reply = await handleAiChat(messages, Boolean(enableHighThinking));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: reply }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'AI chat failed' }));
            }
          });
          return;
        }

        if (req.url?.startsWith('/api/gemini/rfx-generate') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { handleRfxDraftGeneration } = await import('./src/server/gemini.ts');
              const data = JSON.parse(body || '{}');
              const draft = await handleRfxDraftGeneration(data);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: draft }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'RFx draft generation failed' }));
            }
          });
          return;
        }

        if (req.url?.startsWith('/api/gemini/issue-rca') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { handleIssueRca } = await import('./src/server/gemini.ts');
              const data = JSON.parse(body || '{}');
              const rca = await handleIssueRca(data);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: rca }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Issue RCA failed' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
