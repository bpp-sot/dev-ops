(function () {
  'use strict';

  const ICONS = {
    hoodie: '<path d="M32 14c-4 6-8 8-14 10L6 34l8 6 6-5v29h40V35l6 5 8-6-12-10c-6-2-10-4-14-10-3 4-6 6-10 6s-7-2-10-6z"/><path d="M40 8c-2 8 4 14 8 14s10-6 8-14" transform="translate(-8 4)"/>',
    pen: '<path d="M62 12l14 14-38 38-18 6 6-18z"/><path d="M56 18l14 14"/>',
    notebook: '<rect x="20" y="10" width="56" height="76" rx="6"/><path d="M32 10v76M44 30h22M44 42h22"/>',
    tote: '<path d="M22 34h52l4 52H18z"/><path d="M36 34c0-16 4-22 12-22s12 6 12 22"/>',
    backpack: '<rect x="24" y="24" width="48" height="62" rx="14"/><path d="M36 24c0-10 4-14 12-14s12 4 12 14M36 56h24v20H36z"/>',
    mug: '<path d="M20 28h44v40a12 12 0 0 1-12 12H32a12 12 0 0 1-12-12z"/><path d="M64 36h6a10 10 0 0 1 0 22h-6"/>',
    bottle: '<path d="M40 10h16v10l6 8v54a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4V28l6-8z"/><path d="M34 46h28"/>',
    gift: '<rect x="14" y="36" width="68" height="46" rx="4"/><path d="M14 50h68M48 36v46"/><path d="M48 36c-8 0-16-4-16-12 0-6 8-8 16 12 8-20 16-18 16-12 0 8-8 12-16 12z"/>',
  };

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  const gbp = (pence) => money.format(pence / 100);
  const $ = (id) => document.getElementById(id);

  const state = { products: [], categories: [], category: 'all', cart: load(), shipping: { thresholdPence: 5000, standardPence: 395 } };

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem('campus-cart') || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch {
      return {};
    }
  }
  const save = () => localStorage.setItem('campus-cart', JSON.stringify(state.cart));

  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    children.forEach((c) => node.append(c));
    return node;
  }

  function icon(name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 96 96');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '3.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = ICONS[name] || ICONS.gift;
    return svg;
  }

  function renderFilters() {
    const wrap = $('filters');
    wrap.replaceChildren(
      ...['all', ...state.categories].map((c) =>
        el('button', {
          class: 'chip', type: 'button', text: c, 'aria-pressed': String(c === state.category),
          onclick: () => { state.category = c; renderFilters(); renderGrid(); },
        })
      )
    );
  }

  function renderGrid() {
    const visible = state.products.filter((p) => state.category === 'all' || p.category === state.category);
    $('grid').replaceChildren(
      ...visible.map((p, i) => {
        const card = el('article', { class: 'product' }, [
          el('div', { class: `product__art tone-${p.tone}` }, [icon(p.icon)]),
          el('div', { class: 'product__body' }, [
            el('span', { class: 'product__cat', text: p.category }),
            el('h3', { class: 'product__name', text: p.name }),
            el('p', { class: 'product__desc', text: p.description }),
            el('div', { class: 'product__foot' }, [
              el('span', { class: 'price', text: gbp(p.pricePence) }),
              el('button', { class: 'btn btn--small', type: 'button', text: 'Add', 'aria-label': `Add ${p.name} to basket`, onclick: () => add(p.id) }),
            ]),
          ]),
        ]);
        card.style.setProperty('--i', String(i));
        return card;
      })
    );
  }

  const cartLines = () =>
    Object.entries(state.cart)
      .map(([id, quantity]) => ({ product: state.products.find((p) => p.id === id), quantity }))
      .filter((l) => l.product);

  function totals() {
    const subtotal = cartLines().reduce((s, l) => s + l.product.pricePence * l.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= state.shipping.thresholdPence ? 0 : state.shipping.standardPence;
    return { subtotal, shipping, total: subtotal + shipping };
  }

  function renderCart() {
    const lines = cartLines();
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    $('cart-count').textContent = String(count);
    $('cart-empty').hidden = lines.length > 0;
    $('place-order').disabled = lines.length === 0;

    $('cart-lines').replaceChildren(
      ...lines.map(({ product, quantity }) =>
        el('li', { class: 'line' }, [
          el('span', { class: 'line__name', text: product.name }),
          el('span', { class: 'line__price', text: gbp(product.pricePence * quantity) }),
          el('div', { class: 'qty' }, [
            el('button', { type: 'button', text: '\u2212', 'aria-label': `Remove one ${product.name}`, onclick: () => change(product.id, -1) }),
            el('span', { text: String(quantity), 'aria-live': 'polite' }),
            el('button', { type: 'button', text: '+', 'aria-label': `Add one ${product.name}`, onclick: () => change(product.id, 1) }),
          ]),
          el('button', { class: 'link', type: 'button', text: 'Remove', onclick: () => change(product.id, -quantity) }),
        ])
      )
    );

    const t = totals();
    $('t-subtotal').textContent = gbp(t.subtotal);
    $('t-shipping').textContent = t.shipping === 0 && t.subtotal > 0 ? 'Free' : gbp(t.shipping);
    $('t-total').textContent = gbp(t.total);
  }

  function change(id, delta) {
    const next = Math.min(10, Math.max(0, (state.cart[id] || 0) + delta));
    if (next === 0) delete state.cart[id];
    else state.cart[id] = next;
    save();
    renderCart();
  }

  function add(id) {
    change(id, 1);
    const badge = $('cart-count');
    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');
  }

  function toggleCart(open) {
    $('cart').classList.toggle('open', open);
    $('cart').setAttribute('aria-hidden', String(!open));
    $('open-cart').setAttribute('aria-expanded', String(open));
    $('scrim').hidden = !open;
    if (open) $('close-cart').focus();
    else $('open-cart').focus();
  }

  async function checkout(event) {
    event.preventDefault();
    const error = $('checkout-error');
    error.hidden = true;
    const button = $('place-order');
    button.disabled = true;
    button.textContent = 'Placing order\u2026';

    const payload = {
      name: $('name').value,
      email: $('email').value,
      items: cartLines().map((l) => ({ id: l.product.id, quantity: l.quantity })),
    };

    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Something went wrong');

      $('confirm-id').textContent = body.id;
      $('confirm-name').textContent = body.customer.name;
      $('confirm-email').textContent = body.customer.email;
      $('checkout').hidden = true;
      $('cart-body').hidden = true;
      $('confirm').hidden = false;
      state.cart = {};
      save();
      renderCart();
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
    } finally {
      button.textContent = 'Place order';
      button.disabled = cartLines().length === 0;
    }
  }

  async function showBuild() {
    try {
      const { version } = await (await fetch('/health')).json();
      $('build-pill').textContent = `Build \u00b7 ${String(version).slice(0, 7)}`;
    } catch {
      $('build-pill').textContent = 'Build \u00b7 unknown';
    }
  }

  async function init() {
    $('open-cart').addEventListener('click', () => toggleCart(true));
    $('close-cart').addEventListener('click', () => toggleCart(false));
    $('scrim').addEventListener('click', () => toggleCart(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('cart').classList.contains('open')) toggleCart(false); });
    $('checkout').addEventListener('submit', checkout);
    $('continue').addEventListener('click', () => {
      $('confirm').hidden = true;
      $('checkout').hidden = false;
      $('cart-body').hidden = false;
      $('checkout').reset();
      toggleCart(false);
    });

    showBuild();
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      state.products = data.products;
      state.categories = data.categories;
      state.shipping = data.shipping;
      renderFilters();
      renderGrid();
      renderCart();
    } catch {
      $('load-error').hidden = false;
    }
  }

  init();
})();
