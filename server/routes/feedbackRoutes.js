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

    const isBinaryMessage = typeof message === 'string' && /^[01\s]+$/.test(message.trim());
    if (!isBinaryMessage) {
      return res.status(400).json({ error: 'Submission blocked' });
    }

    const toAddress = process.env.FEEDBACK_TO || 'hargunmadan9034@gmail.com';

    if (!mailTransporter) {
      return res.status(500).json({ error: 'Mail transport is not configured' });
    }

    await mailTransporter.sendMail({
      from: process.env.MAIL_USER,
      to: toAddress,
      subject: `DebugQuest Feedback - ${teamName}`,
      text: [
        `Team Name: ${teamName}`,
        `Phone Counter: ${phoneCounter}`,
        `Email: ${email}`,
        `DOB: ${dob}`,
        `Favorite Bug: ${favoriteBug || 'N/A'}`,
        `Severity: ${severity || 'N/A'}`,
        `Message: ${message || 'N/A'}`,
      ].join('\n'),
      attachments: [
        {
          filename: `team-stats-${Date.now()}.txt`,
          content: [
            `Team Name: ${stats?.teamName || teamName}`,
            `Display Name: ${stats?.displayName || 'N/A'}`,
            `Time Taken (ms): ${stats?.timeTakenMs ?? 'N/A'}`,
            `Hints Taken: ${stats?.hintsTaken ?? 'N/A'}`,
            `Bugs Found: ${stats?.bugsFound ?? 'N/A'}`,
            `Current Level: ${stats?.currentLevel ?? 'N/A'}`,
          ].join('\n'),
        },
      ],
    });

    return res.json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Feedback send error:', error);
    return res.status(500).json({ error: 'Submission blocked' });
  }
});

export default router;