# NOVA AI STUDIO

Responsive Romanian-language AI workspace starter with an Express API, OpenAI chat endpoint, subscription-plan UI, and Stripe Checkout session endpoint.

## Requirements

- Node.js 20+
- An OpenAI API key for AI replies
- A Stripe account and recurring Price IDs for paid checkout

## Run locally

1. Copy `.env.example` to `.env`.
2. Add `OPENAI_API_KEY`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Stripe setup

Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, and `APP_URL`. Create recurring prices in the Stripe dashboard and copy their Price IDs. Keep all secrets on the server.

## Important production checklist

This repository is a starter implementation, not yet a production-ready paid SaaS. Before accepting real customers:
- implement authentication, user accounts, and secure sessions;
- verify Stripe webhook signatures and synchronize subscription status in a database;
- gate paid features on verified subscription status;
- add persistence, rate limiting, abuse protection, logging, privacy/terms pages, and backup strategy;
- configure HTTPS, deployment environment variables, and domain;
- add automated tests and run them in CI.

No API keys or secrets should be committed to Git. `.env` is intentionally not included.
