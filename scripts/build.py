#!/usr/bin/env python3
"""Gera páginas estáticas reais e a pasta dist, sem dependências externas."""
from pathlib import Path
from html import escape
import json, shutil
ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / 'catalog.json').read_text())
ORDER = ['entradas', 'rolls', 'combinados', 'quentes']
DATA['menuOrder'] = ORDER
(ROOT / 'catalog.js').write_text('window.NakaCatalog = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n')
ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>'
BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m6-7-7 7 7 7"/></svg>'


def header(r, page='home'):
    active = ' aria-current="page"' if page == 'menu' else ''
    return f'''<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<header class="site-header"><a class="brand" href="{r}index.html" aria-label="Sushi Naka, início"><img class="brand-logo" src="{r}assets/logo.png" alt="" width="58" height="58"><span>SUSHI NAKA<small>COZINHA JAPONESA · DESDE 1987</small></span></a>
<button class="nav-toggle" type="button" aria-label="Abrir menu de navegação" aria-expanded="false" aria-controls="primary-nav"><span></span><span></span></button>
<nav class="primary-nav" id="primary-nav" aria-label="Navegação principal"><a href="{r}cardapio/"{active}>Cardápio</a><a href="{r}index.html#tradicao">Nossa tradição</a><a href="{r}index.html#visita">Visite o Naka</a></nav><a class="button button-small header-cta" href="{r}index.html#visita">Venha à mesa {ARROW}</a></header>'''


def footer(r):
    return f'''<footer class="site-footer"><a class="brand" href="{r}index.html"><img class="brand-logo" src="{r}assets/logo.png" alt="" width="58" height="58"><span>SUSHI NAKA<small>COZINHA JAPONESA · DESDE 1987</small></span></a><p>Uma história de família.<br>Um encontro com o Japão.</p><div><a href="{r}cardapio/">Explorar o cardápio {ARROW}</a><small>© 2026 Sushi Naka · <a href="{r}admin/">Administrar</a></small></div></footer>'''


def shell(title, description, body, r='', page='home', product_id=''):
    identifier = f' data-product-id="{escape(product_id)}"' if product_id else ''
    return f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#bd171d"><meta name="description" content="{escape(description)}"><title>{escape(title)}</title><link rel="icon" href="{r}assets/favicon.png" type="image/png"><link rel="stylesheet" href="{r}style.css"><meta property="og:title" content="{escape(title)}"><meta property="og:description" content="{escape(description)}"><meta property="og:type" content="website"></head>
<body data-page="{page}"{identifier}>{header(r, page)}<main id="conteudo">{body}</main>{footer(r)}<script src="{r}catalog.js"></script><script src="{r}database.js"></script><script src="{r}content.js"></script><script src="{r}script.js"></script></body></html>'''


def card(p, r):
    return f'''<a class="dish-card" href="{r}cardapio/{p['slug']}/" data-product="{p['id']}"><div class="dish-image"><img src="{r}{DATA['assets'][p['image']].replace('.png','.webp')}" alt="{escape(p['name'])}, apresentação ilustrativa" loading="lazy" decoding="async" width="480" height="360"><span class="dish-discover">Conhecer o prato {ARROW}</span></div><div class="dish-copy"><p class="dish-japanese" lang="ja">{p['japanese']}</p><div class="dish-top"><h3>{escape(p['name'])}</h3><span class="dish-arrow" aria-hidden="true">↗</span></div><p class="dish-description">{escape(p['description'])}</p><span class="dish-price">Consulte a casa</span></div></a>'''


def rows(products, r):
    result = ''
    for i, category in enumerate(ORDER):
        group = [p for p in products if p['category'] == category]
        if not group:
            continue
        result += f'''<section class="menu-row" data-row="{category}" aria-labelledby="row-{category}"><div class="row-heading"><span class="row-number">0{i+1}</span><h2 id="row-{category}">{DATA['categoryNames'][category]}</h2><p>{DATA['categoryCopy'][category]}</p><span class="row-japanese" lang="ja">{DATA['categoryJapanese'][category]}</span></div><div class="dish-grid">{''.join(card(p,r) for p in group)}</div></section>'''
    return result


home = f'''
<section class="hero" id="inicio" aria-labelledby="hero-title"><img class="hero-image" src="assets/hero-naka.webp" alt="Ilustração Sushi Naka: temaki, hashis e um círculo vermelho sobre papel creme" width="2048" height="684" fetchpriority="high"><div class="hero-copy"><p class="eyebrow">BELO HORIZONTE · DESDE 1987</p><h1 id="hero-title">Tradição que se<br><em>sente à mesa.</em></h1><p class="intro">Uma história de família. O cuidado japonês em cada corte.<br class="desktop-break"> O prazer de descobrir o sabor em sua essência.</p><div class="actions"><a class="button" href="cardapio/">Descubra o cardápio {ARROW}</a><a class="text-link" href="#tradicao">Conheça nossa história {ARROW}</a></div></div><a class="hero-corner" href="#experiencia"><span class="hero-seal">1987</span><span>RAÍZES JAPONESAS.<br>IDENTIDADE NAKA.</span><span class="scroll-arrow" aria-hidden="true">↓</span></a></section>
<section class="experience section" id="experiencia" aria-labelledby="experience-title"><div class="experience-copy"><p class="eyebrow">01 / ANTES DA PRIMEIRA MORDIDA</p><h2 id="experience-title">O primeiro sabor<br><em>vem pelos olhos.</em></h2><p class="body-copy" id="experience-description">O brilho do salmão. A delicadeza do arroz. Um encontro de texturas que faz a próxima mordida começar na imaginação.</p><a class="text-link" id="experience-link" href="cardapio/nigiri-de-salmao/">Conheça o nigiri de salmão {ARROW}</a><div class="experience-options" role="group" aria-label="Escolha um sabor para explorar"><button type="button" data-taste="nigiri" aria-pressed="true"><small>01</small>Nigiri</button><button type="button" data-taste="temaki" aria-pressed="false"><small>02</small>Temaki</button><button type="button" data-taste="ebi" aria-pressed="false"><small>03</small>Tempura</button><button type="button" data-taste="uramaki" aria-pressed="false"><small>04</small>Maki</button></div></div><div class="experience-stage"><div class="taste-circle" aria-hidden="true"></div><span class="stage-word" id="stage-word" aria-hidden="true">SAKE</span><span class="stage-kanji" id="stage-kanji" lang="ja" aria-hidden="true">鮨</span><img id="experience-image" class="experience-image taste-nigiri" src="assets/food/nigiri.webp" alt="Nigiri de salmão seguro por hashis, com fundo transparente" width="1423" height="1105" loading="lazy"><div class="taste-caption" aria-live="polite"><span id="taste-name">Nigiri de salmão</span><small id="taste-note">SALMÃO, SHARI E O EQUILÍBRIO DO ESSENCIAL.</small></div><span class="stage-detail" id="stage-detail">Textura que convida.<br>Um sabor de cada vez.</span></div></section>
<section class="menu-preview section" id="cardapio" aria-labelledby="preview-title"><div class="section-heading"><div><p class="eyebrow">02 / ENCONTRE O SEU SABOR</p><h2 id="preview-title">Uma escolha.<br><em>Muitos encontros.</em></h2></div><div class="heading-aside"><p>Dos pequenos começos ao conforto de uma tigela.<br>Escolha por onde sua experiência vai começar.</p><a class="text-link" href="cardapio/">Ver o cardápio completo {ARROW}</a></div></div><div class="dish-grid featured-grid" id="featured-products">{''.join(card(p,'') for p in DATA['products'] if p.get('featured'))}</div><p class="menu-disclaimer">Seleção ilustrativa. Consulte a casa para confirmar pratos, porções e valores.</p><div class="menu-invitation"><span class="invitation-japanese" lang="ja">お品書き</span><span>O próximo encontro<br>começa com uma escolha.</span><a class="button" href="cardapio/">Explore todos os sabores {ARROW}</a></div></section>
<section class="tradition" id="tradicao" aria-labelledby="tradition-title"><div class="tradition-date"><span class="eyebrow">UMA HISTÓRIA QUE COMEÇA EM</span><strong>1987</strong><span class="date-japanese" lang="ja">伝統</span><p>Raízes japonesas.<br>Memórias de Belo Horizonte.</p></div><div class="tradition-copy"><p class="eyebrow">03 / A ESSÊNCIA PERMANECE</p><h2 id="tradition-title">De família.<br>De raiz.<br><em>Do jeito Naka.</em></h2><p>A história do Sushi Naka é a história da família Nakao à mesa de Belo Horizonte. Desde 1987, a casa faz da tradição japonesa sua identidade: no cuidado com o corte, nos pratos frios e quentes e no respeito ao ingrediente.</p><p class="tradition-manifesto">Anti-fusion por princípio.<br>Japonesa por essência.</p><p>Aqui, a técnica está a serviço do sabor. O arroz tem seu lugar, o peixe tem sua textura e cada preparo carrega o cuidado de uma cozinha com raízes.</p><a class="text-link light-link" href="cardapio/">Encontre a tradição no cardápio {ARROW}</a></div><div class="tradition-values"><div><h3>Uma história de família</h3><p>A família Nakao faz parte da origem e da identidade da casa.</p></div><div><h3>O ingrediente em primeiro lugar</h3><p>Cortes cuidadosos e equilíbrio entre sabores e texturas.</p></div><div><h3>Fidelidade às raízes</h3><p>Uma proposta anti-fusion, dedicada à cozinha japonesa.</p></div></div></section>
<section class="visit section" id="visita" aria-labelledby="visit-title"><div><p class="eyebrow">04 / O ENCONTRO ACONTECE AQUI</p><h2 id="visit-title">Da nossa história<br><em>para a sua mesa.</em></h2><p class="body-copy">Venha com tempo. Escolha a companhia.<br>Deixe o primeiro sabor acontecer.</p><div class="actions"><a class="button" data-phone-link href="tel:+553132872714">Fale com a casa {ARROW}</a><a class="text-link" data-map-link href="https://www.google.com/maps/search/?api=1&query=Sushi%20Naka%20Avenida%20Afonso%20Pena%202828%20Belo%20Horizonte" target="_blank" rel="noopener noreferrer">Como chegar {ARROW}</a></div></div><div class="visit-details" id="contact-details"><div><span>ONDE ESTAMOS</span><p>Avenida Afonso Pena, 2828 · Savassi<br>Belo Horizonte, MG</p></div><div><span>QUANDO NOS ENCONTRAMOS</span><p>Terça a domingo · 11h às 14h e 18h às 23h<br>Segunda-feira · fechado</p></div><div><span>FALE COM A CASA</span><p><a href="tel:+553132872714">(31) 3287-2714</a></p></div></div></section>'''
(ROOT / 'index.html').write_text(shell('Sushi Naka — Tradição japonesa desde 1987', 'Uma história de família em Belo Horizonte. Conheça a tradição japonesa do Sushi Naka, desde 1987, e explore nosso cardápio.', home))

menu = f'''
<section class="menu-cover section"><div><a class="back-link" href="../index.html">{BACK} Voltar à casa</a><p class="eyebrow">SABORES DO JAPÃO · DESDE 1987</p><h1>O nosso<br><em>cardápio.</em></h1><p>Escolha pelo olhar. Descubra os detalhes.<br>Encontre o sabor do seu próximo encontro.</p></div><div class="menu-cover-art"><span lang="ja" aria-hidden="true">お品書き</span><div class="cover-circle" aria-hidden="true"></div><img src="../assets/food/combinado-novo.webp" alt="Composição ilustrativa de sushis e sashimis" width="1536" height="1024" fetchpriority="high"></div></section>
<section class="menu-catalog section" aria-label="Cardápio completo"><div class="menu-tools"><div class="menu-filters" role="group" aria-label="Filtrar o cardápio">{''.join(f'<button type="button" data-category="{c}" aria-pressed="{str(c=="todos").lower()}" aria-controls="menu-results">{label}</button>' for c,label in [('todos','Todos os sabores')]+[(c,DATA['categoryNames'][c]) for c in ORDER])}</div><div class="menu-search"><label for="menu-query"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg><span class="sr-only">Buscar prato ou ingrediente</span></label><input type="search" id="menu-query" placeholder="Um prato, um ingrediente..." autocomplete="off" aria-controls="menu-results"><button type="button" id="clear-query" aria-label="Limpar busca" hidden>×</button></div></div><div class="menu-result-info"><p id="menu-count" role="status" aria-live="polite">16 sabores para descobrir</p><button class="text-link" id="reset-menu" type="button" hidden>Limpar filtros {BACK}</button><span>CLIQUE EM UM PRATO E CONHEÇA SEUS DETALHES {ARROW}</span></div><div id="menu-results">{rows(DATA['products'],'../')}</div><div class="menu-empty" id="menu-empty" hidden><p class="eyebrow">AINDA HÁ OUTROS SABORES</p><h2>Nenhum prato<br><em>com essa busca.</em></h2><p>Experimente outro ingrediente ou explore o cardápio completo.</p><button class="button" data-reset-menu type="button">Ver todos os sabores {ARROW}</button></div><p class="menu-disclaimer">Imagens e composições ilustrativas. Confirme disponibilidade, ingredientes, porções e valores diretamente com a casa.</p></section><section class="menu-bottom"><p class="eyebrow">UMA CASA COM RAÍZES</p><h2>Desde 1987,<br><em>o encontro tem nome.</em></h2><a class="button button-cream" href="../index.html#visita">Venha ao Sushi Naka {ARROW}</a></section>'''
(ROOT / 'cardapio').mkdir(exist_ok=True)
(ROOT / 'cardapio/index.html').write_text(shell('Cardápio · Sushi Naka', 'Explore o cardápio ilustrado do Sushi Naka. Filtre entradas, sushis, sashimis, combinados e pratos quentes e descubra cada prato.', menu, '../', 'menu'))


def detail(p, r):
    ingredients = ''.join(f'<li>{escape(i)}</li>' for i in p.get('ingredients', []))
    allergens = ', '.join(p.get('allergens', []))
    return f'''<div class="product-content" id="product-content"><div class="product-breadcrumb section"><a class="back-link" href="{r}cardapio/?categoria={p['category']}">{BACK} Voltar ao cardápio</a><span id="product-category">{DATA['categoryNames'][p['category']]}</span></div><section class="product-hero section"><div class="product-art"><div class="product-halo" aria-hidden="true"></div><span class="product-kanji" lang="ja" aria-hidden="true">{p.get('japanese','')}</span><img id="product-image" src="{r}{DATA['assets'][p['image']].replace('.png','.webp')}" alt="{escape(p['name'])}, apresentação ilustrativa" width="1200" height="1000" fetchpriority="high"></div><div class="product-copy"><p class="eyebrow" id="product-badge">{escape(p['badge'])}</p><h1 id="product-title">{escape(p['name'])}</h1><p class="product-japanese" id="product-japanese" lang="ja">{p.get('japanese','')}</p><p class="product-description" id="product-description">{escape(p['description'])}</p><p class="product-portion" id="product-portion">{escape(p['details'])}</p><p class="product-price" id="product-price">Consulte a casa</p><div class="actions"><a class="button" data-phone-link href="tel:+553132872714">Consultar este prato {ARROW}</a><a class="text-link" href="{r}index.html#visita">Venha à mesa {ARROW}</a></div><p class="product-note">Imagens e composições ilustrativas. Confirme ingredientes, porções e valores com o restaurante.</p></div></section><section class="product-story section"><div><p class="eyebrow">O SABOR ESTÁ NOS DETALHES</p><h2>Para conhecer.<br><em>Para saborear.</em></h2><p id="product-story">{escape(p.get('story',p['description']))}</p></div><div class="product-ingredients"><p class="eyebrow">NA COMPOSIÇÃO ILUSTRADA</p><ul id="product-ingredients">{ingredients}</ul><div class="allergens" id="allergen-block"><span>ALÉRGENOS DA COMPOSIÇÃO</span><p id="product-allergens">{escape(allergens)}</p><small>Confirme o preparo e possíveis restrições diretamente com a casa.</small></div></div></section><section class="related section"><div class="section-heading"><div><p class="eyebrow">CONTINUE O ENCONTRO</p><h2>Outros sabores<br><em>para descobrir.</em></h2></div><a class="text-link" href="{r}cardapio/">Cardápio completo {ARROW}</a></div><div class="dish-grid" id="related-products">{''.join(card(q,r) for q in DATA['products'] if q['category']==p['category'] and q['id']!=p['id'])}</div></section></div><section class="unavailable section" id="product-unavailable" hidden><p class="eyebrow">O CARDÁPIO ESTÁ SEMPRE À MESA</p><h1>Esse prato não está<br><em>disponível por aqui.</em></h1><p>Explore os outros sabores da casa.</p><a class="button" href="{r}cardapio/">Voltar ao cardápio {ARROW}</a></section>'''

for p in DATA['products']:
    directory = ROOT / 'cardapio' / p['slug']
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'index.html').write_text(shell(p['name'] + ' · Sushi Naka', p['description'], detail(p, '../../'), '../../', 'product', p['id']))
(ROOT / 'prato').mkdir(exist_ok=True)
generic = detail(DATA['products'][0], '../').replace('id="product-content"', 'id="product-content" hidden')
(ROOT / 'prato/index.html').write_text(shell('Conheça o prato · Sushi Naka', 'Descubra os pratos da cozinha japonesa do Sushi Naka.', generic, '../', 'product'))
(ROOT / '.nojekyll').touch()
# Mantém o HTML do painel original; o novo catálogo é carregado antes do banco.
admin = ROOT / 'admin/index.html'
text = admin.read_text()
if 'src="../catalog.js"' not in text:
    text = text.replace('<script src="../database.js">', '<script src="../catalog.js"></script>\n    <script src="../database.js">')
    admin.write_text(text)
DIST = ROOT / 'dist'
if DIST.exists(): shutil.rmtree(DIST)
DIST.mkdir()
for name in ['index.html','style.css','script.js','content.js','catalog.js','database.js','.nojekyll','404.html','assets','admin','cardapio','prato']:
    path = ROOT / name
    if not path.exists(): continue
    if path.is_dir(): shutil.copytree(path, DIST/name)
    else: shutil.copy2(path, DIST/name)
print(f'Geradas {len(DATA["products"])} páginas de pratos, início, cardápio e página dinâmica. Saída: dist/')
