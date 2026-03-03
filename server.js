require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

// 1. Secure Firebase Admin Initialization
// Uses Env variables in production (Render), falls back to local JSON file
try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newline characters from Env Variables
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
    } else {
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (error) {
    console.error("Firebase Admin initialization error. Ensure credentials are set.");
    if (process.env.NODE_ENV !== 'production') console.error(error);
}

const db = admin.firestore();
const app = express();

// ==========================================
// 2. SECURITY & PERFORMANCE MIDDLEWARES
// ==========================================

// Enable Trust Proxy if behind a reverse proxy (e.g., Render, Heroku, Nginx)
app.set('trust proxy', 1);

// Helmet: Secures app by setting various HTTP headers (XSS Filter, HSTS, NoSniff)
app.use(helmet());

// Compression: Compress response bodies for performance
app.use(compression());

// Logger: Basic request monitoring
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS: Restrict origins to only your domains in production
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com', 'https://www.your-frontend-domain.com']
    : ['http://localhost:8000', 'http://127.0.0.1:8000', '*']; // allow all locally

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// Body Parser: Limit payload size to prevent DOS attacks (Must be before routes!)
app.use(express.json({ limit: '10kb' }));

// Serve static frontend files (HTML, CSS, JS) from the current directory
// This allows a single Render Web Service to host both frontend + backend!
const path = require('path');
app.use(express.static(__dirname));

// Rate Limiter: Prevent Spam / Brute Force on Registration
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Too many registrations created from this IP, please try again." }
});

// ==========================================
// 3. SECURE API ROUTE
// ==========================================

const validCompetitions = ['hackfest', 'prompt', 'poster', 'esports'];

app.post('/api/register',
    registerLimiter, // Apply rate limiting to this route
    [
        // Input Sanitization & Strict Validation using express-validator
        body('name').trim().matches(/^[a-zA-Z\s]{3,50}$/).withMessage('Invalid name format.').escape(),
        body('email').trim().isEmail().withMessage('Invalid email format.').normalizeEmail(),
        body('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number.'),
        body('college').trim().isLength({ min: 2, max: 100 }).withMessage('Invalid college name.').escape(),
        body('competition').isIn(validCompetitions).withMessage('Invalid competition selected.'),
        body('transactionId').trim().matches(/^[a-zA-Z0-9]{5,30}$/).withMessage('Invalid transaction ID format.').escape()
    ],
    async (req, res) => {
        // 1. Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        try {
            const { name, email, phone, college, competition, transactionId } = req.body;

            // Determine which collection to use based on the selected competition
            let collectionName = '';
            switch (competition) {
                case 'hackfest': collectionName = 'hackfest_registrations'; break;
                case 'prompt': collectionName = 'prompt_nova_registrations'; break;
                case 'poster': collectionName = 'posterpanorama_registrations'; break;
                case 'esports': collectionName = 'esports_registrations'; break;
                default: return res.status(400).json({ error: 'Invalid competition selected.' });
            }

            const registrationsRef = db.collection(collectionName);

            // 2. Prevent Duplicate Registration by Email OR Phone (Inside the selected collection)

            // Check Email
            const emailSnapshot = await registrationsRef.where('email', '==', email).get();
            if (!emailSnapshot.empty) {
                return res.status(409).json({ error: `This email is already registered for ${competition}.` });
            }

            // Check Phone
            const phoneSnapshot = await registrationsRef.where('phone', '==', phone).get();
            if (!phoneSnapshot.empty) {
                return res.status(409).json({ error: `This phone number is already registered for ${competition}.` });
            }

            // 3. Store Securely
            const newDoc = {
                name,
                email,
                phone,
                college,
                competition,
                transactionId,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await registrationsRef.add(newDoc);

            return res.status(201).json({ message: 'Registration successful!' });

        } catch (error) {
            // Log full error internally, but hide details from user
            console.error('Registration Error:', error);
            return res.status(500).json({ error: 'Internal Server Error. Please contact admin.' });
        }
    }
);

// 4. Global Error Handler (Hides Stack Traces in Production)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went terribly wrong!",
        ...(process.env.NODE_ENV !== 'production' && { trace: err.message })
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Secure API running on port ${PORT}`);
});
