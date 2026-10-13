const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json')));
const script = fs.readFileSync(path.join(root, 'database.js'), 'utf8');
function runtime(initial) {
  let stored = structuredClone(initial);
  const database = {
    createObjectStore() {}, close() {},
    transaction() {
      let aborted = false, draft;
      const tx = {objectStore() {return {
        get() {const request = {}; setImmediate(() => {request.result = structuredClone(stored); request.onsuccess?.();}); return request;},
        put(value) {draft = structuredClone(value); setImmediate(() => {if (!aborted) {stored = draft; tx.oncomplete?.();}});}
      };}, abort() {aborted = true; setImmediate(() => tx.onabort?.());}};
      return tx;
    }
  };
  const indexedDB = {open() {const request = {}; setImmediate(() => {request.result = database; request.onsuccess?.();}); return request;}};
  const sandbox = {window: {NakaCatalog: catalog, indexedDB}, indexedDB, document: {currentScript: {src: 'https://example.org/projetos/sushi_naka/database.js'}}, URL, URLSearchParams, structuredClone};
  vm.runInNewContext(script, sandbox);
  return {db: sandbox.window.NakaDB, snapshot: () => structuredClone(stored)};
}

test('primeira leitura disponibiliza 16 pratos e quatro categorias', async () => {
  const {db} = runtime(); const data = await db.read();
  assert.equal(data.products.length, 16); assert.equal(new Set(data.products.map(p => p.category)).size, 4);
  assert.equal(db.valid(data), true); assert.equal(data.schemaVersion, 2);
  assert.equal(data.contact.email, ''); assert.equal(data.products.every(p => p.price === null), true);
});
test('busca reconhece acentos, nomes e ingredientes e combina com o filtro', () => {
  const {db} = runtime();
  assert.equal(db.filterProducts(catalog.products, 'quentes', 'lamen')[0].name, 'Lámen');
  assert.equal(db.filterProducts(catalog.products, 'rolls', 'salmao').length, 4);
  assert.equal(db.filterProducts(catalog.products, 'quentes', 'pepino').length, 0);
  assert.equal(db.filterProducts(catalog.products, 'todos', 'inexistente').length, 0);
  assert.equal(db.filterProducts(catalog.products, 'entradas', '').length, 4);
});
test('cada categoria corresponde a uma fileira com quatro pratos', () => {
  for (const category of Object.keys(catalog.categoryNames)) assert.equal(catalog.products.filter(p => p.category === category).length, 4);
});
test('páginas funcionam sob subdiretório e itens novos recebem URL própria', () => {
  const {db} = runtime();
  assert.equal(db.productUrl(catalog.products[0]), 'https://example.org/projetos/sushi_naka/cardapio/combinado-naka/');
  assert.equal(db.productUrl({id:'novo-prato-123'}), 'https://example.org/projetos/sushi_naka/prato/?id=novo-prato-123');
  assert.equal(db.photoSource({image:'nigiri'}), 'https://example.org/projetos/sushi_naka/assets/food/nigiri.webp');
  assert.equal(db.photoSource({image:'nigiri',photo:'data:image/png;base64,AAAA'}), 'data:image/png;base64,AAAA');
});
test('cadastro, alteração e exclusão persistem sem reintroduzir prato removido', async () => {
  const {db} = runtime();
  await db.read();
  await db.update(data => data.products.push({...structuredClone(catalog.products[0]),id:'prato-novo',name:'Novo prato',price:25.5}));
  assert.equal((await db.read()).products.length, 17);
  await db.update(data => {const p=data.products.find(p=>p.id==='prato-novo');p.name='Prato atualizado';p.price=null;});
  assert.equal((await db.read()).products.find(p=>p.id==='prato-novo').name, 'Prato atualizado');
  await db.update(data => {data.products=data.products.filter(p=>p.id!=='nigiri-salmao');});
  assert.equal((await db.read()).products.some(p=>p.id==='nigiri-salmao'), false);
  await db.update(data => {data.products=[];}); assert.equal((await db.read()).products.length, 0);
});
test('dados inválidos são rejeitados sem destruir o conteúdo anterior', async () => {
  const {db} = runtime(); await db.read();
  await assert.rejects(db.update(data => {data.products[0].price=-1;}), /Dados inválidos/);
  assert.equal((await db.read()).products[0].price, null);
  await assert.rejects(db.update(data => {data.products.push(data.products[0]);}), /Dados inválidos/);
  assert.equal((await db.read()).products.length, 16);
});
test('migração conserva produtos, fotos e contatos personalizados', async () => {
  const customized={id:'naka',name:'Prato personalizado',price:159,description:'Descrição do cliente.',details:'40 peças',badge:'Especial',category:'combinados',image:'combinado',photo:'data:image/png;base64,AAAA'};
  const contact={address:'Endereço do cliente',hours:'Horário do cliente',phone:'(31) 99999-9999',email:'contato@cliente.com'};
  const {db}=runtime({products:[customized],contact});const data=await db.read();
  assert.equal(data.products.length,16);assert.equal(data.products[0].name,customized.name);assert.equal(data.products[0].photo,customized.photo);
  assert.deepEqual(data.contact,contact);assert.equal((await db.read()).products.length,16);
});
test('migração substitui o roll fusion e os contatos demonstrativos intactos', async () => {
  const old={id:'roll',name:'Roll especial da casa',price:42,description:'Salmão, cream cheese, toque crocante e finalização com ovas.',details:'8 PEÇAS · FEITO NA HORA',badge:'O QUERIDINHO DA CASA',category:'rolls',image:'rolls'};
  const contact={address:'Rua das Cerejeiras, 128 · Santa Tereza\nBelo Horizonte, MG',hours:'Terça a quinta · 18h às 23h\nSexta e sábado · 18h à meia-noite\nDomingo · 12h às 22h',phone:'(31) 3333-0128',email:'oi@sushinaka.example'};
  const {db}=runtime({products:[old],contact});const data=await db.read();
  assert.equal(data.products.find(p=>p.id==='roll').name,'Uramaki de salmão');assert.equal(data.products.find(p=>p.id==='roll').price,null);
  assert.match(data.contact.address,/Afonso Pena/);assert.equal(data.contact.email,'');
});
test('preço em branco não é confundido com preço zero', () => {
  const {db}=runtime();assert.equal(db.money(null),'Consulte a casa');assert.match(db.money(0),/0,00/);assert.match(db.money(42),/42,00/);
});
