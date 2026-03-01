const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// Serve static files (production mode)
app.use(express.static(path.join(__dirname), {
    extensions: ['html'],
    index: 'index.html'
}));

// Simple in-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // max 5 emails per window per IP

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { windowStart: now, count: 1 });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return false;
    }

    entry.count++;
    return true;
}

// Clean up rate limit map periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
        if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
            rateLimitMap.delete(ip);
        }
    }
}, 60 * 1000);

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sanitize input
function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
}

// Create Nodemailer transporter
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        // Rate limiting
        const clientIP = req.ip || req.connection.remoteAddress;
        if (!checkRateLimit(clientIP)) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.'
            });
        }

        // Honeypot check
        if (req.body.website) {
            // Bot detected, silently succeed
            return res.json({ success: true, message: 'Message sent successfully.' });
        }

        const name = sanitize(req.body.name);
        const email = sanitize(req.body.email);
        const message = sanitize(req.body.message);

        // Validation
        if (!name || name.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Name must be at least 2 characters.'
            });
        }

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        if (!message || message.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Message must be at least 10 characters.'
            });
        }

        // Check email configuration
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASS in .env');
            return res.status(500).json({
                success: false,
                message: 'Server email configuration error. Please try again later.'
            });
        }

        const transporter = createTransporter();
        const recipient = process.env.EMAIL_TO || 'cronereal@gmail.com';

        // Send email
        await transporter.sendMail({
            from: `"Harpa Gaming Contact" <${process.env.EMAIL_USER}>`,
            to: recipient,
            replyTo: email,
            subject: `[Harpa Gaming] New message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #fff; padding: 40px; border: 1px solid #222;">
                    <div style="border-bottom: 2px solid #D1FF19; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="margin: 0; font-size: 18px; letter-spacing: 0.2em; color: #D1FF19;">HARPA GAMING</h1>
                        <p style="margin: 8px 0 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.15em;">New Contact Form Submission</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 12px 0; color: #D1FF19; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top; width: 80px;">Name</td>
                            <td style="padding: 12px 0; color: #fff;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #D1FF19; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">Email</td>
                            <td style="padding: 12px 0; color: #fff;"><a href="mailto:${email}" style="color: #D1FF19;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #D1FF19; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">Message</td>
                            <td style="padding: 12px 0; color: #ccc; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #222; font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 0.1em;">
                        Sent from Harpa Gaming Website Contact Form
                    </div>
                </div>
            `
        });

        console.log(`Contact email sent from ${email}`);
        res.json({ success: true, message: 'Message sent successfully. We will get back to you soon.' });

    } catch (error) {
        console.error('Email send error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later or email us directly.'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Harpa Gaming server running on http://localhost:${PORT}`);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠ Email credentials not configured. Copy .env.example to .env and add your credentials.');
    }
});
