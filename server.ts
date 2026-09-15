import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { handleAiChat, handleRfxDraftGeneration, handleIssueRca } from './src/server/gemini.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gemini Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, enableHighThinking } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    const reply = await handleAiChat(messages, Boolean(enableHighThinking));
    res.json({ text: reply });
  } catch (err: any) {
    console.error('API Error in /api/gemini/chat:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// Gemini RFx Proposal Generator Endpoint
app.post('/api/gemini/rfx-generate', async (req, res) => {
  try {
    const { co, type, scope, val, industry, entityType } = req.body;
    if (!co || !type) {
      return res.status(400).json({ error: 'Client company and RFx type are required' });
    }
    const draft = await handleRfxDraftGeneration({ co, type, scope, val, industry, entityType });
    res.json({ text: draft });
  } catch (err: any) {
    console.error('API Error in /api/gemini/rfx-generate:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// Gemini Issue RCA Endpoint
app.post('/api/gemini/issue-rca', async (req, res) => {
  try {
    const { id, t, co, sev, cat, age, sla } = req.body;
    if (!t || !co) {
      return res.status(400).json({ error: 'Issue description and client are required' });
    }
    const rca = await handleIssueRca({ id: id || 'ISS-GEN', t, co, sev: sev || 'Medium', cat: cat || 'General', age: age || 1, sla: sla || 'Active' });
    res.json({ text: rca });
  } catch (err: any) {
    console.error('API Error in /api/gemini/issue-rca:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// Static assets in production
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Trivium PLSE server listening on http://0.0.0.0:${PORT}`);
});
