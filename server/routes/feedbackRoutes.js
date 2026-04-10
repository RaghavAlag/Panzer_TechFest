import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// CTF CHALLENGE: Students should implement their own email sending logic using Nodemailer or similar.
const mailTransporter = process.env.MAIL_USER && process.env.GMAIL_PASSWORD
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    })
  : null;

const toAddress = process.env.FEEDBACK_TO || 'hargunmadan9034@gmail.com';

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


    if (!mailTransporter) {
      console.error('Mail transport is not configured');
      return res.status(500).json({ error: 'Mail transport is not configured' });
    }

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: toAddress,
      subject: `DebugQuest feedback from ${teamName}`,
      text: `Feedback submitted by ${teamName}\nEmail: ${email}\nDOB: ${dob}\nFavorite Bug: ${favoriteBug}\nSeverity: ${severity}\nPhone Counter: ${phoneCounter}\nStats: ${JSON.stringify(stats)}\n\nMessage:\n${message}`,
    };

    await mailTransporter.sendMail(mailOptions);

    return res.json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Feedback send error:', error);
    return res.status(500).json({ error: 'Submission blocked' });
  }
});

export default router;