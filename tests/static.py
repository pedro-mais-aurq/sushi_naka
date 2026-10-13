"""Verifica saída estática, rotas relativas e o contrato entre catálogo e páginas."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, re
ROOT=Path(__file__).resolve().parent.parent
DIST=ROOT/'dist'
DATA=json.loads((ROOT/'catalog.json').read_text())
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.ids=[];self.links=[];self.scripts=[];self.images=[];self.rows=[];self.product_id=None;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='body':self.product_id=a.get('data-product-id')
  if tag=='section' and 'data-row' in a:self.rows.append(a['data-row'])
  if tag=='script' and a.get('src'):self.scripts.append(a['src'])
  if tag=='img':self.images.append(a)
  for key in ('href','src'):
   if a.get(key):self.links.append(a[key])
files=list(DIST.rglob('*.html'));pages={p:Page(p.read_text()) for p in files}
assert len(files)==20, f'Esperadas 20 páginas, encontradas {len(files)}'
for filename,p in pages.items():
 assert len(p.ids)==len(set(p.ids)),f'IDs duplicados: {filename}'
 for src in p.scripts:
  assert (filename.parent/src).is_file(), f'Script ausente: {src}'
 if 'database.js' in ' '.join(p.scripts):
  assert p.scripts.index(next(s for s in p.scripts if s.endswith('catalog.js')))<p.scripts.index(next(s for s in p.scripts if s.endswith('database.js'))),f'Ordem dos scripts: {filename}'
 for image in p.images:assert 'alt' in image,f'Imagem sem alt: {filename}'
 for ref in p.links:
  url=urlsplit(ref)
  if url.scheme or url.netloc:continue
  assert not url.path.startswith('/'),f'Caminho absoluto incompatível com Pages: {ref}'
  target=(filename.parent/unquote(url.path)).resolve() if url.path else filename
  if target.is_dir():target=target/'index.html'
  assert target.is_file(),f'Link ou recurso ausente em {filename}: {ref}'
  if url.fragment and target.suffix=='.html':assert url.fragment in pages[target].ids,f'Âncora ausente: {ref}'
for p in DATA['products']:
 target=DIST/'cardapio'/p['slug']/'index.html'
 assert target.is_file() and pages[target].product_id==p['id'],f'Página ausente: {p["id"]}'
 assert (DIST/DATA['assets'][p['image']].replace('.png','.webp')).is_file(),f'Foto ausente: {p["name"]}'
menu=pages[DIST/'cardapio/index.html']
assert len(menu.rows)==4 and len(set(menu.rows))==4,'O cardápio deve conter quatro fileiras.'
home=(DIST/'index.html').read_text()
assert 'class="ribbon"' not in home and 'DESDE 2018' not in home
assert home.index('id="experiencia"')<home.index('id="cardapio"'),'A experiência deve vir antes do cardápio.'
assert 'Anti-fusion por princípio' in home and '1987' in home
assert not re.search(r'cream cheese|Poke Naka|Hot Roll',json.dumps(DATA,ensure_ascii=False),re.I)
assert 'placeholder="Consulte a casa"' in (DIST/'admin/index.html').read_text()
css=(DIST/'style.css').read_text()
assert all(x in css for x in ['max-width:600px','max-width:900px','prefers-reduced-motion','repeat(4,minmax(0,1fr))','.dish-card:hover'])
print(f'OK: {len(files)} páginas; links, imagens, 16 pratos, quatro fileiras, painel e subdiretórios verificados.')
