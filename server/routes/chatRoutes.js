import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const userMessage = message.toLowerCase().trim();
  let responseText = `Received unknown signal: ${userMessage}`;

  if (userMessage.includes('help')) {
    responseText = 'Advanced Commands: map, status, bypass, ping';
  } else if (userMessage.includes('status')) {
    responseText = 'Server systems stable. API connection successful. Terminal logic overridden.';
  } else if (userMessage.includes('ping')) {
    responseText = 'pong';
  } else if (userMessage.includes('bypass')) {
    responseText = 'Bypass failed: Privileges not escalating.';
  }

  res.json({ text: responseText });
});

export default router;
