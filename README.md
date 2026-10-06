# Truth Lens - AI Misinformation & Cyber Threat Verification Engine

Truth Lens is a full-stack AI-assisted misinformation and cyber threat verification platform. It enables investigators, researchers, and citizens to extract claims from news articles, social posts, screenshots, or URLs, cross-reference them against authoritative evidence databases, and obtain structured verification reports with confidence metrics and source citations.

---

## 🌟 Key Features

1. **First-Screen Registration & Authentication**:
   - Secure account registration with Full Name, Email, Password, and Confirm Password.
   - Passwords securely hashed with **bcrypt** (never stored in plain text).
   - JWT session management with SQLite user account persistence.
   - Private user dashboard, history, and profile management.

2. **Dedicated Start Interface (Command Center)**:
   - Welcoming hub screen with 5 large interactive action cards:
     1. **VERIFY NEWS** – Check whether a news article or claim is supported by evidence.
     2. **NEWS FEED** – Explore the latest cybersecurity, scams, fraud, and misinformation news.
     3. **VERIFY URL** – Paste a webpage URL and analyze its claims.
     4. **CHECK A CLAIM** – Enter a specific statement and verify it.
     5. **HISTORY** – View your previous verification reports.
   - "Back to Start Interface" navigation buttons on every major view.

3. **Latest News & Cyber Alerts Page**:
   - 10 Threat Categories: *All, Cyber Scams, UPI Fraud, Online Theft, Phishing, AI Scams, Social Media Scams, Fake News, Data Breaches, Government Alerts*.
   - Search bar with live keyword filtering.
   - Sorting options: *Latest, Most Relevant, Cybersecurity, Fraud, Misinformation*.
   - Transparent Live vs. Demo indicator banner: *"Demo News – Connect a news API to receive live news."*
   - One-click **"Verify This News"** integration that automatically transfers the article into the verification pipeline.

4. **Multi-Source Evidence Verification Engine**:
   - AI-assisted claim extraction, source comparison, and multi-source consensus scoring.
   - Authentic, verifiable evidence citations (Never invents sources or fake statistics; returns *"INSUFFICIENT EVIDENCE"* when reliable proof is absent).
   - Color-coded verdict badges: `SUPPORTED`, `PARTIALLY SUPPORTED`, `CONTRADICTED`, `INSUFFICIENT EVIDENCE`.

5. **Analytics & History**:
   - Personal verification audit log with verdict filter pills and report viewing.
   - Dynamic Doughnut and Bar charts visualising claim accuracy and threat categories.

6. **Browser Extension Compatibility**:
   - Full backwards compatibility with `POST /verify` and `POST /api/verify` for the Truth Lens Chrome Extension sidepanel.

---

## 🚀 Quick Start & Replit Deployment

### Option A: Run on Replit (Node.js)
1. Import this repository into a new Node.js Repl.
2. In **Secrets / Environment Variables**, configure:
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key from Google AI Studio.
   - `NEWS_API_KEY`: *(Optional)* Your NewsAPI / GNews API key for live global feeds.
   - `JWT_SECRET`: *(Optional)* Secret key for session tokens.
3. Click **Run** (`node server.js`). Replit will serve the web interface and API endpoints on port 3000.

### Option B: Run with Python Flask on Replit
1. Select Python environment.
2. Run: `pip install -r requirements.txt && python app.py`

### Option C: Local Development
```bash
npm install
npm start
```
Open `http://localhost:3000` in your web browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/api/register` | Register new user account (bcrypt hash) | No |
| `POST` | `/api/login` | Sign in and obtain JWT session token | No |
| `POST` | `/api/logout` | Sign out user session | No |
| `GET` | `/api/profile` | Get current user profile and verification count | Yes |
| `GET` | `/api/news` | Get cyber & misinformation news feed | No |
| `POST` | `/api/verify` | Analyze text/claim & return evidence report | Optional |
| `POST` | `/verify` | Legacy / Browser Extension endpoint | Optional |
| `POST` | `/api/verify-url`| Scrape URL and verify factual propositions | Optional |
| `GET` | `/api/history` | Retrieve user's personal verification history | Yes |
| `GET` | `/api/history/:id`| Retrieve single verification report | Yes |
| `DELETE`| `/api/history/:id`| Delete a verification report from history | Yes |
| `GET` | `/api/stats` | Retrieve user verification summary statistics | Yes |
| `GET` | `/api/health` | Service health status and uptime | No |

---

## 🗄️ Database Architecture (SQLite 3)

The application uses `truthlens.db` with two primary tables:

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'investigator',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verifications (
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
);
```

---

## 🛡️ Truth Lens Safety & AI Ethics Notice
Truth Lens provides AI-assisted claim analysis and evidence comparison based on available online evidence and official registries. Results may contain context nuances and should never be considered absolute proof of truth or falsehood.
