require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const rateLimit = require("express-rate-limit");
const OpenAI = require("openai");
const Stripe = require("stripe");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const APP_URL = (process.env.APP_URL || "http://localhost:" + PORT).replace(/\/$/, "");
const production = process.env.NODE_ENV === "production";
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, "nova.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(\`
 CREATE TABLE IF NOT EXISTS users (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   email TEXT NOT NULL UNIQUE,
   password_hash TEXT NOT NULL,
   created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
 );
 CREATE TABLE IF NOT EXISTS subscriptions (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   stripe_customer_id TEXT,
   stripe_subscription_id TEXT UNIQUE,
   status TEXT NOT NULL,
   price_id TEXT,
   current_period_end INTEGER,
   updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
 );
 CREATE TABLE IF NOT EXISTS processed_events (
   event_id TEXT PRIMARY KEY,
   processed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
 );
\`);
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: "draft-7", legacyHeaders: false, message: { error: "Prea multe încercări. Încearcă din nou peste 15 minute." } });
const chatLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false, message: { error: "Ai trimis prea multe mesaje. Încearcă din nou într-un minut." } });

app.disable("x-powered-by");
app.use((req, res, next) => {
 res.setHeader("X-Content-Type-Options", "nosniff");
 res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
 res.setHeader("X-Frame-Options", "DENY");
 res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
 if (production) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
 next();
});

// Stripe webhook uses the raw body for signature verification and must be before express.json().
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
 if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send("Stripe webhook is not configured.");
 let event;
 try { event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET); }
 catch (err) { console.warn("Stripe webhook signature rejected:", err.message); return res.status(400).send("Invalid webhook signature."); }
 if (db.prepare("SELECT event_id FROM processed_events WHERE event_id = ?").get(event.id)) return res.json({ received: true, duplicate: true });
 try {
  const apply = db.transaction(() => {
   const obj = event.data.object;
   if (event.type === "checkout.session.completed" && obj.mode === "subscription" && obj.subscription) {
    const userId = Number(obj.metadata?.userId || obj.client_reference_id);
    if (userId) {
     const subId = typeof obj.subscription === "string" ? obj.subscription : obj.subscription.id;
     db.prepare(\`INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status)
       VALUES (?, ?, ?, 'incomplete')
       ON CONFLICT(stripe_subscription_id) DO UPDATE SET user_id=excluded.user_id, stripe_customer_id=excluded.stripe_customer_id, updated_at=CURRENT_TIMESTAMP\`)
       .run(userId, typeof obj.customer === "string" ? obj.customer : obj.customer?.id || null, subId);
    }
   } else if (event.type.startsWith("customer.subscription.")) {
    const existing = db.prepare("SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ?").get(obj.id);
    const userId = Number(obj.metadata?.userId || existing?.user_id || 0);
    if (userId) {
     const item = obj.items?.data?.[0];
     db.prepare(\`INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, price_id, current_period_end)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(stripe_subscription_id) DO UPDATE SET status=excluded.status, price_id=excluded.price_id,
       current_period_end=excluded.current_period_end, stripe_customer_id=excluded.stripe_customer_id, updated_at=CURRENT_TIMESTAMP\`)
       .run(userId, typeof obj.customer === "string" ? obj.customer : obj.customer?.id || null, obj.id, obj.status || "unknown", item?.price?.id || null, obj.current_period_end || null);
    }
   }
   db.prepare("INSERT INTO processed_events (event_id) VALUES (?)").run(event.id);
  });
  apply();
  return res.json({ received: true });
 } catch (err) { console.error("Stripe webhook processing failed:", err.message); return res.status(500).send("Webhook processing failed."); }
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(session({
 name: "nova.sid",
 secret: process.env.SESSION_SECRET || (production ? "missing-production-secret-change-this" : "local-development-only-change-this-secret"),
 resave: false,
 saveUninitialized: false,
 store: new SQLiteStore({ db: "sessions.sqlite", dir: DATA_DIR, table: "sessions" }),
 cookie: { httpOnly: true, sameSite: "lax", secure: production, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
app.use((req, res, next) => {
 if (production && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) return res.status(503).json({ error: "Configurează SESSION_SECRET cu minimum 32 de caractere." });
 next();
});
app.use(express.static(path.join(__dirname, "public")));

function currentUser(req) {
 if (!req.session.userId) return null;
 return db.prepare("SELECT id, email, created_at FROM users WHERE id = ?").get(req.session.userId) || null;
}
function requireUser(req, res, next) {
 if (!currentUser(req)) return res.status(401).json({ error: "Autentifică-te pentru a continua." });
 next();
}
function activeSubscription(userId) {
 return db.prepare("SELECT status, price_id, current_period_end FROM subscriptions WHERE user_id = ? AND status IN ('active','trialing') ORDER BY updated_at DESC LIMIT 1").get(userId) || null;
}

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "NOVA AI STUDIO" }));
app.get("/api/auth/me", (req, res) => {
 const user = currentUser(req);
 res.json({ user, subscription: user ? activeSubscription(user.id) : null });
});
app.post("/api/auth/signup", authLimiter, async (req, res) => {
 const email = String(req.body?.email || "").trim().toLowerCase();
 const password = String(req.body?.password || "");
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: "Introdu o adresă de e-mail validă." });
 if (password.length < 10 || password.length > 128) return res.status(400).json({ error: "Parola trebuie să aibă între 10 și 128 de caractere." });
 try {
  const hash = await bcrypt.hash(password, 12);
  const result = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(email, hash);
  req.session.regenerate(err => {
   if (err) return res.status(500).json({ error: "Nu am putut crea sesiunea." });
   req.session.userId = Number(result.lastInsertRowid);
   req.session.save(saveErr => saveErr ? res.status(500).json({ error: "Nu am putut salva sesiunea." }) : res.status(201).json({ user: currentUser(req) }));
  });
 } catch (err) {
  if (String(err.code) === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "Există deja un cont cu această adresă." });
  console.error("Signup failed:", err.message);
  res.status(500).json({ error: "Nu am putut crea contul." });
 }
});
app.post("/api/auth/login", authLimiter, async (req, res) => {
 const email = String(req.body?.email || "").trim().toLowerCase();
 const password = String(req.body?.password || "");
 const user = db.prepare("SELECT id, email, password_hash, created_at FROM users WHERE email = ?").get(email);
 if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "E-mail sau parolă incorectă." });
 req.session.regenerate(err => {
  if (err) return res.status(500).json({ error: "Nu am putut crea sesiunea." });
  req.session.userId = user.id;
  req.session.save(saveErr => saveErr ? res.status(500).json({ error: "Nu am putut salva sesiunea." }) : res.json({ user: currentUser(req) }));
 });
});
app.post("/api/auth/logout", (req, res) => req.session.destroy(err => {
 res.clearCookie("nova.sid", { httpOnly: true, sameSite: "lax", secure: production });
 if (err) return res.status(500).json({ error: "Nu am putut închide sesiunea." });
 res.json({ ok: true });
}));

app.post("/api/chat", chatLimiter, async (req, res) => {
 const message = String(req.body?.message || "").trim();
 if (!message) return res.status(400).json({ error: "Scrie un mesaj înainte de trimitere." });
 if (message.length > 12000) return res.status(413).json({ error: "Mesajul este prea lung." });
 if (!openai) return res.status(503).json({ error: "Asistentul AI nu este configurat. Adaugă OPENAI_API_KEY în .env." });
 try {
  const completion = await openai.chat.completions.create({
   model: process.env.OPENAI_MODEL || "gpt-4o-mini",
   messages: [
    { role: "system", content: "Ești NOVA AI STUDIO, un asistent AI util. Răspunde clar, în limba utilizatorului și fără să pretinzi că ai executat acțiuni pe care nu le-ai făcut." },
    { role: "user", content: message }
   ],
   temperature: 0.7
  });
  res.json({ reply: completion.choices[0]?.message?.content || "Nu am putut genera un răspuns." });
 } catch (error) {
  console.error("OpenAI request failed:", error.message);
  res.status(502).json({ error: "Serviciul AI nu este disponibil momentan. Verifică cheia API și limitele contului." });
 }
});

app.post("/api/create-checkout-session", requireUser, async (req, res) => {
 if (!stripe) return res.status(503).json({ error: "Plățile nu sunt configurate. Adaugă STRIPE_SECRET_KEY și ID-urile de preț în .env." });
 const plan = String(req.body?.plan || "");
 const price = plan === "starter" ? process.env.STRIPE_PRICE_STARTER : plan === "pro" ? process.env.STRIPE_PRICE_PRO : null;
 if (!price) return res.status(400).json({ error: "Plan invalid sau ID de preț Stripe lipsă." });
 const user = currentUser(req);
 try {
  const checkout = await stripe.checkout.sessions.create({
   mode: "subscription",
   line_items: [{ price, quantity: 1 }],
   client_reference_id: String(user.id),
   customer_email: user.email,
   metadata: { userId: String(user.id), plan },
   subscription_data: { metadata: { userId: String(user.id), plan } },
   success_url: APP_URL + "/?checkout=success",
   cancel_url: APP_URL + "/?checkout=cancelled"
  });
  res.json({ url: checkout.url });
 } catch (error) {
  console.error("Stripe checkout failed:", error.message);
  res.status(502).json({ error: "Nu am putut porni checkout-ul. Verifică configurația Stripe." });
 }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
if (require.main === module) app.listen(PORT, "0.0.0.0", () => console.log("NOVA AI STUDIO rulează pe portul " + PORT));
module.exports = { app, db };
