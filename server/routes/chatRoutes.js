import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const router = express.Router();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `You are ASTRA, the AI assistant embedded inside DebugQuest — a cyberpunk hacking challenge game. 
You speak in a cool, slightly mysterious but helpful tone, like a hacker's AI companion.
You help players with hints about the challenges, coding questions, debugging tips, or general questions.
Keep answers concise and engaging. Use emojis sparingly for atmosphere. Never break character.`;

router.post('/', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured.' });
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10), // keep last 10 messages for context
      { role: 'user', content: message.trim() },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq API error:', err);
      return res.status(502).json({ error: 'AI response failed. Try again.' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Signal lost. Try again.';
    return res.json({ text: reply });
  } catch (error) {
    console.error('Chat route error:', error.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
