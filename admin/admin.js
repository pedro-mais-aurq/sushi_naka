(function () {
  'use strict';
  const list = document.querySelector('#product-list'), status = document.querySelector('#status'), editor = document.querySelector('#product-dialog'), form = document.querySelector('#product-form'), contactForm = document.querySelector('#contact-form'), deleteDialog = document.querySelector('#delete-dialog');
  const upload = document.querySelector('#photo-upload'), preview = document.querySelector('#photo-preview'), photoStatus = document.querySelector('#photo-status'), useLibrary = document.querySelector('#use-library');
  let state, editingId = null, deletingId = null, pendingPhoto = null, photoLoading = false, photoRequest = 0;
  function el(tag, text, cls) {const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (cls) node.className = cls; return node;}
  const categories = form.elements.namedItem('category'); categories.replaceChildren();
  NakaDB.categories.forEach(value => {const option = el('option', NakaDB.defaults.categoryNames[value]); option.value = value; categories.append(option);});
  const imageSelect = form.elements.namedItem('image'); imageSelect.replaceChildren();
  const imageLabels = {combinado: 'Acervo original · Combinado', rolls: 'Acervo original · Rolls', teishoku: 'Acervo original · Teishoku', sashimi: 'Acervo original · Sashimi'};
  const keys = [...NakaDB.images.filter(key => !imageLabels[key]), ...NakaDB.images.filter(key => imageLabels[key])];
  keys.forEach(value => {const item = NakaDB.defaults.products.find(p => p.image === value); const option = el('option', imageLabels[value] || (item?.name || value) + ' · recorte transparente'); option.value = value; imageSelect.append(option);});
  imageSelect.value = 'combinado-novo';
  function updatePreview() {preview.src = pendingPhoto || NakaDB.photoSource({image: imageSelect.value}); useLibrary.hidden = !pendingPhoto;}
  function resetPhoto() {photoRequest++; photoLoading = false; pendingPhoto = null; upload.value = ''; photoStatus.textContent = ''; form.querySelector('[type=submit]').disabled = false; updatePreview();}
  imageSelect.addEventListener('change', resetPhoto); useLibrary.onclick = resetPhoto;
  editor.addEventListener('close', () => {photoRequest++; photoLoading = false;});
  upload.addEventListener('change', async () => {
    const file = upload.files[0]; if (!file) return;
    const request = ++photoRequest; photoLoading = true; form.querySelector('[type=submit]').disabled = true; photoStatus.textContent = 'Preparando a foto…'; document.querySelector('#editor-error').textContent = '';
    try {const photo = await NakaPhoto.prepare(file); if (request !== photoRequest) return; pendingPhoto = photo; updatePreview(); photoStatus.textContent = 'Foto pronta. Salve o produto para aplicar.';}
    catch (error) {if (request !== photoRequest) return; document.querySelector('#editor-error').textContent = error.message; photoStatus.textContent = ''; upload.value = '';}
    finally {if (request === photoRequest) {photoLoading = false; form.querySelector('[type=submit]').disabled = false;}}
  });
  function message(text, error = false) {status.textContent = text; status.classList.toggle('error', error);}
  function render() {
    list.replaceChildren(); document.querySelector('#product-count').textContent = state.products.length + ' produto' + (state.products.length === 1 ? '' : 's');
    for (const p of state.products) {
      const row = el('div', undefined, 'product-row'), img = el('img'); img.src = NakaDB.photoSource(p); img.alt = p.name; img.loading = 'lazy';
      const info = el('div'); info.append(el('h3', p.name), el('p', NakaDB.defaults.categoryNames[p.category]));
      const actions = el('div', undefined, 'row-actions');
      const edit = el('button', 'Editar', 'secondary'); edit.type = 'button'; edit.setAttribute('aria-label', 'Editar ' + p.name); edit.onclick = () => openEditor(p);
      const view = el('a', 'Abrir página', 'secondary'); view.href = NakaDB.productUrl(p); view.target = '_blank'; view.rel = 'noopener'; view.setAttribute('aria-label', 'Abrir página de ' + p.name);
      const remove = el('button', 'Remover', 'secondary danger'); remove.type = 'button'; remove.setAttribute('aria-label', 'Remover ' + p.name); remove.onclick = () => {deletingId = p.id; document.querySelector('#delete-name').textContent = p.name; document.querySelector('#delete-error').textContent = ''; deleteDialog.showModal();};
      actions.append(edit, view, remove); row.append(img, info, el('strong', NakaDB.money(p.price)), actions); list.append(row);
    }
    if (!state.products.length) list.append(el('p', 'Nenhum produto cadastrado. Adicione o primeiro produto.'));
  }
  function openEditor(product) {
    form.reset(); imageSelect.value = product?.image || 'combinado-novo'; resetPhoto(); editingId = product?.id || null;
    document.querySelector('#editor-title').textContent = product ? 'Editar produto' : 'Adicionar produto'; document.querySelector('#editor-error').textContent = '';
    if (product) {
      for (const key of ['name','price','category','description','details','badge','image','story','japanese']) form.elements.namedItem(key).value = product[key] ?? '';
      for (const key of ['ingredients','allergens']) form.elements.namedItem(key).value = (product[key] || []).join(', ');
      form.elements.namedItem('featured').checked = !!product.featured;
    }
    pendingPhoto = product?.photo || null; updatePreview(); editor.showModal();
  }
  document.querySelector('#new-product').onclick = () => openEditor();
  document.querySelector('#product-dialog .close').onclick = () => editor.close();
  document.querySelector('#cancel-delete').onclick = () => deleteDialog.close();
  form.onsubmit = async event => {
    event.preventDefault(); if (photoLoading) return;
    const save = form.querySelector('[type=submit]'); save.disabled = true; document.querySelector('#editor-error').textContent = '';
    const f = new FormData(form); const previous = state.products.find(p => p.id === editingId) || {};
    const newId = crypto.randomUUID ? crypto.randomUUID() : 'prato-' + Array.from(crypto.getRandomValues(new Uint32Array(2))).join('-');
    const text = key => String(f.get(key) || '').trim();
    const product = {...previous, id: editingId || newId, name: text('name'), price: text('price') === '' ? null : Number(f.get('price')), description: text('description'), details: text('details'), badge: text('badge'), category: text('category'), image: text('image'), story: text('story') || text('description'), japanese: text('japanese'), ingredients: text('ingredients').split(',').map(s => s.trim()).filter(Boolean), allergens: text('allergens').split(',').map(s => s.trim()).filter(Boolean), featured: f.has('featured')};
    delete product.photo; if (pendingPhoto) product.photo = pendingPhoto;
    try {
      if (!product.name || !product.description) throw Error('Preencha o nome e a descrição.');
      state = await NakaDB.update(data => {const index = data.products.findIndex(p => p.id === product.id); if (index < 0) data.products.push(product); else data.products[index] = product;});
      render(); editor.close(); message('Produto salvo. Início, cardápio e página do prato atualizados neste navegador.');
    } catch (error) {document.querySelector('#editor-error').textContent = error.message;}
    finally {save.disabled = false;}
  };
  document.querySelector('#confirm-delete').onclick = async () => {
    const button = document.querySelector('#confirm-delete'); button.disabled = true;
    try {state = await NakaDB.update(data => {data.products = data.products.filter(p => p.id !== deletingId);}); render(); deleteDialog.close(); message('Produto removido do cardápio e da página do prato.');}
    catch (error) {document.querySelector('#delete-error').textContent = error.message;}
    finally {button.disabled = false;}
  };
  contactForm.onsubmit = async event => {
    event.preventDefault(); const button = contactForm.querySelector('button'); button.disabled = true;
    const f = new FormData(contactForm), contact = Object.fromEntries(['address','hours','phone','email'].map(k => [k, String(f.get(k) || '').trim()]));
    try {if (['address','hours','phone'].some(k => !contact[k])) throw Error('Preencha endereço, horários e telefone.'); state = await NakaDB.update(data => {data.contact = contact;}); message('Contatos salvos. O início e as páginas dos pratos foram atualizados neste navegador.');}
    catch (error) {message(error.message, true);}
    finally {button.disabled = false;}
  };
  (async () => {
    try {state = await NakaDB.read(); render(); Object.entries(state.contact).forEach(([key, value]) => {contactForm.elements.namedItem(key).value = value;}); document.querySelector('#new-product').disabled = false; contactForm.querySelector('button').disabled = false; message('Banco local pronto. Deixe o preço vazio para exibir “Consulte a casa”.');}
    catch (_) {message('Não foi possível abrir o banco local. Recarregue a página ou permita o armazenamento neste navegador.', true);}
  })();
})();
