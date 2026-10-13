(function () {
  'use strict';
  const defaults = structuredClone(window.NakaCatalog);
  const categories = Object.keys(defaults.categoryNames);
  const images = Object.keys(defaults.assets);
  const siteRoot = new URL('.', document.currentScript.src);
  const legacyProducts = {
    naka: {name: 'Combinado Naka', price: 129, description: '32 peças entre sushis, sashimis e rolls. Nossa seleção para dois.', details: '32 PEÇAS · SERVE 2 PESSOAS', badge: 'PARA COMPARTILHAR', category: 'combinados', image: 'combinado'},
    roll: {name: 'Roll especial da casa', price: 42, description: 'Salmão, cream cheese, toque crocante e finalização com ovas.', details: '8 PEÇAS · FEITO NA HORA', badge: 'O QUERIDINHO DA CASA', category: 'rolls', image: 'rolls'},
    teishoku: {name: 'Teishoku de salmão', price: 68, description: 'Salmão grelhado, gohan, legumes da estação e missoshiru.', details: 'PRATO INDIVIDUAL · SERVE 1 PESSOA', badge: 'CONFORTO JAPONÊS', category: 'quentes', image: 'teishoku'}
  };
  const legacyContact = {address: 'Rua das Cerejeiras, 128 · Santa Tereza\nBelo Horizonte, MG', hours: 'Terça a quinta · 18h às 23h\nSexta e sábado · 18h à meia-noite\nDomingo · 12h às 22h', phone: '(31) 3333-0128', email: 'oi@sushinaka.example'};
  let connection;

  function valid(data) {
    return !!(data && Array.isArray(data.products) && new Set(data.products.map(p => p?.id)).size === data.products.length && data.products.every(p =>
      p && typeof p.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(p.id) && typeof p.name === 'string' && p.name.trim() &&
      (p.price === null || (Number.isFinite(p.price) && p.price >= 0)) && categories.includes(p.category) && images.includes(p.image) &&
      (!p.photo || (typeof p.photo === 'string' && p.photo.length < 2000000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p.photo))) &&
      ['description', 'details', 'badge'].every(k => typeof p[k] === 'string') &&
      ['ingredients', 'allergens'].every(k => p[k] === undefined || (Array.isArray(p[k]) && p[k].every(v => typeof v === 'string')))) &&
      data.contact && ['address', 'hours', 'phone', 'email'].every(k => typeof data.contact[k] === 'string'));
  }

  function migrate(input) {
    if (!input) return structuredClone(defaults);
    if (input.schemaVersion === 2) return input;
    const data = structuredClone(input);
    if (!Array.isArray(data.products) || !data.contact) throw new Error('Conteúdo local inválido.');
    data.products = data.products.map(p => {
      const original = legacyProducts[p.id], current = defaults.products.find(d => d.id === p.id);
      if (!current) return p;
      const untouched = original && !p.photo && Object.entries(original).every(([k, v]) => p[k] === v);
      return untouched ? structuredClone(current) : {...structuredClone(current), ...p};
    });
    for (const p of defaults.products) if (!data.products.some(d => d.id === p.id)) data.products.push(structuredClone(p));
    for (const [key, previous] of Object.entries(legacyContact)) if (data.contact[key] === previous) data.contact[key] = defaults.contact[key];
    data.schemaVersion = 2;
    return data;
  }

  function open() {
    if (!connection) connection = new Promise((resolve, reject) => {
      if (!window.indexedDB) {reject(new Error('Banco local indisponível neste navegador.')); return;}
      const request = indexedDB.open('sushi-naka-local', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('content');
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Feche outras abas do painel e tente novamente.'));
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {db.close(); connection = null;};
        resolve(db);
      };
    }).catch(error => {connection = null; throw error;});
    return connection;
  }

  async function transaction(change) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('content', 'readwrite'), store = tx.objectStore('content'), request = store.get('site');
      let data, failure;
      request.onsuccess = () => {
        try {
          data = migrate(request.result);
          if (change) change(data);
          if (!valid(data)) throw new Error('Dados inválidos. Confira os campos do produto.');
          store.put(data, 'site');
        } catch (error) {failure = error; tx.abort();}
      };
      tx.oncomplete = () => resolve(data);
      tx.onerror = () => reject(failure || tx.error || new Error('Não foi possível salvar.'));
      tx.onabort = () => reject(failure || new Error('Não foi possível salvar o conteúdo local.'));
    });
  }

  function photoSource(product) {return product.photo || new URL((defaults.assets[product.image] || defaults.assets['combinado-novo']).replace(/\.png$/, '.webp'), siteRoot).href;}
  function sceneSource(product) {return product.scene ? new URL('assets/scenes/' + product.scene + '.webp', siteRoot).href : null;}
  function productUrl(product) {
    const fixed = defaults.products.find(p => p.id === product.id);
    if (fixed) return new URL('cardapio/' + fixed.slug + '/', siteRoot).href;
    const url = new URL('prato/', siteRoot); url.searchParams.set('id', product.id); return url.href;
  }
  function money(price) {return price === null ? 'Consulte a casa' : new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(price);}
  function filterProducts(products, category, query) {
    const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
    const search = normalize(query || '').trim();
    return products.filter(p => (category === 'todos' || category === p.category) && (!search || normalize([p.name, p.description, ...(p.ingredients || [])].join(' ')).includes(search)));
  }
  window.NakaDB = {read: () => transaction(), update: transaction, defaults, categories, images, siteRoot, photoSource, sceneSource, productUrl, money, filterProducts, valid, migrate};
})();
