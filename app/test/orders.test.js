const { test } = require('node:test');
const assert = require('node:assert/strict');
const { priceOrder, createOrderStore, ValidationError } = require('../src/orders');

const cfg = { freeShippingThresholdPence: 5000, standardShippingPence: 395 };

test('adds standard shipping below the free-shipping threshold', () => {
  const order = priceOrder([{ id: 'pen-set', quantity: 2 }], cfg);
  assert.equal(order.subtotalPence, 1700);
  assert.equal(order.shippingPence, 395);
  assert.equal(order.totalPence, 2095);
});

test('shipping is free at or above the threshold', () => {
  const order = priceOrder([{ id: 'hoodie-navy', quantity: 2 }], cfg);
  assert.equal(order.subtotalPence, 8400);
  assert.equal(order.shippingPence, 0);
  assert.equal(order.totalPence, 8400);
});

test('rejects empty baskets, unknown products and bad quantities', () => {
  assert.throws(() => priceOrder([], cfg), ValidationError);
  assert.throws(() => priceOrder([{ id: 'nope', quantity: 1 }], cfg), /Unknown product/);
  assert.throws(() => priceOrder([{ id: 'pen-set', quantity: 0 }], cfg), /Quantity/);
  assert.throws(() => priceOrder([{ id: 'pen-set', quantity: 1.5 }], cfg), /Quantity/);
  assert.throws(() => priceOrder([{ id: 'pen-set', quantity: 99 }], cfg), /Quantity/);
});

test('rejects duplicate lines', () => {
  const items = [{ id: 'pen-set', quantity: 1 }, { id: 'pen-set', quantity: 1 }];
  assert.throws(() => priceOrder(items, cfg), /Duplicate/);
});

test('creates and retrieves an order', () => {
  const store = createOrderStore(cfg);
  const order = store.create({ name: 'Ada Lovelace', email: 'ada@example.com', items: [{ id: 'mug-ceramic', quantity: 1 }] });
  assert.match(order.id, /^ORD-[A-F0-9]{8}$/);
  assert.equal(order.status, 'confirmed');
  assert.equal(store.get(order.id), order);
  assert.equal(store.count(), 1);
});

test('validates customer details', () => {
  const store = createOrderStore(cfg);
  const items = [{ id: 'mug-ceramic', quantity: 1 }];
  assert.throws(() => store.create({ name: '', email: 'a@b.co', items }), /name/);
  assert.throws(() => store.create({ name: 'Ada', email: 'not-an-email', items }), /email/);
});
