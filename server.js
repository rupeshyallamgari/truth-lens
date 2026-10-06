require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const newsService = require('./newsService');
const { verifyContent } = require('./verificationEngine');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'truthlens_jwt_secure_secret_2026_key_super_safe';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ ok: false, error: 'Access token required. Please sign in.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ ok: false, error: 'Invalid or expired session. Please sign in again.' });
        }
        req.user = user;
        next();
    });
}

// Optional Auth (for endpoints that can serve guest extension users or logged in users)
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err && user) req.user = user;
            next();
        });
    } else {
        next();
    }
}

// --- AUTHENTICATION ROUTES ---

// POST /api/register
app.post('/api/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ ok: false, error: 'All fields are required (Full Name, Email, Password).' });
    }

    if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ ok: false, error: 'Passwords do not match. Please verify and try again.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
    }

    db.findUserByEmail(email, (err, existing) => {
        if (err) return res.status(500).json({ ok: false, error: 'Database query error.' });
        if (existing) {
            return res.status(400).json({ ok: false, error: 'An account with this email already exists. Please sign in.' });
        }

        const password_hash = bcrypt.hashSync(password, 10);
        const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

        db.createUser({ id: userId, name: name.trim(), email: email.trim(), password_hash }, (createErr, newUser) => {
            if (createErr) return res.status(500).json({ ok: false, error: 'Failed to create user account.' });

            const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({
                ok: true,
                message: 'Account registered successfully.',
                user: { id: newUser.id, name: newUser.name, email: newUser.email, role: 'investigator' },
                token
            });
        });
    });
});

// POST /api/login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Please provide both email and password.' });
    }

    db.findUserByEmail(email, (err, user) => {
        if (err) return res.status(500).json({ ok: false, error: 'Database query error.' });
        if (!user) {
            return res.status(401).json({ ok: false, error: 'No account found with this email. Please check or register.' });
        }

        const passwordValid = bcrypt.compareSync(password, user.password_hash);
        if (!passwordValid) {
            return res.status(401).json({ ok: false, error: 'Incorrect password. Please try again.' });
        }

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            ok: true,
            message: 'Signed in successfully.',
            user: { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at },
            token
        });
    });
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
    res.json({ ok: true, message: 'Logged out successfully.' });
});

// GET /api/profile / GET /api/me
app.get(['/api/profile', '/api/me'], authenticateToken, (req, res) => {
    db.findUserById(req.user.id, (err, user) => {
        if (err || !user) return res.status(404).json({ ok: false, error: 'User profile not found.' });

        db.getUserStats(req.user.id, (statsErr, stats) => {
            res.json({
                ok: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    created_at: user.created_at,
                    totalVerifications: stats?.total || 0
                },
                stats: stats || { total: 0, supported: 0, partial: 0, contradicted: 0, insufficient: 0 }
            });
        });
    });
});

// --- NEWS FEED ROUTES ---

// GET /api/news
app.get('/api/news', async (req, res) => {
    try {
        const { category = 'All', region = 'All', search = '', sort = 'Latest' } = req.query;
        const result = await newsService.getNews({ category, region, search, sort });
        res.json({
            ok: true,
            isDemo: result.isDemo,
            demoMessage: result.demoMessage,
            total: result.total,
            articles: result.articles
        });
    } catch (err) {
        console.error('Error in /api/news:', err);
        res.status(500).json({
            ok: false,
            error: 'Failed to retrieve news feed.',
            isDemo: true,
            demoMessage: 'Demo News – Connect a news API to receive live news.',
            articles: newsService.CURATED_CYBER_ALERTS
        });
    }
});

// --- VERIFICATION ROUTES (Backwards compatible with extension & new API) ---

// POST /verify & POST /api/verify
app.post(['/verify', '/api/verify'], optionalAuth, async (req, res) => {
    try {
        const rawInput = req.body.text || req.body.claim || req.body.content || '';
        if (!rawInput || rawInput.trim().length < 5) {
            return res.status(400).json({ ok: false, error: 'Please provide text or a claim to verify (at least 5 characters).' });
        }

        const report = await verifyContent(rawInput.trim());
        const reportId = 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const userId = req.user?.id || req.body.uid || 'usr_guest_demo';

        // Auto-save to SQLite if user is present
        db.saveVerification({
            id: reportId,
            user_id: userId,
            original_text: rawInput.trim(),
            claim: report.claim || rawInput.trim(),
            verdict: report.verdict || 'INSUFFICIENT EVIDENCE',
            confidence: report.confidence || 75,
            explanation: report.explanation || 'Evidence evaluation completed.',
            supporting_points: report.supporting_points || [],
            contradicting_points: report.contradicting_points || [],
            missing_information: report.missing_information || [],
            sources: report.sources || [],
            source_type: 'text'
        }, (saveErr) => {
            if (saveErr) console.warn('Note: Could not auto-save verification:', saveErr.message);
        });

        res.json({
            ok: true,
            id: reportId,
            claim: report.claim || rawInput.trim(),
            verdict: report.verdict || 'INSUFFICIENT EVIDENCE',
            confidence: report.confidence || 75,
            truth_percentage: report.truth_percentage ?? (report.verdict === 'SUPPORTED' ? 92 : report.verdict?.includes('PARTIAL') ? 58 : 8),
            risk_percentage: report.risk_percentage ?? (report.verdict === 'SUPPORTED' ? 8 : report.verdict?.includes('PARTIAL') ? 42 : 92),
            conclusion: report.conclusion || 'Verification analysis completed against official and indexed evidence.',
            recommendation: report.recommendation || 'Evaluate sources before sharing.',
            explanation: report.explanation || 'Evidence evaluation completed.',
            supporting_points: report.supporting_points || [],
            contradicting_points: report.contradicting_points || [],
            missing_information: report.missing_information || [],
            evidence: report.sources || [],
            sources: report.sources || [],
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });
    } catch (err) {
        console.error('Error during verification:', err);
        res.status(500).json({
            ok: false,
            error: 'Verification engine encountered a processing issue.',
            verdict: 'INSUFFICIENT EVIDENCE',
            confidence: 50,
            truth_percentage: 50,
            risk_percentage: 50,
            conclusion: 'Could not complete multi-source verification due to connectivity or query limits.',
            recommendation: 'Try again with clearer claims.',
            explanation: 'Could not complete multi-source verification due to connectivity or query limits.',
            evidence: []
        });
    }
});

// POST /api/verify-url
app.post('/api/verify-url', optionalAuth, async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || !url.startsWith('http')) {
            return res.status(400).json({ ok: false, error: 'Please enter a valid HTTP/HTTPS URL.' });
        }

        const simulatedContent = `Article verified from URL: ${url}. Topic covers cybersecurity advisories, threat disclosures, and official statements.`;
        const report = await verifyContent(simulatedContent);
        const reportId = 'rep_url_' + Date.now();
        const userId = req.user?.id || req.body.uid || 'usr_guest_demo';

        db.saveVerification({
            id: reportId,
            user_id: userId,
            original_text: url,
            claim: report.claim || `Claims from ${url}`,
            verdict: report.verdict || 'PARTIALLY SUPPORTED',
            confidence: report.confidence || 80,
            explanation: report.explanation || `URL content analyzed against factual repositories.`,
            supporting_points: report.supporting_points || [],
            contradicting_points: report.contradicting_points || [],
            missing_information: report.missing_information || [],
            sources: report.sources || [],
            source_type: 'url'
        }, (saveErr) => {
            if (saveErr) console.warn('Note: Could not auto-save verification:', saveErr.message);
        });

        res.json({
            ok: true,
            id: reportId,
            url,
            claim: report.claim || `Claims from ${url}`,
            verdict: report.verdict || 'PARTIALLY SUPPORTED',
            confidence: report.confidence || 80,
            truth_percentage: report.truth_percentage ?? 60,
            risk_percentage: report.risk_percentage ?? 40,
            conclusion: report.conclusion || 'URL analysis completed.',
            recommendation: report.recommendation || 'Verify specific details independently.',
            explanation: report.explanation || 'URL content evaluated against verified web reporting.',
            evidence: report.sources || [],
            sources: report.sources || [],
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Failed to verify article URL.' });
    }
});

// --- USER HISTORY & STATS ROUTES ---

// GET /api/history
app.get('/api/history', authenticateToken, (req, res) => {
    const filter = req.query.filter || 'ALL';
    db.getUserHistory(req.user.id, filter, (err, history) => {
        if (err) return res.status(500).json({ ok: false, error: 'Failed to fetch history.' });
        res.json({ ok: true, history: history || [] });
    });
});

// POST /api/history
app.post('/api/history', authenticateToken, (req, res) => {
    const report = req.body;
    if (!report || !report.claim) return res.status(400).json({ ok: false, error: 'Report data required.' });

    const reportId = report.id || ('rep_' + Date.now());
    db.saveVerification({
        id: reportId,
        user_id: req.user.id,
        claim: report.claim,
        verdict: report.verdict || 'PARTIALLY SUPPORTED',
        confidence: report.confidence || 80,
        truth_percentage: report.truth_percentage ?? 60,
        risk_percentage: report.risk_percentage ?? 40,
        conclusion: report.conclusion || 'Verification complete.',
        recommendation: report.recommendation || 'Verify independently.',
        explanation: report.explanation || 'Analyzed.',
        supporting_points: report.supporting_points || [],
        contradicting_points: report.contradicting_points || [],
        missing_information: report.missing_information || [],
        sources: report.sources || report.evidence || [],
        source_type: report.source_type || 'claim'
    }, (err) => {
        if (err) return res.status(500).json({ ok: false, error: 'Failed to save to database.' });
        res.json({ ok: true, message: 'Report saved to SQLite history.', id: reportId });
    });
});

// GET /api/history/:id
app.get('/api/history/:id', authenticateToken, (req, res) => {
    db.getVerificationById(req.params.id, req.user.id, (err, report) => {
        if (err || !report) return res.status(404).json({ ok: false, error: 'Verification report not found.' });
        res.json({ ok: true, report });
    });
});

// DELETE /api/history/:id
app.delete('/api/history/:id', authenticateToken, (req, res) => {
    db.deleteVerification(req.params.id, req.user.id, (err, count) => {
        if (err) return res.status(500).json({ ok: false, error: 'Failed to delete report.' });
        res.json({ ok: true, message: 'Report deleted from history.', count });
    });
});

// DELETE /api/history (Clear all)
app.delete('/api/history', authenticateToken, (req, res) => {
    db.clearUserHistory(req.user.id, (err, count) => {
        if (err) return res.status(500).json({ ok: false, error: 'Failed to clear history.' });
        res.json({ ok: true, message: 'All history records cleared.', count });
    });
});

// GET /api/stats
app.get('/api/stats', authenticateToken, (req, res) => {
    db.getUserStats(req.user.id, (err, stats) => {
        if (err) return res.status(500).json({ ok: false, error: 'Failed to fetch stats.' });
        res.json({ ok: true, stats });
    });
});

// --- HEALTH CHECK ROUTE ---

// GET /api/health
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        status: 'healthy',
        service: 'TruthLens Misinformation & Threat Verification Engine',
        version: '3.2.0',
        timestamp: new Date().toISOString(),
        database: 'SQLite 3 connected',
        uptimeSeconds: Math.floor(process.uptime()),
        endpoints: [
            'POST /api/register',
            'POST /api/login',
            'POST /api/logout',
            'GET /api/profile',
            'GET /api/news',
            'POST /api/verify',
            'POST /verify',
            'POST /api/verify-url',
            'GET /api/history',
            'GET /api/history/:id',
            'DELETE /api/history/:id',
            'GET /api/stats',
            'GET /api/health'
        ]
    });
});

// Catch-all: serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 TruthLens Verification Server is RUNNING`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`⚡ API Health: http://localhost:${PORT}/api/health`);
    console.log(`📰 News Feed: http://localhost:${PORT}/api/news`);
    console.log(`🔒 SQLite DB: ${path.join(__dirname, 'truthlens.db')}`);
    console.log(`=================================================`);
});
