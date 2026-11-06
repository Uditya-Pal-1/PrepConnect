import ContactMessage from '../models/ContactMessage.js';
import nodemailer from 'nodemailer';

export const createContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (![name, email, subject, message].every((value) => typeof value === 'string' && value.trim())) {
            return res.status(400).json({ message: 'Name, email, subject, and message are required' });
        }
        const saved = await ContactMessage.create({ name, email, subject, message });
        if (process.env.SMTP_HOST && process.env.SUPPORT_EMAIL) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT || 587),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
                });
                await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: process.env.SUPPORT_EMAIL, replyTo: email, subject: `[SkillBridge] ${subject}`, text: `From: ${name} <${email}>\n\n${message}` });
            } catch (mailError) { console.error('Contact notification email failed:', mailError.message); }
        }
        res.status(201).json({ message: 'Thanks for reaching out. Your message has been received.', id: saved._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not send your message right now' });
    }
};
