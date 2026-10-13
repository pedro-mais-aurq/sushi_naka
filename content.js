(function () {
  'use strict';
  const DB = window.NakaDB;
  const page = document.body.dataset.page;
  const root = DB.siteRoot;
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
  let state = structuredClone(DB.defaults);
  let category = 'todos', query = '';
  const filterButtons = [...document.querySelectorAll('[data-category]')];
  const search = document.querySelector('#menu-query');
  const order = DB.defaults.menuOrder || DB.categories;
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function setText(selector, text) {const node = document.querySelector(selector); if (node) node.textContent = text || '';}
  function arrowNode() {const span = element('span', undefined, 'inline-arrow'); span.innerHTML = arrow; return span;}
  function createCard(p) {
    const card = element('a', undefined, 'dish-card'); card.href = DB.productUrl(p); card.dataset.product = p.id;
    const photo = element('div', undefined, 'dish-image');
    const image = element('img'); image.src = DB.photoSource(p); image.alt = p.name + ', apresentação ilustrativa'; image.loading = 'lazy'; image.decoding = 'async'; image.width = 480; image.height = 360;
    const hint = element('span', 'Conhecer o prato', 'dish-discover'); hint.append(arrowNode()); photo.append(image, hint);
    const copy = element('div', undefined, 'dish-copy');
    const japanese = element('p', p.japanese || '', 'dish-japanese'); japanese.lang = 'ja';
    const top = element('div', undefined, 'dish-top'); const direction = element('span', '↗', 'dish-arrow'); direction.setAttribute('aria-hidden', 'true');
    top.append(element('h3', p.name), direction);
    copy.append(japanese, top, element('p', p.description, 'dish-description'), element('span', DB.money(p.price), 'dish-price'));
    card.append(photo, copy); return card;
  }
  function renderContact() {
    const contact = document.querySelector('#contact-details');
    const data = state.contact;
    let digits = data.phone.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) digits = '55' + digits;
    document.querySelectorAll('[data-phone-link]').forEach(a => {a.href = 'tel:+' + digits;});
    document.querySelectorAll('[data-map-link]').forEach(a => {
      const url = new URL('https://www.google.com/maps/search/'); url.searchParams.set('api', '1'); url.searchParams.set('query', 'Sushi Naka ' + data.address.replace(/\n/g, ' ')); a.href = url.href;
    });
    if (!contact) return;
    contact.replaceChildren();
    for (const [title, text] of [['ONDE ESTAMOS', data.address], ['QUANDO NOS ENCONTRAMOS', data.hours], ['FALE COM A CASA', data.phone]]) {
      const box = element('div'), p = element('p');
      if (title === 'FALE COM A CASA') {
        const link = element('a', text); link.href = 'tel:+' + digits; p.append(link);
        if (data.email) {p.append(document.createElement('br')); const email = element('a', data.email); email.href = 'mailto:' + data.email; p.append(email);}
      } else p.textContent = text;
      box.append(element('span', title), p); contact.append(box);
    }
  }
  function readQuery() {
    const params = new URLSearchParams(window.location.search);
    category = DB.categories.includes(params.get('categoria')) ? params.get('categoria') : 'todos';
    query = params.get('q') || '';
    if (search) search.value = query;
  }
  function saveQuery() {
    const url = new URL(window.location.href);
    if (category === 'todos') url.searchParams.delete('categoria'); else url.searchParams.set('categoria', category);
    if (query.trim()) url.searchParams.set('q', query.trim()); else url.searchParams.delete('q');
    try {window.history.replaceState(null, '', url);} catch (_) { /* file:// também mantém os filtros locais. */ }
  }
  function renderMenu() {
    const results = document.querySelector('#menu-results');
    if (!results) return;
    const selected = DB.filterProducts(state.products, category, query);
    results.replaceChildren();
    for (const c of order) {
      const group = selected.filter(p => p.category === c);
      if (!group.length) continue;
      const section = element('section', undefined, 'menu-row'); section.dataset.row = c; section.setAttribute('aria-labelledby', 'row-' + c);
      const heading = element('div', undefined, 'row-heading');
      const h2 = element('h2', DB.defaults.categoryNames[c]); h2.id = 'row-' + c;
      const japanese = element('span', DB.defaults.categoryJapanese[c], 'row-japanese'); japanese.lang = 'ja';
      heading.append(element('span', '0' + (order.indexOf(c) + 1), 'row-number'), h2, element('p', DB.defaults.categoryCopy[c]), japanese);
      const grid = element('div', undefined, 'dish-grid'); group.forEach(p => grid.append(createCard(p)));
      section.append(heading, grid); results.append(section);
    }
    filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    const length = selected.length;
    setText('#menu-count', length + (length === 1 ? ' sabor para descobrir' : ' sabores para descobrir'));
    document.querySelector('#menu-empty').hidden = length !== 0;
    document.querySelector('#reset-menu').hidden = category === 'todos' && !query;
    document.querySelector('#clear-query').hidden = !query;
  }
  function resetMenu() {category = 'todos'; query = ''; if (search) search.value = ''; saveQuery(); renderMenu();}
  function renderHome() {
    const grid = document.querySelector('#featured-products');
    if (!grid) return;
    let featured = state.products.filter(p => p.featured).slice(0, 4);
    if (!featured.length) featured = state.products.slice(0, 4);
    grid.replaceChildren();
    featured.forEach(p => grid.append(createCard(p)));
    if (!state.products.length) grid.append(element('p', 'O cardápio está sendo atualizado. Fale com a casa para conhecer os sabores disponíveis.', 'body-copy'));
  }
  function renderProduct() {
    if (page !== 'product') return;
    const id = document.body.dataset.productId || new URLSearchParams(window.location.search).get('id');
    const p = state.products.find(item => item.id === id);
    const content = document.querySelector('#product-content');
    const unavailable = document.querySelector('#product-unavailable');
    content.hidden = !p; unavailable.hidden = !!p;
    if (!p) {document.title = 'Prato indisponível · Sushi Naka'; return;}
    document.title = p.name + ' · Sushi Naka';
    document.querySelector('meta[name="description"]').content = p.description;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = p.description;
    const image = document.querySelector('#product-image'); image.src = DB.photoSource(p); image.alt = p.name + ', apresentação ilustrativa';
    const values = {'#product-category': DB.defaults.categoryNames[p.category], '#product-badge': p.badge, '#product-title': p.name, '#product-japanese': p.japanese, '#product-description': p.description, '#product-portion': p.details, '#product-price': DB.money(p.price), '#product-story': p.story || p.description, '.product-kanji': p.japanese};
    Object.entries(values).forEach(([selector, value]) => setText(selector, value));
    const back = document.querySelector('.product-breadcrumb .back-link'); const backURL = new URL('cardapio/', root); backURL.searchParams.set('categoria', p.category); back.href = backURL.href;
    const ingredients = document.querySelector('#product-ingredients'); ingredients.replaceChildren();
    (p.ingredients || []).forEach(value => ingredients.append(element('li', value)));
    ingredients.closest('.product-ingredients').hidden = !(p.ingredients || []).length && !(p.allergens || []).length;
    setText('#product-allergens', (p.allergens || []).join(', ')); document.querySelector('#allergen-block').hidden = !(p.allergens || []).length;
    let related = state.products.filter(q => q.id !== p.id && q.category === p.category).slice(0, 3);
    if (related.length < 3) related = related.concat(state.products.filter(q => q.id !== p.id && !related.some(r => r.id === q.id)).slice(0, 3 - related.length));
    const grid = document.querySelector('#related-products'); grid.replaceChildren(); related.forEach(q => grid.append(createCard(q)));
    grid.closest('.related').hidden = !related.length;
  }
  function render() {window.NakaCurrent = state; renderContact(); renderHome(); renderMenu(); renderProduct(); window.dispatchEvent(new CustomEvent('naka:content', {detail: state}));}
  async function refresh() {
    try {state = await DB.read();}
    catch (_) { /* As páginas já possuem conteúdo estático e continuam funcionais sem IndexedDB. */ }
    render();
  }
  if (page === 'menu') {
    readQuery();
    filterButtons.forEach(button => button.addEventListener('click', () => {category = button.dataset.category; saveQuery(); renderMenu();}));
    search.addEventListener('input', () => {query = search.value; saveQuery(); renderMenu();});
    document.querySelector('#clear-query').addEventListener('click', () => {query = ''; search.value = ''; saveQuery(); renderMenu(); search.focus();});
    document.querySelectorAll('#reset-menu,[data-reset-menu]').forEach(button => button.addEventListener('click', resetMenu));
    window.addEventListener('popstate', () => {readQuery(); renderMenu();});
  }
  refresh();
  window.addEventListener('pageshow', event => {if (event.persisted) {if (page === 'menu') readQuery(); refresh();}});
  window.addEventListener('focus', refresh);
})();
