// Comprehensive Automated Test Suite for TruthLens
// Tests SQLite DB initialization, User Registration, Password Hashing, Login, Session Auth,
// News Feed retrieval, Claim Verification with grounded citations, History tracking, and Statistics.

const assert = require('assert');
const bcrypt = require('bcryptjs');
const db = require('./db');
const newsService = require('./newsService');
const { verifyContent } = require('./verificationEngine');

console.log("==================================================");
console.log("🧪 STARTING TRUTHLENS AUTOMATED VERIFICATION SUITE");
console.log("==================================================");

async function runTests() {
    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        return new Promise((resolve) => {
            try {
                const res = fn();
                if (res && res.then) {
                    res.then(() => {
                        console.log(`✅ PASS: ${name}`);
                        passed++;
                        resolve();
                    }).catch(err => {
                        console.error(`❌ FAIL: ${name} ->`, err.message);
                        failed++;
                        resolve();
                    });
                } else {
                    console.log(`✅ PASS: ${name}`);
                    passed++;
                    resolve();
                }
            } catch(err) {
                console.error(`❌ FAIL: ${name} ->`, err.message);
                failed++;
                resolve();
            }
        });
    }

    // 1. Password Hashing Security Test
    await test("Password Hashing with bcrypt (never plain-text)", () => {
        const password = "SuperSecretPassword123!";
        const hash = bcrypt.hashSync(password, 10);
        assert(hash !== password, "Hash must not equal plain password");
        assert(bcrypt.compareSync(password, hash), "Bcrypt compare must succeed for valid password");
        assert(!bcrypt.compareSync("WrongPassword", hash), "Bcrypt compare must fail for wrong password");
    });

    // 2. User Account Creation & Lookup in SQLite
    const testEmail = `investigator_${Date.now()}@truthlens.ai`;
    const testUserId = `usr_test_${Date.now()}`;
    const testHash = bcrypt.hashSync("testpass123", 10);

    await test("Create User in SQLite and Query by Email", async () => {
        await new Promise((resolve, reject) => {
            db.createUser({
                id: testUserId,
                name: "Agent Sarah Connor",
                email: testEmail,
                password_hash: testHash
            }, (err, user) => {
                if (err) return reject(err);
                assert.strictEqual(user.email, testEmail);
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            db.findUserByEmail(testEmail, (err, row) => {
                if (err) return reject(err);
                assert(row, "User row must exist");
                assert.strictEqual(row.name, "Agent Sarah Connor");
                resolve();
            });
        });
    });

    // 3. News Feed Retrieval with Categories & Sorting
    await test("News Feed Retrieval & 10 Cyber Threat Categories", async () => {
        const allNews = await newsService.getNews({ category: 'All', search: '', sort: 'Latest' });
        assert(allNews.articles.length > 0, "News articles must be present");
        assert(allNews.isDemo === true || allNews.isDemo === false, "isDemo flag must be boolean");

        // Test category filtering
        const upiNews = await newsService.getNews({ category: 'UPI Fraud', search: '', sort: 'Latest' });
        assert(upiNews.articles.every(a => a.category === 'UPI Fraud'), "Category filter must only return UPI Fraud");

        // Test search query
        const searched = await newsService.getNews({ category: 'All', search: 'CERT-In', sort: 'Latest' });
        assert(searched.articles.length > 0, "Search query must return matching articles");
    });

    // 4. Grounded AI Verification Engine (Never inventing fake sources)
    await test("Verify Asteroid Panic Claim (Grounded Evidence & Conclusion)", async () => {
        const report = await verifyContent("NASA confirmed an asteroid is going to hit Earth in 2026.");
        assert.strictEqual(report.verdict, "CONTRADICTED");
        assert(report.confidence >= 90, "Confidence should be high for debunked claim");
        assert(typeof report.truth_percentage === 'number', "Truth percentage must be a number");
        assert(report.truth_percentage <= 15, "Debunked claim should have low truth percentage");
        assert(typeof report.conclusion === 'string' && report.conclusion.length > 10, "Conclusion must be present");
        assert(report.sources.length > 0, "Must include authentic scientific sources");
        assert(report.sources[0].publisher.includes("NASA") || report.sources[0].publisher.includes("ESA"), "Publisher must be credible scientific body");
    });

    await test("Verify UPI PIN Scam Claim (Percentage & Conclusion)", async () => {
        const report = await verifyContent("Buyer says scan QR code and enter UPI PIN to receive refund.");
        assert.strictEqual(report.verdict, "CONTRADICTED");
        assert(report.confidence >= 90);
        assert(typeof report.conclusion === 'string');
        assert(report.risk_percentage >= 85, "Scam claim must have high risk percentage");
        assert(report.sources.some(s => s.publisher.includes("RBI") || s.publisher.includes("Cyber")), "Must cite financial regulatory authority");
    });

    // 5. Verification History & User Stats Persistence
    await test("Save Verification Record to SQLite & Retrieve User History", async () => {
        const repId = `rep_${Date.now()}`;
        await new Promise((resolve, reject) => {
            db.saveVerification({
                id: repId,
                user_id: testUserId,
                original_text: "Sample claim text for unit test",
                claim: "Sample factual claim",
                verdict: "SUPPORTED",
                confidence: 91,
                explanation: "Test explanation",
                supporting_points: ["Point A", "Point B"],
                contradicting_points: [],
                missing_information: [],
                sources: [{ title: "Test Source", publisher: "TruthLens", url: "https://truthlens.ai", snippet: "Test snippet" }],
                source_type: "text"
            }, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Retrieve History
        await new Promise((resolve, reject) => {
            db.getUserHistory(testUserId, 'ALL', (err, history) => {
                if (err) return reject(err);
                assert(history.length >= 1, "User history must contain saved item");
                assert.strictEqual(history[0].id, repId);
                assert.strictEqual(history[0].verdict, "SUPPORTED");
                resolve();
            });
        });

        // Get User Stats
        await new Promise((resolve, reject) => {
            db.getUserStats(testUserId, (err, stats) => {
                if (err) return reject(err);
                assert(stats.total >= 1, "Total stats must be at least 1");
                assert(stats.supported >= 1, "Supported stats count must be at least 1");
                resolve();
            });
        });
    });

    // 6. Multi-Tenant User Isolation Test
    await test("Multi-Tenant Isolation (User cannot see other users' history)", async () => {
        const otherUserId = `usr_other_${Date.now()}`;
        await new Promise((resolve, reject) => {
            db.getUserHistory(otherUserId, 'ALL', (err, history) => {
                if (err) return reject(err);
                assert.strictEqual(history.length, 0, "Other user must have empty history");
                resolve();
            });
        });
    });

    console.log("==================================================");
    console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("==================================================");

    db.db.close();
}

runTests();
