const PRODUCTS = [
  { id: 'hoodie-navy', name: 'Campus Hoodie', category: 'apparel', pricePence: 4200, icon: 'hoodie', tone: 'navy', description: 'Heavyweight brushed-fleece hoodie with embroidered crest.' },
  { id: 'hoodie-zip', name: 'Zip Hoodie', category: 'apparel', pricePence: 4800, icon: 'hoodie', tone: 'coral', description: 'Full-zip hoodie in recycled cotton. Made for late library nights.' },
  { id: 'pen-set', name: 'Signature Pen Set (3)', category: 'stationery', pricePence: 850, icon: 'pen', tone: 'sand', description: 'Three smooth-writing ballpoints in university colours.' },
  { id: 'pen-metal', name: 'Engraved Metal Pen', category: 'stationery', pricePence: 1200, icon: 'pen', tone: 'graphite', description: 'Weighted aluminium pen, laser-engraved with the crest.' },
  { id: 'notebook-a5', name: 'A5 Hardback Notebook', category: 'stationery', pricePence: 750, icon: 'notebook', tone: 'coral', description: '192 pages of dotted paper with a ribbon marker.' },
  { id: 'notebook-recycled', name: 'Recycled Notebook 3-Pack', category: 'stationery', pricePence: 1100, icon: 'notebook', tone: 'sage', description: 'Three softcover notebooks made from 100% recycled paper.' },
  { id: 'tote-canvas', name: 'Canvas Tote Bag', category: 'bags', pricePence: 999, icon: 'tote', tone: 'sand', description: 'Sturdy organic cotton tote. Fits a laptop and lunch.' },
  { id: 'backpack-laptop', name: 'Laptop Backpack', category: 'bags', pricePence: 3400, icon: 'backpack', tone: 'navy', description: 'Water-resistant 20L backpack with padded 15 inch laptop sleeve.' },
  { id: 'mug-ceramic', name: 'Ceramic Mug', category: 'accessories', pricePence: 800, icon: 'mug', tone: 'sage', description: 'Dishwasher-safe 350ml mug with a matt finish.' },
  { id: 'bottle-steel', name: 'Steel Water Bottle', category: 'accessories', pricePence: 1400, icon: 'bottle', tone: 'graphite', description: 'Insulated 500ml bottle. Cold for 24 hours, hot for 12.' },
  { id: 'gift-box', name: 'Graduation Gift Box', category: 'gifts', pricePence: 2999, icon: 'gift', tone: 'coral', description: 'Mug, pen set and notebook, boxed and ready to give.' },
];

const CATEGORIES = ['apparel', 'stationery', 'bags', 'accessories', 'gifts'];

const list = ({ category } = {}) =>
  PRODUCTS.filter((p) => !category || p.category === category);

const find = (id) => PRODUCTS.find((p) => p.id === id);

module.exports = { PRODUCTS, CATEGORIES, list, find };
