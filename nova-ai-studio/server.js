require("dotenv").config();
const express = require("express");
const path = require("path");
const OpenAI = require("openai");
const Stripe = require("stripe");

const app = express();
const PORT = process.env.PORT || 3000;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "NOVA AI STUDIO" }));

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) return res.status(400).json({ error: "Scrie un mesaj înainte de trimitere." });
  if (message.length > 12000) return res.status(413).json({ error: "Mesajul este prea lung." });
  if (!openai) return res.status(503).json({ error: "Asistentul AI nu este configurat. Adaugă OPENAI_API_KEY în fișierul .env." });
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

app.post("/api/create-checkout-session", async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "Plățile nu sunt configurate. Adaugă STRIPE_SECRET_KEY și ID-urile de preț în .env." });
  const plan = String(req.body?.plan || "");
  const price = plan === "starter" ? process.env.STRIPE_PRICE_STARTER : plan === "pro" ? process.env.STRIPE_PRICE_PRO : null;
  if (!price) return res.status(400).json({ error: "Plan invalid sau ID de preț Stripe lipsă." });
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: `${process.env.APP_URL || "http://localhost:3000"}/?checkout=success`,
      cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/?checkout=cancelled`
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout failed:", error.message);
    res.status(502).json({ error: "Nu am putut porni checkout-ul. Verifică configurația Stripe." });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, "0.0.0.0", () => console.log(`NOVA AI STUDIO rulează pe portul ${PORT}`));