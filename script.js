(function () {
  'use strict';
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-nav');
  function setNav(open, restoreFocus = false) {
    if (!header || !toggle) return;
    header.classList.toggle('nav-open', open); document.body.classList.toggle('nav-is-open', open);
    toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    if (restoreFocus) toggle.focus();
  }
  toggle?.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', event => {if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setNav(false, true); if (event.key === 'Tab' && toggle?.getAttribute('aria-expanded') === 'true') {const nodes = [...header.querySelectorAll('a,button')].filter(node => node.offsetParent !== null); const first = nodes[0], last = nodes[nodes.length - 1]; if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();} else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}}});
  window.addEventListener('resize', () => {if (window.innerWidth > 900) setNav(false);}, {passive: true});
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stage = document.querySelector('.experience-stage');
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      header?.classList.toggle('is-scrolled', window.scrollY > 15);
      if (stage && !reduced.matches && window.innerWidth > 900) {
        const rect = stage.getBoundingClientRect();
        const shift = Math.max(-12, Math.min(12, (window.innerHeight / 2 - rect.top - rect.height / 2) * .03));
        stage.style.setProperty('--stage-lift', shift + 'px');
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive: true}); onScroll();
  const image = document.querySelector('#experience-image');
  if (!image) return;
  const options = [...document.querySelectorAll('[data-taste]')];
  const descriptions = {
    nigiri: {id: 'nigiri-salmao', word: 'SAKE', kanji: '鮨', name: 'Nigiri de salmão', text: 'O brilho do salmão. A delicadeza do arroz. Um encontro de texturas que faz a próxima mordida começar na imaginação.', note: 'SALMÃO, SHARI E O EQUILÍBRIO DO ESSENCIAL.', detail: 'Textura que convida.\nUm sabor de cada vez.'},
    temaki: {id: 'temaki-salmao', word: 'TEMAKI', kanji: '巻', name: 'Temaki de salmão', text: 'A textura da alga. O frescor do pepino. A maciez do salmão. Um pequeno cone, com vontade de uma grande primeira mordida.', note: 'NORI, ARROZ E UM ENCONTRO DE TEXTURAS.', detail: 'Delicadeza que envolve.\nSabor que permanece.'},
    ebi: {id: 'ebi-tempura', word: 'TEMPURA', kanji: '天', name: 'Ebi tempura', text: 'Imagine o som da casquinha dourada. Depois, a delicadeza do camarão. O primeiro encontro entre crocância e maciez.', note: 'CAMARÃO E O DOURADO DE UMA MASSA LEVE.', detail: 'A primeira mordida\ntambém se ouve.'},
    uramaki: {id: 'roll', word: 'MAKI', kanji: '巻', name: 'Uramaki de salmão', text: 'Grãos de arroz, o perfume do gergelim e o encontro do salmão com o pepino. Uma pequena peça para saborear cada detalhe.', note: 'ARROZ, NORI, GERGELIM E FRESCOR.', detail: 'Pequenos detalhes.\nMuitos encontros.'}
  };
  let selected = 'nigiri', timer, products = window.NakaCurrent?.products || window.NakaDB.defaults.products;
  function applyTaste(key) {
    const info = descriptions[key], product = products.find(p => p.id === info.id);
    image.src = product ? window.NakaDB.photoSource(product) : new URL('assets/food/' + key + '.webp', window.NakaDB.siteRoot).href;
    image.alt = (product?.name || info.name) + ', composição ilustrativa sem fundo';
    image.className = 'experience-image taste-' + key;
    document.querySelector('#stage-word').textContent = info.word;
    document.querySelector('#stage-kanji').textContent = info.kanji;
    document.querySelector('#taste-name').textContent = product?.name || info.name;
    document.querySelector('#taste-note').textContent = info.note;
    document.querySelector('#stage-detail').textContent = info.detail;
    document.querySelector('#experience-description').textContent = info.text;
    const link = document.querySelector('#experience-link'); link.href = product ? window.NakaDB.productUrl(product) : new URL('cardapio/', window.NakaDB.siteRoot).href;
    const svg = link.querySelector('svg'); link.replaceChildren(document.createTextNode(product ? 'Conheça ' + (key === 'ebi' ? 'o ebi tempura' : key === 'temaki' ? 'o temaki de salmão' : key === 'uramaki' ? 'o uramaki de salmão' : 'o nigiri de salmão') + ' ' : 'Explore outros sabores ')); if (svg) link.append(svg);
    stage.classList.remove('is-changing');
  }
  function selectTaste(key, animate = true) {
    selected = key; clearTimeout(timer);
    options.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.taste === key)));
    if (animate && !reduced.matches) {stage.classList.add('is-changing'); timer = setTimeout(() => applyTaste(key), 190);}
    else applyTaste(key);
  }
  options.forEach(button => button.addEventListener('click', () => selectTaste(button.dataset.taste)));
  selectTaste(selected, false);
  window.addEventListener('naka:content', event => {products = event.detail.products; selectTaste(selected, false);});
})();
