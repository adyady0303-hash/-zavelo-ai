# NOVA AI STUDIO

A responsive Romanian-language AI workspace built with Node.js, Express, SQLite, OpenAI and Stripe Checkout.

## Included
- Responsive studio UI and AI chat endpoint.
- Email/password signup and login with bcrypt password hashing.
- Server-side sessions stored in SQLite, HTTP-only cookies and authentication rate limiting.
- SQLite user/subscription/event tables.
- Stripe subscription checkout and signature-verified, idempotent webhook handling.
- GitHub Actions smoke tests and Docker deployment starter.

## Local setup
Requirements: Node.js 20+ and an OpenAI API key for AI replies.
1. Copy `.env.example` to `.env`.
2. Generate a session secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and put it in `SESSION_SECRET`.
3. Set `OPENAI_API_KEY` if you want AI replies.
4. Run `npm install`.
5. Run `npm run check && npm test`.
6. Run `npm start` and open `http://localhost:3000`.

Never commit `.env` or the `data/` directory.

## Stripe subscriptions
1. Create recurring Starter and Pro prices in Stripe; set `STRIPE_PRICE_STARTER` and `STRIPE_PRICE_PRO` to their Price IDs.
2. Set `STRIPE_SECRET_KEY` on the server.
3. Set `APP_URL` to the canonical HTTPS URL of the deployed app.
4. Configure webhook endpoint `https://YOUR-DOMAIN/api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.
5. Set `STRIPE_WEBHOOK_SECRET` to the endpoint signing secret.
6. Test checkout, renewal, cancellation, failed payments and webhook retries in Stripe test mode before enabling live mode.

Webhook events update subscription status in SQLite. Attach persistent disk storage to deployments and back up the database.

## Deployment
A Dockerfile and Render blueprint are included. Build with `docker build -t nova-ai-studio -f nova-ai-studio/Dockerfile .` from the repository root. Run with environment variables and a persistent volume mounted at `/app/data`. Use HTTPS and set `NODE_ENV=production`, `APP_URL`, and a random `SESSION_SECRET` of at least 32 characters.

## Production readiness
This is a deployable starter, not a certified production SaaS. Before accepting real customers, complete end-to-end payment and security tests, account recovery and email verification, legal/privacy notices appropriate to your jurisdiction, database backup/restore, monitoring, quotas and abuse prevention. The chat endpoint currently permits anonymous requests; configure suitable usage limits before public launch. Enforce subscription checks on every paid-only server endpoint.

## Health check
`GET /api/health` returns a JSON health response. Never commit API keys or Stripe secrets.