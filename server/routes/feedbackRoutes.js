import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// CTF CHALLENGE: Students should implement their own email sending logic using Nodemailer or similar.
const mailTransporter = null;

router.post('/send', async (req, res) => {
  try {
    const {
      teamName,
      phoneCounter,
      email,
      dob,
      favoriteBug,
      severity,
      message,
      stats,
    } = req.body;

    if (!teamName || !email || !dob) {
      return res.status(400).json({ error: 'Submission blocked' });
    }

    const isBinaryMessage = typeof message === 'string' && /^[01\s]+$/.test(message.trim());
    if (!isBinaryMessage) {
      return res.status(400).json({ error: 'Submission blocked' });
    }

    const toAddress = process.env.FEEDBACK_TO || 'hargunmadan9034@gmail.com';

    if (!mailTransporter) {
      // TODO: Implement email sending logic here!
      // return res.status(500).json({ error: 'Mail transport is not configured' });
      console.log('Submission received:', { email, teamName, message, stats });
      console.log('CTF: Students must implement email dispatch to get points here.');
    } else {
       // Send mail logic here
    }

    return res.json({ message: 'Feedback sent successfully (simulated)' });
  } catch (error) {
    console.error('Feedback send error:', error);
    return res.status(500).json({ error: 'Submission blocked' });
  }
});

export default router;