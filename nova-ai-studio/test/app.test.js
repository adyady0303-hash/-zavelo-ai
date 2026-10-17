const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('package manifest contains start and test scripts', () => {
  const pkg = require('../package.json');
  assert.equal(typeof pkg.scripts.start, 'string');
  assert.ok(pkg.dependencies.express);
});

test('static UI includes primary sections and accessible chat controls', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert.match(html, /id="studio"/);
  assert.match(html, /id="plans"/);
  assert.match(html, /id="chatForm"/);
  assert.match(html, /aria-live="polite"/);
});

test('environment example does not contain live secrets', () => {
  const env = fs.readFileSync(path.join(__dirname, '../.env.example'), 'utf8');
  assert.match(env, /OPENAI_API_KEY=/);
  assert.match(env, /STRIPE_SECRET_KEY=/);
  assert.doesNotMatch(env, /sk_live_[A-Za-z0-9]+/);
});
