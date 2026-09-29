const crypto = require('node:crypto');
const products = require('./products');

const MAX_LINES = 20;
const MAX_QTY = 10;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class ValidationError extends Error {}

const priceOrder = (items, cfg) => {
  if (!Array.isArray(items) || items.length === 0) throw new ValidationError('Basket is empty');
  if (items.length > MAX_LINES) throw new ValidationError(`No more than ${MAX_LINES} different items per order`);

  const seen = new Set();
  const lines = items.map(({ id, quantity }) => {
    const product = products.find(id);
    if (!product) throw new ValidationError(`Unknown product: ${String(id).slice(0, 40)}`);
    if (seen.has(id)) throw new ValidationError(`Duplicate product: ${id}`);
    seen.add(id);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new ValidationError(`Quantity for ${id} must be between 1 and ${MAX_QTY}`);
    }
    return { id, name: product.name, quantity, unitPricePence: product.pricePence, totalPence: product.pricePence * quantity };
  });

  const subtotalPence = lines.reduce((sum, l) => sum + l.totalPence, 0);
  const shippingPence = subtotalPence >= cfg.freeShippingThresholdPence ? 0 : cfg.standardShippingPence;
  return { lines, subtotalPence, shippingPence, totalPence: subtotalPence + shippingPence };
};

const createOrderStore = (cfg) => {
  const orders = new Map();

  const create = ({ name, email, items }) => {
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) throw new ValidationError('Please provide your name');
    if (typeof email !== 'string' || !EMAIL.test(email) || email.length > 200) throw new ValidationError('Please provide a valid email address');
    const pricing = priceOrder(items, cfg);
    const order = {
      id: `ORD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      customer: { name: name.trim(), email: email.trim() },
      ...pricing,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    orders.set(order.id, order);
    return order;
  };

  return { create, get: (id) => orders.get(id), count: () => orders.size };
};

module.exports = { priceOrder, createOrderStore, ValidationError };
