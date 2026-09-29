const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { start } = require('../src/server');

let server;
let base;

before(async () => {
  server = await start({ port: 0, version: 'test-sha', freeShippingThresholdPence: 5000, standardShippingPence: 395 });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

const post = (path, body) =>
  fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('GET /health reports the deployed version', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.version, 'test-sha');
});

test('GET /api/products lists the catalogue and filters by category', async () => {
  const all = await (await fetch(`${base}/api/products`)).json();
  assert.ok(all.products.length >= 8);
  for (const wanted of ['hoodie', 'pen', 'notebook', 'bag']) {
    assert.ok(all.products.some((p) => p.name.toLowerCase().includes(wanted)), `catalogue should include a ${wanted}`);
  }

  const bags = await (await fetch(`${base}/api/products?category=bags`)).json();
  assert.ok(bags.products.length > 0);
  assert.ok(bags.products.every((p) => p.category === 'bags'));
});

test('GET /api/products/:id returns 404 for unknown products', async () => {
  assert.equal((await fetch(`${base}/api/products/hoodie-navy`)).status, 200);
  assert.equal((await fetch(`${base}/api/products/does-not-exist`)).status, 404);
});

test('POST /api/checkout creates an order that can be fetched', async () => {
  const res = await post('/api/checkout', { name: 'Grace Hopper', email: 'grace@example.com', items: [{ id: 'notebook-a5', quantity: 2 }] });
  assert.equal(res.status, 201);
  const order = await res.json();
  assert.equal(order.subtotalPence, 1500);

  const fetched = await fetch(`${base}/api/orders/${order.id}`);
  assert.equal(fetched.status, 200);
  assert.equal((await fetched.json()).id, order.id);
});

test('POST /api/checkout rejects invalid input', async () => {
  assert.equal((await post('/api/checkout', { name: 'Grace', email: 'grace@example.com', items: [] })).status, 400);
  const bad = await fetch(`${base}/api/checkout`, { method: 'POST', body: '{not json' });
  assert.equal(bad.status, 400);
});

test('serves the storefront and blocks path traversal', async () => {
  const home = await fetch(base);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Campus Store/);
  assert.ok(home.headers.get('content-security-policy'));

  const traversal = await fetch(`${base}/..%2f..%2fpackage.json`);
  assert.equal(traversal.status, 404);
});
