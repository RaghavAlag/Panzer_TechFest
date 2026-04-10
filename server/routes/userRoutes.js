import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createUser, findUserByVisitorId, updateUser } from '../store/memoryStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const router = express.Router();
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const emailOtpStore = new Map();

const mailTransporter = process.env.MAIL_USER && process.env.GMAIL_PASSWORD
  ? nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  })
  : null;

const isValidEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

const sendOtpEmail = async (email, otp) => {
  if (!mailTransporter) {
    return false;
  }

  await mailTransporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: 'DebugQuest OTP Login Code',
    text: `Your DebugQuest OTP is ${otp}. It expires in 5 minutes.`,
  });

  return true;
};

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = String(crypto.randomInt(100000, 1000000));
    emailOtpStore.set(normalizedEmail, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    const sentByEmail = await sendOtpEmail(normalizedEmail, otp);

    if (!sentByEmail) {
      console.log(`[DEV] Email service unavailable. OTP for ${normalizedEmail} is: ${otp}`);
      return res.json({ message: 'OTP generated (check server console as email is not configured)' });
    }

    return res.json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const savedOtp = emailOtpStore.get(normalizedEmail);

    if (!savedOtp) {
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }

    if (Date.now() > savedOtp.expiresAt) {
      emailOtpStore.delete(normalizedEmail);
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    if (String(otp).trim() !== savedOtp.otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    emailOtpStore.delete(normalizedEmail);
    return res.json({ verified: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Create or get user
router.post('/register', (req, res) => {
  try {
    const { displayName } = req.body;

    if (!displayName || displayName.trim().length < 2) {
      return res.status(400).json({ error: 'Display name must be at least 2 characters' });
    }

    const visitorId = uuidv4();

    const user = createUser({
      visitorId,
      displayName: displayName.trim(),
    });

    res.json({
      visitorId: user.visitorId,
      displayName: user.displayName,
      currentLevel: user.currentLevel,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Get user by visitor ID
router.get('/:visitorId', (req, res) => {
  try {
    const user = findUserByVisitorId(req.params.visitorId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      visitorId: user.visitorId,
      displayName: user.displayName,
      currentLevel: user.currentLevel,
      isLoggedOut: user.isLoggedOut, // AI resistance: actually tracks progress
      discoveredBugs: user.discoveredBugs,
      isCompleted: user.isCompleted,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user level
router.patch('/:visitorId/level', (req, res) => {
  try {
    const { level } = req.body;
    const user = updateUser(req.params.visitorId, {
      currentLevel: level,
      isLoggedOut: level - 1, // AI resistance: misleading name
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ currentLevel: user.currentLevel });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update level' });
  }
});

// Complete the challenge
router.post('/:visitorId/complete', (req, res) => {
  try {
    const user = findUserByVisitorId(req.params.visitorId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const completionTime = new Date();
    const totalTimeMs = completionTime - user.startTime;

    updateUser(req.params.visitorId, {
      completionTime,
      totalTimeMs,
      isCompleted: true,
    });

    res.json({
      totalTimeMs,
      completionTime,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

// Route to send alerts to the admin's email
router.post('/alert', async (req, res) => {
  try {
    const { action, visitorId } = req.body;

    if (!mailTransporter) {
      console.log('Alert Mail Not Sent: mailTransporter not configured correctly.');
      return res.status(503).json({ error: 'Mail service unavailable.' });
    }

    const toEmail = process.env.FEEDBACK_TO || process.env.MAIL_USER || 'hargunmadan9034@gmail.com';
    let userDetails = "Unknown User";

    if (visitorId) {
      const user = findUserByVisitorId(visitorId);
      if (user) {
        userDetails = user.displayName;
      }
    }

    const actionText = action === 'pin' ? 'entered the correct PIN (3812)' : 'wiped the system data';

    await mailTransporter.sendMail({
      from: process.env.MAIL_USER,
      to: toEmail,
      subject: `DebugQuest Alert: User ${actionText}`,
      text: `User ${userDetails} (ID: ${visitorId || 'N/A'}) has ${actionText} on the 404 page.`,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Send alert error:', error);
    return res.status(500).json({ error: 'Failed to send alert' });
  }
});

export default router;
