const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'truthlens.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database: truthlens.db');
        initTables();
    }
});

function initTables() {
    db.serialize(() => {
        // Users Table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'investigator',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Verifications History Table
        db.run(`
            CREATE TABLE IF NOT EXISTS verifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                original_text TEXT,
                claim TEXT NOT NULL,
                verdict TEXT NOT NULL,
                confidence INTEGER NOT NULL,
                explanation TEXT NOT NULL,
                supporting_points TEXT,
                contradicting_points TEXT,
                missing_information TEXT,
                sources_json TEXT,
                source_type TEXT DEFAULT 'claim',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // News Cache Table
        db.run(`
            CREATE TABLE IF NOT EXISTS news_articles (
                id TEXT PRIMARY KEY,
                headline TEXT NOT NULL,
                summary TEXT NOT NULL,
                content TEXT,
                category TEXT NOT NULL,
                publisher TEXT NOT NULL,
                url TEXT,
                image_url TEXT,
                published_at DATETIME,
                is_demo INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('TruthLens SQLite tables initialized successfully.');
    });
}

// User Helpers
function createUser(user, callback) {
    const query = `INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, datetime('now'))`;
    db.run(query, [user.id, user.name, user.email.toLowerCase().trim(), user.password_hash], function (err) {
        callback(err, { id: user.id, name: user.name, email: user.email });
    });
}

function findUserByEmail(email, callback) {
    const query = `SELECT * FROM users WHERE lower(email) = ?`;
    db.get(query, [email.toLowerCase().trim()], (err, row) => {
        callback(err, row);
    });
}

function findUserById(id, callback) {
    const query = `SELECT id, name, email, role, created_at FROM users WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        callback(err, row);
    });
}

// Verification History Helpers
function saveVerification(data, callback) {
    const query = `
        INSERT INTO verifications (
            id, user_id, original_text, claim, verdict, confidence, explanation, 
            supporting_points, contradicting_points, missing_information, sources_json, source_type, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    const supporting = Array.isArray(data.supporting_points) ? JSON.stringify(data.supporting_points) : data.supporting_points || '[]';
    const contradicting = Array.isArray(data.contradicting_points) ? JSON.stringify(data.contradicting_points) : data.contradicting_points || '[]';
    const missing = Array.isArray(data.missing_information) ? JSON.stringify(data.missing_information) : data.missing_information || '[]';
    const sources = Array.isArray(data.sources) ? JSON.stringify(data.sources) : data.sources || '[]';

    db.run(query, [
        data.id,
        data.user_id,
        data.original_text || '',
        data.claim,
        data.verdict,
        data.confidence,
        data.explanation,
        supporting,
        contradicting,
        missing,
        sources,
        data.source_type || 'claim'
    ], function (err) {
        callback(err, { id: data.id });
    });
}

function getUserHistory(userId, filter, callback) {
    let query = `SELECT * FROM verifications WHERE user_id = ?`;
    const params = [userId];

    if (filter && filter !== 'ALL') {
        query += ` AND upper(verdict) LIKE ?`;
        params.push(`%${filter.toUpperCase()}%`);
    }

    query += ` ORDER BY created_at DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return callback(err, null);
        const formatted = rows.map(row => ({
            id: row.id,
            uid: row.user_id,
            originalText: row.original_text,
            claim: row.claim,
            verdict: row.verdict,
            confidence: row.confidence,
            explanation: row.explanation,
            supporting_points: JSON.parse(row.supporting_points || '[]'),
            contradicting_points: JSON.parse(row.contradicting_points || '[]'),
            missing_information: JSON.parse(row.missing_information || '[]'),
            evidence: JSON.parse(row.sources_json || '[]'),
            evidenceCount: JSON.parse(row.sources_json || '[]').length,
            timestamp: row.created_at,
            sourceType: row.source_type
        }));
        callback(null, formatted);
    });
}

function getVerificationById(id, userId, callback) {
    const query = `SELECT * FROM verifications WHERE id = ? AND user_id = ?`;
    db.get(query, [id, userId], (err, row) => {
        if (err) return callback(err, null);
        if (!row) return callback(null, null);
        const formatted = {
            id: row.id,
            uid: row.user_id,
            originalText: row.original_text,
            claim: row.claim,
            verdict: row.verdict,
            confidence: row.confidence,
            explanation: row.explanation,
            supporting_points: JSON.parse(row.supporting_points || '[]'),
            contradicting_points: JSON.parse(row.contradicting_points || '[]'),
            missing_information: JSON.parse(row.missing_information || '[]'),
            evidence: JSON.parse(row.sources_json || '[]'),
            evidenceCount: JSON.parse(row.sources_json || '[]').length,
            timestamp: row.created_at,
            sourceType: row.source_type
        };
        callback(null, formatted);
    });
}

function deleteVerification(id, userId, callback) {
    const query = `DELETE FROM verifications WHERE id = ? AND user_id = ?`;
    db.run(query, [id, userId], function (err) {
        callback(err, this.changes);
    });
}

function clearUserHistory(userId, callback) {
    const query = `DELETE FROM verifications WHERE user_id = ?`;
    db.run(query, [userId], function (err) {
        callback(err, this.changes);
    });
}

function getUserStats(userId, callback) {
    const query = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN upper(verdict) = 'SUPPORTED' THEN 1 ELSE 0 END) as supported,
            SUM(CASE WHEN upper(verdict) LIKE '%PARTIAL%' THEN 1 ELSE 0 END) as partial,
            SUM(CASE WHEN upper(verdict) LIKE '%CONTRADICT%' THEN 1 ELSE 0 END) as contradicted,
            SUM(CASE WHEN upper(verdict) LIKE '%INSUFFICIENT%' THEN 1 ELSE 0 END) as insufficient
        FROM verifications 
        WHERE user_id = ?
    `;

    db.get(query, [userId], (err, row) => {
        if (err) return callback(err, null);
        callback(null, {
            total: row.total || 0,
            supported: row.supported || 0,
            partial: row.partial || 0,
            contradicted: row.contradicted || 0,
            insufficient: row.insufficient || 0
        });
    });
}

module.exports = {
    db,
    createUser,
    findUserByEmail,
    findUserById,
    saveVerification,
    getUserHistory,
    getVerificationById,
    deleteVerification,
    clearUserHistory,
    getUserStats
};
