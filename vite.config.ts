import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from './src/knowledgeBase';

dotenv.config();

function geminiDevApiPlugin(): Plugin {
  return {
    name: 'gemini-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const parsed = JSON.parse(body || '{}');
            const userMsg = parsed.message;

            if (!userMsg) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Message is required' }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const response = await ai.models.generateContent({
              model: 'gemini-3.7-flash',
              contents: userMsg,
              config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.2,
              },
            });

            const reply = response.text || "Thank you for reaching out to Gold Coast Vet Surgery. For assistance, please call (07) 5538 5909.";
            res.statusCode = 200;
            res.end(JSON.stringify({ reply }));
          } catch (err: any) {
            console.error('Error in dev /api/chat middleware:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiDevApiPlugin()],
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
