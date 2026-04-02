import express from 'express';
import { findUserByVisitorId, updateUser } from '../store/memoryStore.js';

const router = express.Router();

// Hints data - misleading comments throughout
const hintsData = {
  1: [
    { id: 'l1-h1', text: 'The OTP button might be a distraction. Look for alternative ways to proceed.', cost: 1 },
    { id: 'l1-h2', text: 'Sometimes the username field holds secrets...', cost: 1 },
    { id: 'l1-h3', text: 'Try typing "skip" as your username.', cost: 1 },
  ],
  2: [
    { id: 'l2-h1', text: 'The loading screen might have a hidden escape route.', cost: 1 },
    { id: 'l2-h2', text: 'There is a keyboard shortcut if you react quickly.', cost: 1 },
    { id: 'l2-h3', text: 'Try pressing "S" key twice quickly.', cost: 1 },
  ],
  3: [
    { id: 'l3-h1', text: 'The toggle might need a different approach than clicking.', cost: 1 },
    { id: 'l3-h2', text: 'Try double-clicking or right-clicking elements.', cost: 1 },
    { id: 'l3-h3', text: 'The chat system responds to "debug mode" command.', cost: 1 },
  ],
  4: [
    { id: 'l4-h1', text: 'Some controls change behavior with alternate interactions on labels.', cost: 1 },
    { id: 'l4-h2', text: 'Date, phone, and email rules are not aligned by default.', cost: 1 },
    { id: 'l4-h3', text: 'When the form stabilizes, submission and mail both succeed.', cost: 1 },
  ],
  5: [
    { id: 'l5-h1', text: 'Phone numbers have an unusual behavior here.', cost: 1 },
    { id: 'l5-h2', text: 'Email validation has a case-sensitivity issue.', cost: 1 },
    { id: 'l5-h3', text: 'Delete characters one by one in phone, use all lowercase email.', cost: 1 },
  ],
};

// Get available hints for a level
router.get('/:visitorId/level/:level', (req, res) => {
  try {
    const { visitorId, level } = req.params;
    const user = findUserByVisitorId(visitorId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const levelHints = hintsData[level] || [];
    const usedHintIds = user.hintsUsed
      .filter(h => h.level === parseInt(level))
      .map(h => h.hintId);
    
    const availableHints = levelHints.map(hint => ({
      id: hint.id,
      cost: hint.cost,
      isUsed: usedHintIds.includes(hint.id),
      text: usedHintIds.includes(hint.id) ? hint.text : null,
    }));
    
    res.json({
      hints: availableHints,
      hintsRemaining: user.hintsRemaining,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hints' });
  }
});

// Use a hint
router.post('/:visitorId/use', (req, res) => {
  try {
    const { visitorId } = req.params;
    const { level, hintId } = req.body;
    
    const user = findUserByVisitorId(visitorId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.hintsRemaining <= 0) {
      return res.status(400).json({ error: 'No hints remaining' });
    }
    
    // Check if hint already used
    const alreadyUsed = user.hintsUsed.some(
      h => h.level === level && h.hintId === hintId
    );
    
    if (alreadyUsed) {
      return res.status(400).json({ error: 'Hint already used' });
    }
    
    // Get hint text
    const hint = hintsData[level]?.find(h => h.id === hintId);
    
    if (!hint) {
      return res.status(404).json({ error: 'Hint not found' });
    }
    
    // Update user
    const hintsUsed = [...user.hintsUsed, { level, hintId, usedAt: new Date() }];
    updateUser(visitorId, {
      hintsRemaining: user.hintsRemaining - hint.cost,
      hintsUsed,
    });
    
    res.json({
      hintText: hint.text,
      hintsRemaining: user.hintsRemaining - hint.cost,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to use hint' });
  }
});

export default router;
