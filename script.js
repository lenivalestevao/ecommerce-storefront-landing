/* Aurelia Storefront: vanilla JavaScript, no dependencies.
   All pages are rendered in the browser and routed with the URL hash
   (#/shop, #/product/3, #/cart ...), so it runs on any static host.
   The cart, wishlist and demo account are kept in localStorage. */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const price = (n) => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
  const fmt = (n) => '$' + n.toFixed(2);

  /* ---------- Storage (falls back to memory if blocked) ---------- */
  const mem = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return k in mem ? mem[k] : d; } },
    set(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- Icons ---------- */
  const PATHS = {
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    returns: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    support: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
  };
  const icon = (n, s) => `<svg class="i" width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[n] || ''}</svg>`;
  const hydrate = (root) => $$('[data-icon]', root).forEach((el) => { if (!el.firstChild) el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 20); });

  /* ---------- Demo catalog (replace with your API) ---------- */
  const SWATCH = { Sand: '#d9c7a3', Olive: '#6b7a3a', Navy: '#1f2a44', Black: '#161616', White: '#f4f4f4', Camel: '#b98a4e', Grey: '#9ca3af', Blush: '#f2c6c2', Cream: '#f3ead7', Terracotta: '#c4623d', Sage: '#9caf88', Tan: '#b08968', Gold: '#d4a73a', Silver: '#c0c4cc' };
  const CATS = [
    { name: 'Women', emoji: '👗' }, { name: 'Men', emoji: '👔' }, { name: 'Accessories', emoji: '👜' }, { name: 'Home', emoji: '🏡' }, { name: 'Beauty', emoji: '✨' }
  ];
  const CL = ['S', 'M', 'L', 'XL'];
  const P = [
    { id: 1, name: 'Linen Overshirt', cat: 'Men', price: 68, hue: 205, emoji: '👔', rating: 4.7, reviews: 128, tag: 'Best seller', colors: ['Sand', 'Olive', 'Navy'], sizes: CL, desc: 'A relaxed overshirt in washed European linen. Breathable, soft from the first wear and easy to layer over a tee or wear on its own.' },
    { id: 2, name: 'Wool Blend Coat', cat: 'Women', price: 189, was: 249, hue: 25, emoji: '🧥', rating: 4.8, reviews: 96, colors: ['Camel', 'Black', 'Grey'], sizes: CL, desc: 'A timeless long coat in a warm wool blend with a clean single-breasted cut, deep pockets and a fully lined interior.' },
    { id: 3, name: 'Leather Tote Bag', cat: 'Accessories', price: 129, hue: 30, emoji: '👜', rating: 4.9, reviews: 212, tag: 'New', colors: ['Tan', 'Black'], sizes: [], desc: 'Full-grain leather tote with room for a laptop, an interior zip pocket and sturdy handles that soften with age.' },
    { id: 4, name: 'Minimal Sneakers', cat: 'Men', price: 95, hue: 190, emoji: '👟', rating: 4.6, reviews: 341, colors: ['White', 'Black'], sizes: ['40', '41', '42', '43', '44'], desc: 'Clean low-top sneakers with a cushioned insole and a durable rubber sole. Goes with everything in your closet.' },
    { id: 5, name: 'Ceramic Vase Set', cat: 'Home', price: 54, hue: 150, emoji: '🏺', rating: 4.5, reviews: 63, colors: ['Cream', 'Terracotta'], sizes: [], desc: 'A set of three hand-glazed ceramic vases in complementary sizes. Each piece is slightly unique.' },
    { id: 6, name: 'Soy Candle Trio', cat: 'Home', price: 38, was: 48, hue: 45, emoji: '🕯️', rating: 4.8, reviews: 187, tag: 'Best seller', colors: ['Cream'], sizes: [], desc: 'Three hand-poured soy candles with notes of cedar, fig and sea salt. About 40 hours of burn time each.' },
    { id: 7, name: 'Silk Scarf', cat: 'Accessories', price: 42, hue: 330, emoji: '🧣', rating: 4.4, reviews: 54, colors: ['Blush', 'Navy', 'Sage'], sizes: [], desc: 'A lightweight scarf in soft silk twill. Wear it around the neck, in your hair or tied to a bag.' },
    { id: 8, name: 'Aviator Sunglasses', cat: 'Accessories', price: 79, hue: 50, emoji: '🕶️', rating: 4.6, reviews: 142, colors: ['Gold', 'Silver'], sizes: [], desc: 'Classic aviators with polarized UV400 lenses and a lightweight metal frame. Includes a hard case.' },
    { id: 9, name: 'Cotton Tee 3-Pack', cat: 'Men', price: 45, hue: 215, emoji: '👕', rating: 4.7, reviews: 489, colors: ['White', 'Black', 'Grey'], sizes: CL, desc: 'Three everyday tees in heavyweight combed cotton. Pre-washed to keep their shape and color.' },
    { id: 10, name: 'Knit Cardigan', cat: 'Women', price: 84, was: 110, hue: 340, emoji: '🧶', rating: 4.7, reviews: 77, colors: ['Cream', 'Sage', 'Blush'], sizes: CL, desc: 'A chunky cardigan in a soft cotton-wool knit with wooden buttons. Cozy without being heavy.' },
    { id: 11, name: 'Glow Face Serum', cat: 'Beauty', price: 36, hue: 280, emoji: '🧴', rating: 4.8, reviews: 305, tag: 'New', colors: [], sizes: [], desc: 'A lightweight vitamin C serum that brightens and evens skin tone. Fragrance-free and suitable for all skin types.' },
    { id: 12, name: 'Canvas Weekender', cat: 'Accessories', price: 110, hue: 90, emoji: '🧳', rating: 4.6, reviews: 118, colors: ['Olive', 'Navy', 'Sand'], sizes: [], desc: 'A roomy weekend bag in waxed canvas with leather trim, a shoe pocket and a detachable shoulder strap.' }
  ];
  const byId = (id) => P.find((p) => p.id === Number(id));
  const REVIEWS = [['Camila R.', 5, 'Great quality and it fits true to size. Shipping was faster than I expected.'], ['Daniel M.', 5, 'Looks even better in person. I already ordered a second one as a gift.'], ['Priya S.', 4, 'Lovely product. The color is slightly different from the photo, but I like it.']];
  const FAQ = [
    ['Shipping', 'How long does delivery take?', 'Standard delivery takes 3 to 5 business days and express takes 1 to 2. You get a tracking link by email as soon as your order ships.'],
    ['Shipping', 'How much is shipping?', 'Standard shipping is free on orders over $50 and $6 below that. Express shipping is $15.'],
    ['Returns', 'What is your return policy?', 'You can return unworn items in their original packaging within 30 days for a full refund.'],
    ['Returns', 'How do I start a return?', 'Contact us with your order number and we will email you a prepaid return label.'],
    ['Payments', 'Which payment methods do you accept?', 'Major credit and debit cards. This template is a demo, so no real payment is processed.'],
    ['Orders', 'Can I change or cancel my order?', 'You can change or cancel within one hour after placing it. After that, it may already be on its way to the warehouse.'],
    ['Orders', 'Where can I find my order status?', 'Sign in to your account to see your orders and their status.']
  ];

  /* ---------- State ---------- */
  const state = {
    cart: store.get('aur-cart', []),
    wish: store.get('aur-wish', []),
    promo: store.get('aur-promo', ''),
    user: store.get('aur-user', null),
    orders: store.get('aur-orders', []),
    ship: 'standard',
    shop: { cat: 'All', q: '', sort: 'featured', max: 200, sale: false },
    sel: { color: '', size: '', qty: 1 }
  };
  const save = () => { store.set('aur-cart', state.cart); store.set('aur-wish', state.wish); store.set('aur-promo', state.promo); store.set('aur-user', state.user); store.set('aur-orders', state.orders); };

  const lines = () => state.cart.map((c, i) => ({ ...c, i, p: byId(c.id) })).filter((l) => l.p);
  const cartCount = () => lines().reduce((a, l) => a + l.qty, 0);
  function totals(ship) {
    const sub = lines().reduce((a, l) => a + l.p.price * l.qty, 0);
    const disc = state.promo ? Math.round(sub * 10) / 100 : 0;
    const shipping = !sub ? 0 : ship === 'express' ? 15 : sub - disc >= 50 ? 0 : 6;
    return { sub, disc, shipping, total: sub - disc + shipping };
  }

  /* ---------- Small view helpers ---------- */
  const stars = (r, n) => `<span class="stars" title="${r} out of 5"><span aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>${n != null ? `<small>(${n})</small>` : ''}</span>`;
  const tile = (p, cls) => `<span class="${cls || 'pimg'}" style="background:linear-gradient(135deg,hsl(${p.hue} 70% 95%),hsl(${p.hue} 70% 85%))"><span class="emoji">${p.emoji}</span></span>`;

  function productCard(p) {
    const wished = state.wish.includes(p.id);
    const badge = p.was ? `<span class="tag sale">-${Math.round((1 - p.price / p.was) * 100)}%</span>` : p.tag ? `<span class="tag">${p.tag}</span>` : '';
    return `
    <article class="pcard">
      <a class="pimg" href="#/product/${p.id}" style="background:linear-gradient(135deg,hsl(${p.hue} 70% 95%),hsl(${p.hue} 70% 85%))" aria-label="${p.name}"><span class="emoji">${p.emoji}</span>${badge}</a>
      <button class="heart ${wished ? 'on' : ''}" data-action="wish" data-id="${p.id}" aria-label="Toggle wishlist">${icon('heart', 18)}</button>
      <div class="pbody">
        <small class="muted">${p.cat}</small>
        <a class="pname" href="#/product/${p.id}">${p.name}</a>
        ${stars(p.rating, p.reviews)}
        <div class="pprice"><b>${price(p.price)}</b>${p.was ? `<s>${price(p.was)}</s>` : ''}</div>
        <button class="btn btn-dark btn-block" data-action="quick-add" data-id="${p.id}">Add to cart</button>
      </div>
    </article>`;
  }
  const grid = (list) => `<div class="pgrid">${list.map(productCard).join('')}</div>`;
  const head = (title, sub, crumbs) => `
    <div class="page-head"><div class="container">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>${(crumbs || []).map((c) => ' <span>/</span> ' + c).join('')}</nav>
      <h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}
    </div></div>`;

  /* ---------- Pages ---------- */
  const pages = {};

  pages.home = () => {
    const featured = P.filter((p) => !p.was).slice(0, 8);
    const sale = P.filter((p) => p.was);
    const cats = CATS.map((c) => `<a class="cat-tile" href="#/shop/${c.name}"><span class="cat-emoji">${c.emoji}</span><b>${c.name}</b><small>${P.filter((p) => p.cat === c.name).length} ${P.filter((p) => p.cat === c.name).length === 1 ? 'item' : 'items'}</small></a>`).join('');
    const perks = [['truck', 'Free Shipping', 'On orders over $50'], ['lock', 'Secure Payment', '100% protected checkout'], ['returns', 'Easy Returns', '30-day return policy'], ['support', '24/7 Support', "We're here to help"]]
      .map((k) => `<div class="perk">${icon(k[0], 26)}<div><b>${k[1]}</b><small>${k[2]}</small></div></div>`).join('');
    const reviews = [['Camila R.', 'The quality is outstanding and delivery was really fast. My new favorite store.'], ['Daniel M.', 'Beautiful pieces and great packaging. Customer support solved my question in minutes.'], ['Priya S.', 'Everything fits well and looks even better in person. I will order again.'], ['Marcos L.', 'Fast shipping and the easy return process gave me confidence to order.'], ['Julia T.', 'The candles and vases look beautiful at home. Great prices too.']]
      .map((r) => `<figure class="review-card">${stars(5)}<blockquote>${r[1]}</blockquote><figcaption><span class="avatar">${r[0][0]}</span>${r[0]}</figcaption></figure>`).join('');
    return `
    <section class="hero" id="hero"><div class="hero-track" id="heroTrack">
      <div class="hero-slide"><div class="container hero-inner">
        <div class="hero-copy"><span class="eyebrow">New Season Collection</span><h1>Shop the look.</h1>
          <p>Curated essentials and statement pieces, handpicked every season. Quality you can feel at prices you will love.</p>
          <div class="hero-cta"><a class="btn btn-accent btn-lg" href="#/shop">Shop Now ${icon('arrow', 18)}</a><a class="btn btn-ghost btn-lg" href="#/shop">View Deals</a></div>
          <div class="hero-stats"><div><b>12k+</b><small>Happy customers</small></div><div><b>4.8</b><small>Average rating</small></div><div><b>30 days</b><small>Free returns</small></div></div></div>
        <div class="hero-art" aria-hidden="true"><div class="hero-card h1"><span>👔</span><b>Linen Overshirt</b><small>$68</small></div><div class="hero-card h2"><span>👜</span><b>Leather Tote</b><small>$129</small></div><div class="hero-card h3"><span>🕯️</span><b>Candle Trio</b><small>$38</small></div></div>
      </div></div>
      <div class="hero-slide s2"><div class="container hero-inner">
        <div class="hero-copy"><span class="eyebrow">Up to 50% off</span><h1>Weekend Flash Sale.</h1>
          <p>Selected styles for women, men and home at their lowest prices. Offer ends Sunday midnight.</p>
          <div class="hero-cta"><a class="btn btn-accent btn-lg" href="#/shop">Grab the Deal ${icon('arrow', 18)}</a></div></div>
        <div class="hero-art" aria-hidden="true"><div class="hero-card h1"><span>🧥</span><b>Wool Blend Coat</b><small>$189</small></div><div class="hero-card h2"><span>🧶</span><b>Knit Cardigan</b><small>$84</small></div><div class="hero-card h3"><span>🕯️</span><b>Candle Trio</b><small>$38</small></div></div>
      </div></div>
      <div class="hero-slide s3"><div class="container hero-inner">
        <div class="hero-copy"><span class="eyebrow">Home and living</span><h1>Make it feel like home.</h1>
          <p>Ceramics, candles and everyday pieces that bring warmth to every room. Free shipping on orders over $50.</p>
          <div class="hero-cta"><a class="btn btn-accent btn-lg" href="#/shop/Home">Shop Home ${icon('arrow', 18)}</a></div></div>
        <div class="hero-art" aria-hidden="true"><div class="hero-card h1"><span>🏺</span><b>Ceramic Vase Set</b><small>$54</small></div><div class="hero-card h2"><span>🕯️</span><b>Soy Candle Trio</b><small>$38</small></div><div class="hero-card h3"><span>🧴</span><b>Glow Serum</b><small>$36</small></div></div>
      </div></div>
    </div>
    <button class="hero-arrow prev" data-action="hero" data-d="-1" aria-label="Previous slide">${icon('arrow', 20)}</button>
    <button class="hero-arrow next" data-action="hero" data-d="1" aria-label="Next slide">${icon('arrow', 20)}</button>
    <div class="dots" id="heroDots">${[0, 1, 2].map((n) => `<button class="dot ${n === 0 ? 'on' : ''}" data-action="hero-go" data-n="${n}" aria-label="Slide ${n + 1}"></button>`).join('')}</div>
    </section>
    <section class="perks"><div class="container perks-grid">${perks}</div></section>
    <section class="section"><div class="container">
      <div class="section-head"><div><h2>Shop by Category</h2><p class="muted">Find exactly what you're looking for</p></div><a href="#/shop">View all ${icon('arrow', 16)}</a></div>
      <div class="cat-grid">${cats}</div>
    </div></section>
    <section class="section alt"><div class="container">
      <div class="section-head"><div><h2>Featured Products</h2><p class="muted">Hand-picked favorites our customers love</p></div><div class="car-btns"><button data-action="car" data-d="-1" aria-label="Previous">${icon('arrow', 18)}</button><button data-action="car" data-d="1" aria-label="Next">${icon('arrow', 18)}</button></div></div>
      <div class="carousel">${featured.map(productCard).join('')}</div>
    </div></section>
    <section class="section"><div class="container">
      <div class="deal">
        <div><span class="eyebrow light">Limited time</span><h2>Weekend Flash Sale</h2><p>Get up to 50% off on selected items. Offer ends Sunday midnight.</p>
          <div class="countdown" id="countdown"><div><b data-cd="h">00</b><small>Hours</small></div><div><b data-cd="m">00</b><small>Minutes</small></div><div><b data-cd="s">00</b><small>Seconds</small></div></div>
          <a class="btn btn-accent btn-lg" href="#/shop">Grab the Deal</a></div>
      </div>
      <div style="margin-top:28px">${grid(sale)}</div>
    </div></section>
    <section class="section alt"><div class="container">
      <div class="section-head"><div><h2>What Our Customers Say</h2><p class="muted">Real reviews from real shoppers</p></div><div class="car-btns"><button data-action="car" data-d="-1" aria-label="Previous">${icon('arrow', 18)}</button><button data-action="car" data-d="1" aria-label="Next">${icon('arrow', 18)}</button></div></div>
      <div class="carousel reviews">${reviews}</div>
    </div></section>
    <section class="section"><div class="container">
      <div class="newsletter">
        <div><h2>Join Our Newsletter</h2><p>Get 10% off your first order plus the latest drops in your inbox.</p></div>
        <form data-form="newsletter" class="inline-form"><input type="email" required placeholder="Your email address" aria-label="Email"><button class="btn btn-accent">Subscribe</button></form>
      </div>
    </div></section>`;
  };

  function filtered() {
    const f = state.shop, q = f.q.trim().toLowerCase();
    let list = P.filter((p) => (f.cat === 'All' || p.cat === f.cat) && p.price <= f.max && (!f.sale || p.was) && (!q || (p.name + ' ' + p.cat + ' ' + p.desc).toLowerCase().includes(q)));
    const sorts = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, newest: (a, b) => b.id - a.id };
    if (sorts[f.sort]) list = list.slice().sort(sorts[f.sort]);
    return list;
  }
  function shopResults() {
    const list = filtered();
    return `<div class="shop-bar"><span>${list.length} product${list.length === 1 ? '' : 's'}${state.shop.q ? ` for "${esc(state.shop.q)}"` : ''}</span></div>${list.length ? grid(list) : `<div class="empty"><h3>No products found</h3><p>Try a different search or clear the filters.</p><button class="btn btn-dark" data-action="clear-filters">Clear filters</button></div>`}`;
  }
  pages.shop = (arg) => {
    if (arg !== undefined) state.shop.cat = CATS.some((c) => c.name === decodeURIComponent(arg)) ? decodeURIComponent(arg) : 'All';
    else state.shop.cat = 'All';
    const f = state.shop;
    const catLinks = ['All', ...CATS.map((c) => c.name)].map((c) => `<a href="#/shop/${c === 'All' ? '' : c}" class="${f.cat === c ? 'active' : ''}">${c}<small>${c === 'All' ? P.length : P.filter((p) => p.cat === c).length}</small></a>`).join('');
    const sortOpts = [['featured', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['rating', 'Top rated'], ['newest', 'Newest']].map((s) => `<option value="${s[0]}" ${f.sort === s[0] ? 'selected' : ''}>${s[1]}</option>`).join('');
    return `
    ${head(f.cat === 'All' ? 'All products' : f.cat, 'Find your next favorite piece.', f.cat === 'All' ? ['Shop'] : ['<a href="#/shop">Shop</a>', f.cat])}
    <section class="section"><div class="container shop-layout">
      <aside class="filters">
        <h3>Categories</h3><nav class="cat-list">${catLinks}</nav>
        <h3>Max price: <span id="maxLabel">${price(f.max)}</span></h3>
        <input type="range" min="30" max="200" step="5" value="${f.max}" data-filter="max" aria-label="Maximum price">
        <label class="check"><input type="checkbox" data-filter="sale" ${f.sale ? 'checked' : ''}> On sale only</label>
        <button class="btn btn-light btn-block" data-action="clear-filters">Clear filters</button>
      </aside>
      <div>
        <div class="shop-tools">
          <label class="field-inline">Search <input type="search" value="${esc(f.q)}" placeholder="Search products..." data-filter="q"></label>
          <label class="field-inline">Sort by <select data-filter="sort">${sortOpts}</select></label>
        </div>
        <div id="shopResults">${shopResults()}</div>
      </div>
    </div></section>`;
  };

  pages.product = (id) => {
    const p = byId(id);
    if (!p) return pages.notfound();
    state.sel = { color: p.colors[0] || '', size: '', qty: 1 };
    const wished = state.wish.includes(p.id);
    const related = P.filter((x) => x.cat === p.cat && x.id !== p.id).concat(P.filter((x) => x.cat !== p.cat)).slice(0, 4);
    const colors = p.colors.length ? `<div class="opt"><b>Color: <span id="colorName">${p.colors[0]}</span></b><div class="swatches">${p.colors.map((c, i) => `<button class="swatch ${i === 0 ? 'on' : ''}" data-action="pick-color" data-color="${c}" style="background:${SWATCH[c] || '#ccc'}" aria-label="${c}"></button>`).join('')}</div></div>` : '';
    const sizes = p.sizes.length ? `<div class="opt"><b>Size</b><div class="sizes">${p.sizes.map((s) => `<button class="size" data-action="pick-size" data-size="${s}">${s}</button>`).join('')}</div><small class="muted" id="sizeHint"></small></div>` : '';
    const reviews = REVIEWS.map((r) => `<div class="review-row"><span class="avatar">${r[0][0]}</span><div><b>${r[0]}</b> ${stars(r[1])}<p>${r[2]}</p></div></div>`).join('');
    return `
    ${head('', '', ['<a href="#/shop">Shop</a>', `<a href="#/shop/${p.cat}">${p.cat}</a>`, p.name]).replace('<h1></h1>', '')}
    <section class="section tight"><div class="container pdp">
      <div class="gallery">
        <div class="gallery-main" style="background:linear-gradient(135deg,hsl(${p.hue} 70% 95%),hsl(${p.hue} 70% 85%))"><span class="emoji xl">${p.emoji}</span>${p.was ? `<span class="tag sale">Sale</span>` : ''}</div>
        <div class="thumbs">${[0, 1, 2].map((n) => `<div class="thumb ${n === 0 ? 'on' : ''}" style="background:linear-gradient(135deg,hsl(${(p.hue + n * 18) % 360} 70% 95%),hsl(${(p.hue + n * 18) % 360} 70% 85%))">${p.emoji}</div>`).join('')}</div>
      </div>
      <div class="pinfo">
        <small class="muted">${p.cat}</small>
        <h1>${p.name}</h1>
        ${stars(p.rating, p.reviews + ' reviews')}
        <div class="pprice big"><b>${price(p.price)}</b>${p.was ? `<s>${price(p.was)}</s><span class="tag sale">Save ${price(p.was - p.price)}</span>` : ''}</div>
        <p class="lead">${p.desc}</p>
        ${colors}${sizes}
        <div class="buy-row">
          <div class="qty"><button data-action="sel-qty" data-d="-1" aria-label="Decrease">${icon('minus', 16)}</button><span id="selQty">1</span><button data-action="sel-qty" data-d="1" aria-label="Increase">${icon('plus', 16)}</button></div>
          <button class="btn btn-accent btn-lg grow" data-action="add-detail" data-id="${p.id}">Add to cart</button>
          <button class="btn btn-light btn-lg icon-only ${wished ? 'wished' : ''}" data-action="wish" data-id="${p.id}" aria-label="Toggle wishlist">${icon('heart', 20)}</button>
        </div>
        <ul class="assure"><li>${icon('truck', 18)} Free shipping on orders over $50</li><li>${icon('returns', 18)} 30-day free returns</li><li>${icon('shield', 18)} Secure checkout</li></ul>
        <details class="acc" open><summary>Details</summary><p>Made with care from quality materials. Machine washable or wipe clean depending on the product. Designed in-house and produced in small batches.</p></details>
        <details class="acc"><summary>Shipping and returns</summary><p>Standard delivery in 3 to 5 business days. Free returns within 30 days on unworn items in their original packaging.</p></details>
      </div>
    </div></section>
    <section class="section alt tight"><div class="container"><h2>Customer reviews</h2><div class="reviews-list">${reviews}</div></div></section>
    <section class="section"><div class="container"><div class="section-head"><h2>You may also like</h2></div>${grid(related)}</div></section>`;
  };

  const cartLine = (l) => `
    <div class="cart-line">
      ${tile(l.p, 'cart-img')}
      <div class="cart-info">
        <a href="#/product/${l.p.id}"><b>${l.p.name}</b></a>
        <small class="muted">${[l.color, l.size].filter(Boolean).join(' · ') || 'Standard'}</small>
        <div class="qty sm"><button data-action="qty" data-i="${l.i}" data-d="-1" aria-label="Decrease">${icon('minus', 14)}</button><span>${l.qty}</span><button data-action="qty" data-i="${l.i}" data-d="1" aria-label="Increase">${icon('plus', 14)}</button></div>
      </div>
      <div class="cart-right"><b>${fmt(l.p.price * l.qty)}</b><button class="link-btn" data-action="remove" data-i="${l.i}" aria-label="Remove">${icon('trash', 16)}</button></div>
    </div>`;

  function summaryHTML(withPromo) {
    const t = totals(state.ship);
    return `
    <div class="sum-row"><span>Subtotal</span><b>${fmt(t.sub)}</b></div>
    ${t.disc ? `<div class="sum-row good"><span>Discount (AURELIA10)</span><b>-${fmt(t.disc)}</b></div>` : ''}
    <div class="sum-row"><span>Shipping</span><b>${t.shipping ? fmt(t.shipping) : 'Free'}</b></div>
    <div class="sum-row total"><span>Total</span><b>${fmt(t.total)}</b></div>
    ${withPromo ? `
    <form class="promo" data-form="promo"><input name="code" placeholder="Promo code (try AURELIA10)" value="${esc(state.promo)}" aria-label="Promo code"><button class="btn btn-light">Apply</button></form>` : ''}`;
  }

  pages.cart = () => {
    const ls = lines();
    if (!ls.length) return `${head('Your cart')}<section class="section"><div class="container"><div class="empty"><span class="emoji xl">🛍️</span><h3>Your cart is empty</h3><p>Looks like you have not added anything yet.</p><a class="btn btn-accent btn-lg" href="#/shop">Start shopping</a></div></div></section>`;
    return `
    ${head('Your cart', cartCount() + ' item' + (cartCount() === 1 ? '' : 's'), ['Cart'])}
    <section class="section tight"><div class="container two-col">
      <div class="card-box"><div id="cartLines">${ls.map(cartLine).join('')}</div></div>
      <aside class="card-box sticky"><h3>Order summary</h3><div id="cartSummary">${summaryHTML(true)}</div>
        <a class="btn btn-accent btn-lg btn-block" href="#/checkout">Checkout ${icon('arrow', 18)}</a>
        <a class="btn btn-light btn-block" href="#/shop" style="margin-top:10px">Continue shopping</a></aside>
    </div></section>`;
  };

  pages.checkout = () => {
    const ls = lines();
    if (!ls.length) { location.hash = '#/cart'; return ''; }
    const u = state.user || {};
    return `
    ${head('Checkout', 'This is a demo. No payment is processed, so please do not enter real card details.', ['<a href="#/cart">Cart</a>', 'Checkout'])}
    <section class="section tight"><div class="container two-col">
      <form class="card-box" id="checkoutForm" data-form="checkout" autocomplete="off">
        <h3>Contact</h3>
        <div class="field"><label>Email</label><input name="email" type="email" required value="${esc(u.email || '')}" placeholder="you@example.com"></div>
        <h3>Shipping address</h3>
        <div class="form-grid">
          <div class="field"><label>Full name</label><input name="name" required value="${esc(u.name || '')}" placeholder="Jane Doe"></div>
          <div class="field"><label>Country</label><select name="country"><option>United States</option><option>Brazil</option><option>Canada</option><option>United Kingdom</option><option>Germany</option></select></div>
        </div>
        <div class="field"><label>Address</label><input name="address" required placeholder="123 Market Street"></div>
        <div class="form-grid three">
          <div class="field"><label>City</label><input name="city" required></div>
          <div class="field"><label>State / Region</label><input name="state" required></div>
          <div class="field"><label>ZIP / Postal code</label><input name="zip" required></div>
        </div>
        <h3>Delivery</h3>
        <label class="radio"><input type="radio" name="ship" value="standard" checked data-filter="ship"><span><b>Standard</b><small>3 to 5 business days · free over $50, otherwise $6</small></span></label>
        <label class="radio"><input type="radio" name="ship" value="express" data-filter="ship"><span><b>Express</b><small>1 to 2 business days · $15</small></span></label>
        <h3>Payment <span class="lock">${icon('lock', 14)} Demo only</span></h3>
        <div class="field"><label>Card number</label><input name="card" required inputmode="numeric" maxlength="19" placeholder="Demo: any number"></div>
        <div class="form-grid">
          <div class="field"><label>Expiry</label><input name="exp" required placeholder="MM / YY" maxlength="7"></div>
          <div class="field"><label>CVC</label><input name="cvc" required inputmode="numeric" maxlength="4" placeholder="123"></div>
        </div>
        <button class="btn btn-accent btn-lg btn-block">Place order</button>
      </form>
      <aside class="card-box sticky"><h3>Your order</h3>
        ${ls.map((l) => `<div class="mini-line">${tile(l.p, 'mini-img')}<div><b>${l.p.name}</b><small class="muted">${[l.color, l.size].filter(Boolean).join(' · ')} × ${l.qty}</small></div><b>${fmt(l.p.price * l.qty)}</b></div>`).join('')}
        <div id="checkoutSummary">${summaryHTML(false)}</div>
      </aside>
    </div></section>`;
  };

  pages.success = () => {
    const o = state.orders[0];
    if (!o) return pages.notfound();
    return `
    <section class="section"><div class="container narrow center">
      <div class="success-ico">${icon('check', 36)}</div>
      <h1>Thank you for your order!</h1>
      <p class="lead">Your order <b>${o.id}</b> has been placed. A confirmation would be sent to <b>${esc(o.email)}</b>.</p>
      <div class="card-box left">
        ${o.items.map((i) => `<div class="sum-row"><span>${esc(i.name)} × ${i.qty}</span><b>${fmt(i.price * i.qty)}</b></div>`).join('')}
        <div class="sum-row total"><span>Total paid</span><b>${fmt(o.total)}</b></div>
      </div>
      <div class="hero-cta" style="justify-content:center"><a class="btn btn-accent btn-lg" href="#/shop">Continue shopping</a><a class="btn btn-light btn-lg" href="#/account">View my orders</a></div>
    </div></section>`;
  };

  pages.wishlist = () => {
    const list = state.wish.map(byId).filter(Boolean);
    return `${head('Wishlist', list.length + ' saved item' + (list.length === 1 ? '' : 's'), ['Wishlist'])}<section class="section tight"><div class="container">${list.length ? grid(list) : `<div class="empty"><span class="emoji xl">💛</span><h3>Your wishlist is empty</h3><p>Tap the heart on any product to save it here.</p><a class="btn btn-accent btn-lg" href="#/shop">Browse products</a></div>`}</div></section>`;
  };

  pages.account = (tab) => {
    if (state.user) {
      const rows = state.orders.map((o) => `<tr><td><b>${o.id}</b></td><td>${o.date}</td><td>${o.items.reduce((a, i) => a + i.qty, 0)}</td><td><b>${fmt(o.total)}</b></td><td><span class="badge">${o.status}</span></td></tr>`).join('');
      return `
      ${head('My account', '', ['Account'])}
      <section class="section tight"><div class="container two-col">
        <aside class="card-box"><div class="profile"><span class="avatar lg">${esc(state.user.name[0] || 'U').toUpperCase()}</span><div><b>${esc(state.user.name)}</b><small class="muted">${esc(state.user.email)}</small></div></div>
          <button class="btn btn-light btn-block" data-action="signout">Sign out</button></aside>
        <div class="card-box"><h3>Order history</h3>${rows ? `<div class="table-wrap"><table><thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="muted">No orders yet. <a href="#/shop">Start shopping</a></p>`}</div>
      </div></section>`;
    }
    const reg = tab === 'register';
    return `
    ${head(reg ? 'Create account' : 'Sign in', 'Demo only. No real account is created and nothing leaves your browser.', ['Account'])}
    <section class="section tight"><div class="container narrow">
      <div class="card-box">
        <div class="seg"><a href="#/account" class="${reg ? '' : 'on'}">Sign in</a><a href="#/account/register" class="${reg ? 'on' : ''}">Create account</a></div>
        <form data-form="auth" data-mode="${reg ? 'register' : 'login'}">
          ${reg ? '<div class="field"><label>Full name</label><input name="name" required placeholder="Jane Doe"></div>' : ''}
          <div class="field"><label>Email</label><input name="email" type="email" required placeholder="you@example.com"></div>
          <div class="field"><label>Password</label><input name="password" type="password" required minlength="6" placeholder="At least 6 characters"></div>
          <button class="btn btn-dark btn-lg btn-block">${reg ? 'Create account' : 'Sign in'}</button>
        </form>
      </div>
    </div></section>`;
  };

  pages.about = () => `
    ${head('About Aurelia', 'Everyday essentials, made to last.', ['About'])}
    <section class="section"><div class="container about">
      <div><h2>Our story</h2><p class="lead">Aurelia started with a simple idea: buy less, but buy better. We design timeless pieces for your wardrobe and your home, work directly with small workshops and keep our prices honest.</p>
        <p>Every product is tested by our own team before it reaches the shop. If something is not right, we make it right, with free returns for 30 days.</p></div>
      <div class="stats"><div><b>2019</b><small>Founded</small></div><div><b>12k+</b><small>Customers</small></div><div><b>40+</b><small>Small workshops</small></div><div><b>4.8</b><small>Average rating</small></div></div>
    </div></section>
    <section class="section alt"><div class="container"><div class="section-head"><h2>What we believe in</h2></div>
      <div class="values"><div class="card-box"><h3>Quality first</h3><p>Durable materials and careful finishing, so pieces look good for years.</p></div><div class="card-box"><h3>Fair prices</h3><p>No inflated markups. You pay for the product, not for the label.</p></div><div class="card-box"><h3>Responsible making</h3><p>Small batches, less waste, and packaging that is easy to recycle.</p></div></div></div></section>`;

  pages.contact = () => `
    ${head('Contact us', 'We usually reply within one business day.', ['Contact'])}
    <section class="section tight"><div class="container two-col">
      <form class="card-box" data-form="contact"><h3>Send us a message</h3>
        <div class="form-grid"><div class="field"><label>Name</label><input required placeholder="Jane Doe"></div><div class="field"><label>Email</label><input type="email" required placeholder="you@example.com"></div></div>
        <div class="field"><label>Subject</label><select><option>Order question</option><option>Returns</option><option>Product advice</option><option>Something else</option></select></div>
        <div class="field"><label>Message</label><textarea required rows="5" placeholder="How can we help?"></textarea></div>
        <button class="btn btn-dark btn-lg">Send message</button></form>
      <aside class="card-box"><h3>Get in touch</h3>
        <div class="contact-row">${icon('mail', 20)}<div><b>Email</b><small>hello@aurelia.example</small></div></div>
        <div class="contact-row">${icon('phone', 20)}<div><b>Phone</b><small>+1 (555) 010-2020</small></div></div>
        <div class="contact-row">${icon('pin', 20)}<div><b>Studio</b><small>123 Market Street, Your City</small></div></div>
        <p class="muted" style="margin-top:14px">Sample details. Replace them with your own.</p></aside>
    </div></section>`;

  pages.faq = () => {
    const groups = [...new Set(FAQ.map((f) => f[0]))].map((g) => `<h3 class="faq-group">${g}</h3>${FAQ.filter((f) => f[0] === g).map((f) => `<details class="acc"><summary>${f[1]}</summary><p>${f[2]}</p></details>`).join('')}`).join('');
    return `${head('Frequently asked questions', 'Quick answers about orders, shipping and returns.', ['FAQ'])}<section class="section tight"><div class="container narrow">${groups}<div class="card-box center" style="margin-top:28px"><h3>Still have questions?</h3><a class="btn btn-dark" href="#/contact">Contact us</a></div></div></section>`;
  };

  const legal = (title, body) => `${head(title, 'Sample text. Replace it with your own policy before going live.', [title])}<section class="section tight"><div class="container narrow card-box">${body}</div></section>`;
  pages.privacy = () => legal('Privacy policy', '<h3>What we collect</h3><p>This demo stores your cart, wishlist and demo account only in your own browser. Nothing is sent to a server.</p><h3>Your choices</h3><p>You can clear this data at any time by clearing your browser storage.</p>');
  pages.terms = () => legal('Terms of service', '<h3>Using this site</h3><p>This is a free template. Products, prices and orders shown here are fictional and no payment is processed.</p><h3>Returns</h3><p>Describe your real return and refund terms here.</p>');
  pages.notfound = () => `<section class="section"><div class="container narrow center"><div class="empty"><span class="emoji xl">🧭</span><h1>Page not found</h1><p>The page you are looking for does not exist.</p><a class="btn btn-accent btn-lg" href="#/">Back to home</a></div></div></section>`;

  /* ---------- Router ---------- */
  const TITLES = { shop: 'Shop', product: 'Product', cart: 'Cart', checkout: 'Checkout', success: 'Order confirmed', wishlist: 'Wishlist', account: 'Account', about: 'About', contact: 'Contact', faq: 'FAQ', privacy: 'Privacy policy', terms: 'Terms of service' };
  function render() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    let key = parts[0] || 'home';
    if (!pages[key]) key = 'notfound';
    if (key !== 'shop') state.shop.q = '';
    heroIdx = 0;
    const html = pages[key](parts[1]);
    if (html === '' && key === 'checkout') return;
    $('#view').innerHTML = html;
    document.title = (TITLES[key] ? TITLES[key] + ' | ' : '') + 'Aurelia';
    $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === key));
    closeUI();
    hydrate();
    window.scrollTo(0, 0);
  }

  /* ---------- Cart actions, drawer, badges ---------- */
  function badges() {
    $('#cartCount').textContent = cartCount();
    $('#cartCount').hidden = cartCount() === 0;
    $('#wishCount').textContent = state.wish.length;
    $('#wishCount').hidden = state.wish.length === 0;
  }
  function renderDrawer() {
    const ls = lines();
    $('#drawerBody').innerHTML = ls.length ? ls.map(cartLine).join('') : `<div class="empty small"><span class="emoji xl">🛍️</span><p>Your cart is empty.</p></div>`;
    const t = totals(state.ship);
    $('#drawerFoot').innerHTML = ls.length ? `<div class="sum-row total"><span>Subtotal</span><b>${fmt(t.sub)}</b></div><small class="muted">Shipping and discounts are calculated at checkout.</small><a class="btn btn-accent btn-lg btn-block" href="#/checkout" style="margin-top:12px">Checkout</a><a class="btn btn-light btn-block" href="#/cart" style="margin-top:10px">View cart</a>` : '';
    hydrate($('#drawer'));
  }
  function refreshCartViews() {
    save(); badges(); renderDrawer();
    if (location.hash === '#/cart') render();
  }
  function addToCart(id, size, color, qty) {
    const p = byId(id);
    const ex = state.cart.find((c) => c.id === p.id && c.size === size && c.color === color);
    if (ex) ex.qty += qty; else state.cart.push({ id: p.id, size, color, qty });
    save(); badges(); renderDrawer();
    openDrawer();
  }
  const openDrawer = () => { document.body.classList.add('drawer-open'); };
  function closeUI() { document.body.classList.remove('drawer-open', 'nav-open'); }
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  /* ---------- Hero slider ---------- */
  let heroIdx = 0, heroPause = false;
  function heroGo(n) {
    const t = $('#heroTrack');
    if (!t) return;
    const total = t.children.length;
    heroIdx = (n + total) % total;
    t.style.transform = 'translateX(-' + heroIdx * 100 + '%)';
    $$('#heroDots .dot').forEach((d, i) => d.classList.toggle('on', i === heroIdx));
  }
  setInterval(() => { if (!heroPause && $('#heroTrack')) heroGo(heroIdx + 1); }, 6000);
  document.addEventListener('mouseover', (e) => { heroPause = !!e.target.closest('#hero'); });

  /* ---------- Events ---------- */
  const actions = {
    'cart-open': openDrawer,
    car: (el) => { const c = el.closest('.section').querySelector('.carousel'); c.scrollBy({ left: Number(el.dataset.d) * (c.firstElementChild.offsetWidth + 24) * 2, behavior: 'smooth' }); },
    hero: (el) => heroGo(heroIdx + Number(el.dataset.d)),
    'hero-go': (el) => heroGo(Number(el.dataset.n)),
    'ui-close': closeUI,
    'nav-toggle': () => document.body.classList.toggle('nav-open'),
    'quick-add': (el) => { const p = byId(el.dataset.id); addToCart(p.id, '', p.colors[0] || '', 1); toast('Added ' + p.name + ' to your cart'); },
    wish: (el) => {
      const id = Number(el.dataset.id), i = state.wish.indexOf(id);
      if (i > -1) state.wish.splice(i, 1); else state.wish.push(id);
      save(); badges();
      $$('[data-action="wish"][data-id="' + id + '"]').forEach((b) => { b.classList.toggle('on', i === -1); b.classList.toggle('wished', i === -1); });
      if (location.hash === '#/wishlist') render();
      toast(i === -1 ? 'Saved to your wishlist' : 'Removed from your wishlist');
    },
    'pick-color': (el) => { state.sel.color = el.dataset.color; $$('.swatch').forEach((s) => s.classList.toggle('on', s === el)); $('#colorName').textContent = el.dataset.color; },
    'pick-size': (el) => { state.sel.size = el.dataset.size; $$('.size').forEach((s) => s.classList.toggle('on', s === el)); $('#sizeHint').textContent = ''; },
    'sel-qty': (el) => { state.sel.qty = Math.min(10, Math.max(1, state.sel.qty + Number(el.dataset.d))); $('#selQty').textContent = state.sel.qty; },
    'add-detail': (el) => {
      const p = byId(el.dataset.id);
      if (p.sizes.length && !state.sel.size) { $('#sizeHint').textContent = 'Please choose a size.'; return; }
      addToCart(p.id, state.sel.size, state.sel.color, state.sel.qty);
    },
    qty: (el) => {
      const c = state.cart[Number(el.dataset.i)];
      if (!c) return;
      c.qty += Number(el.dataset.d);
      if (c.qty < 1) state.cart.splice(Number(el.dataset.i), 1);
      refreshCartViews();
    },
    remove: (el) => { state.cart.splice(Number(el.dataset.i), 1); refreshCartViews(); },
    'clear-filters': () => { state.shop = { cat: 'All', q: '', sort: 'featured', max: 200, sale: false }; if (location.hash === '#/shop') render(); else location.hash = '#/shop'; },
    signout: () => { state.user = null; save(); toast('You have been signed out'); render(); }
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el && actions[el.dataset.action]) { e.preventDefault(); actions[el.dataset.action](el, e); return; }
    if (e.target.closest('.drawer a, .nav a')) closeUI();
  });

  document.addEventListener('input', (e) => {
    const f = e.target.dataset && e.target.dataset.filter;
    if (!f) return;
    if (f === 'ship') { state.ship = e.target.value; $('#checkoutSummary').innerHTML = summaryHTML(false); return; }
    const s = state.shop;
    if (f === 'max') { s.max = Number(e.target.value); $('#maxLabel').textContent = price(s.max); }
    if (f === 'sale') s.sale = e.target.checked;
    if (f === 'q') s.q = e.target.value;
    if (f === 'sort') s.sort = e.target.value;
    $('#shopResults').innerHTML = shopResults();
    hydrate($('#shopResults'));
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    const kind = form.dataset.form, d = new FormData(form);
    if (kind === 'newsletter') { toast('Thanks for subscribing!'); form.reset(); }
    if (kind === 'contact') { toast('Message sent. We will reply soon.'); form.reset(); }
    if (kind === 'promo') {
      const code = String(d.get('code') || '').trim().toUpperCase();
      if (code === 'AURELIA10') { state.promo = code; toast('Promo code applied: 10% off'); }
      else if (!code) { state.promo = ''; toast('Promo code removed'); }
      else toast('That code is not valid');
      save();
      $('#cartSummary').innerHTML = summaryHTML(true);
    }
    if (kind === 'auth') {
      const email = String(d.get('email')), name = d.get('name') || email.split('@')[0];
      state.user = { name: String(name), email };
      save(); toast('Welcome, ' + state.user.name + '!'); location.hash = '#/account'; render();
    }
    if (kind === 'checkout') {
      const t = totals(d.get('ship'));
      const order = {
        id: 'AUR-' + Math.floor(10000 + Math.random() * 89999),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        email: String(d.get('email')),
        status: 'Processing',
        total: t.total,
        items: lines().map((l) => ({ name: l.p.name, qty: l.qty, price: l.p.price }))
      };
      state.orders.unshift(order);
      state.cart = []; state.promo = ''; state.ship = 'standard';
      save(); badges(); renderDrawer();
      location.hash = '#/success';
    }
  });

  $('#siteSearch').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    state.shop = { cat: 'All', q: e.target.value, sort: 'featured', max: 200, sale: false };
    e.target.value = '';
    if (location.hash === '#/shop') render(); else location.hash = '#/shop';
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeUI(); });

  /* ---------- Countdown (until local midnight) ---------- */
  setInterval(() => {
    const box = $('#countdown');
    if (!box) return;
    const now = new Date(), end = new Date(now);
    end.setHours(24, 0, 0, 0);
    const s = Math.max(0, Math.floor((end - now) / 1000));
    const v = { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
    $$('[data-cd]', box).forEach((n) => { n.textContent = String(v[n.dataset.cd]).padStart(2, '0'); });
  }, 1000);

  window.addEventListener('hashchange', render);
  badges();
  renderDrawer();
  hydrate();
  render();
})();
