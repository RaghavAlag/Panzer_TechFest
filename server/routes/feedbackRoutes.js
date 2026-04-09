import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

const mailTransporter = process.env.MAIL_USER && process.env.GMAIL_PASSWORD
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    })
  : null;

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

    // Binary message validation (CTF Challenge)
    const isBinaryMessage = typeof message === 'string' && /^[01\s]+$/.test(message.trim());
    if (!isBinaryMessage) {
      return res.status(400).json({ error: 'Submission blocked' });
    }

    const toAddress = process.env.FEEDBACK_TO || 'hargunmadan9034@gmail.com';

    if (!mailTransporter) {
      console.log('Submission received:', { email, teamName, message, stats });
      console.log('Mail transport is not configured');
    } else {
      const mailContent = `
Feedback Received:

Team Name: ${teamName}
Email: ${email}
Phone Counter: ${phoneCounter}
DOB: ${dob}
Favorite Bug: ${favoriteBug}
Severity: ${severity}

Message (Bugs solved and how):
${message}
      `;
      await mailTransporter.sendMail({
        from: process.env.MAIL_USER,
        to: toAddress,
        subject: 'DebugQuest Context Feedback Submission',
        text: mailContent,
      });
    }

    return res.json({ message: 'Feedback sent successfully (simulated)' });
  } catch (error) {
    console.error('Feedback send error:', error);
    return res.status(500).json({ error: 'Submission blocked' });
  }
});

export default router;