const test = require('node:test');
const assert = require('node:assert');
const { createClient } = require('../src/core');

const env = () => ({ platform: 'android', os: 'Android', osVersion: '14', device: 'mobile', appVersion: '2.1', appId: 'io.pagelens.rntest',
  screen: '412x915', language: 'en-US', userAgent: 'Mozilla/5.0 (Linux; Android 14) PageLensRN/1.0' });

test('builds app urls and payloads, in order', async () => {
  const sent = [];
  const c = createClient(env(), async (url, opts) => { sent.push({ url, body: JSON.parse(opts.body), ua: opts.headers['User-Agent'] }); return { status: 202 }; });
  c.configure({ siteId: 'abc', host: 'https://example.com/pl/' });
  c.screen('Home'); c.track('signup', { plan: 'pro' }); c.screen('Check out'); c.identify('u1', { plan: 'pro' });
  await c.flush();
  assert.equal(sent[0].url, 'https://example.com/pl/api/track');
  assert.deepEqual(sent.map((s) => s.body.type), ['pageview', 'custom_event', 'pageview', 'identify']);
  assert.equal(sent[0].body.url, 'app://io.pagelens.rntest/Home');
  assert.equal(sent[1].body.url, 'app://io.pagelens.rntest/Home'); // events belong to the current screen
  assert.equal(sent[2].body.url, 'app://io.pagelens.rntest/Check%20out');
  assert.equal(sent[1].body.props.plan, 'pro');
  assert.equal(sent[3].body.user_id, 'u1');
  assert.equal(sent[0].body.platform, 'android');
  assert.ok(!/bot/i.test(sent[0].ua));
});

test('does nothing when disabled or not configured', async () => {
  const sent = [];
  const c = createClient(env(), async () => { sent.push(1); return { status: 202 }; });
  c.screen('Home');
  c.configure({ siteId: 'abc' });
  c.setEnabled(false); c.track('x');
  await c.flush();
  assert.equal(sent.length, 0);
});

test('sends real events to PageLens', { skip: !process.env.PAGELENS_TEST_SITE }, async () => {
  const c = createClient(env());
  c.configure({ siteId: process.env.PAGELENS_TEST_SITE });
  c.screen('Home'); c.track('rn_sdk_test', { n: 1 }); c.screen('Settings');
  await c.flush();
  assert.equal(c.lastStatus, 202);
});
