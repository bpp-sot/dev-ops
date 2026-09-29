const products = require('./products');
const { createOrderStore, ValidationError } = require('./orders');
const { serveStatic } = require('./static');

const MAX_BODY_BYTES = 16 * 1024;

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin',
  'Content-Security-Policy':
    "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; frame-ancestors 'none'",
};

const sendJson = (res, status, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(payload), 'Cache-Control': 'no-store' });
  res.end(payload);
};

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new ValidationError('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new ValidationError('Request body must be valid JSON'));
      }
    });
    req.on('error', reject);
  });

const createApp = (cfg) => {
  const orders = createOrderStore(cfg);
  const startedAt = Date.now();

  return async (req, res) => {
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    const { pathname, searchParams } = new URL(req.url, 'http://localhost');

    try {
      if (pathname === '/health') {
        return sendJson(res, 200, { status: 'ok', version: cfg.version, uptimeSeconds: Math.round((Date.now() - startedAt) / 1000) });
      }

      if (pathname === '/api/products' && req.method === 'GET') {
        const category = searchParams.get('category') || undefined;
        return sendJson(res, 200, {
          categories: products.CATEGORIES,
          shipping: { thresholdPence: cfg.freeShippingThresholdPence, standardPence: cfg.standardShippingPence },
          products: products.list({ category }),
        });
      }

      const productMatch = pathname.match(/^\/api\/products\/([\w-]+)$/);
      if (productMatch && req.method === 'GET') {
        const product = products.find(productMatch[1]);
        return product ? sendJson(res, 200, product) : sendJson(res, 404, { error: 'Product not found' });
      }

      if (pathname === '/api/checkout' && req.method === 'POST') {
        const order = orders.create(await readJson(req));
        return sendJson(res, 201, order);
      }

      const orderMatch = pathname.match(/^\/api\/orders\/(ORD-[A-F0-9]+)$/);
      if (orderMatch && req.method === 'GET') {
        const order = orders.get(orderMatch[1]);
        return order ? sendJson(res, 200, order) : sendJson(res, 404, { error: 'Order not found' });
      }

      if (pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'Not found' });

      if ((req.method === 'GET' || req.method === 'HEAD') && serveStatic(req, res, pathname)) return undefined;
      return sendJson(res, 404, { error: 'Not found' });
    } catch (err) {
      if (err instanceof ValidationError) return sendJson(res, 400, { error: err.message });
      console.error(err);
      return sendJson(res, 500, { error: 'Internal server error' });
    }
  };
};

module.exports = { createApp };
