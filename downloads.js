/* CENTRAL DE DOWNLOADS — Studio.Ryu
   ===========================================================
   COMO ADICIONAR UM DOWNLOAD REAL
   1) Suba o arquivo para o repositório (ex.: pasta /downloads) ou use um link
      do Google Drive / Mega etc.
   2) Na lista ITEMS abaixo, preencha `href` com o link do arquivo
      (ex.: 'downloads/pack-transicoes.zip') e tire `soon: true`.
      Também pode ajustar `meta` (formato/tamanho).
   Itens com `soon: true` aparecem como "EM BREVE" com o botão
   "Avisar quando sair" (abre o WhatsApp).
   Os itens abaixo são EXEMPLOS DE ESTRUTURA: troque, apague ou
   adicione os seus.
   =========================================================== */
(() => {
  const CATS = [
    { id: 'presets',   name: 'Presets & animações',  ico: '✳', c: '#9471ce', desc: 'Recursos de movimento para o After Effects usar como ponto de partida.' },
    { id: 'templates', name: 'Templates',            ico: '◈', c: '#7a64d8', desc: 'Projetos-base para entender, explorar e adaptar composições.' },
    { id: 'musicas',   name: 'Músicas & SFX',        ico: '♫', c: '#b07cd9', desc: 'Trilhas e efeitos sonoros para dar ritmo aos seus vídeos.' },
    { id: 'videos',    name: 'Vídeos & overlays',    ico: '▶', c: '#6f7fd8', desc: 'Overlays, glitches, fundos e loops para compor por cima.' },
    { id: 'imagens',   name: 'Imagens & texturas',   ico: '▣', c: '#a06bc9', desc: 'Texturas, grãos e elementos visuais para o seu processo criativo.' },
    { id: 'fontes',    name: 'Fontes',               ico: 'T', c: '#8b8be0', desc: 'Tipografias para títulos, legendas e identidade visual.' },
    { id: 'apps',      name: 'Aplicativos & plugins', ico: '⌘', c: '#c08be0', desc: 'Painéis e ferramentas que aceleram o seu fluxo de trabalho.' },
    { id: 'extras',    name: 'E muito mais',         ico: '✦', c: '#7a53c0', desc: 'Checklists, guias e outros extras para editores.' }
  ];

  const ITEMS = [
    { cat: 'presets', title: 'Pack de transições suaves', desc: 'Transições prontas para aplicar com um clique entre cenas.', tags: ['After Effects', 'Transições'], meta: '.ffx', soon: true, href: '' },
    { cat: 'presets', title: 'Animações de texto', desc: 'Títulos cinéticos para Reels, Shorts e TikTok.', tags: ['Texto', 'Reels'], meta: '.ffx', soon: true, href: '' },
    { cat: 'presets', title: 'Movimentos e curvas', desc: 'Padrões de movimento rápido, suave e lento para keyframes.', tags: ['Easing', 'Motion'], meta: '.ffx', soon: true, href: '' },
    { cat: 'templates', title: 'Template de legenda viral', desc: 'Projeto aberto para estudar como a legenda foi montada.', tags: ['Legenda', 'Viral'], meta: '.aep', soon: true, href: '' },
    { cat: 'templates', title: 'Intro para vídeos', desc: 'Abertura curta e editável com a sua identidade.', tags: ['Intro', 'Motion'], meta: '.aep', soon: true, href: '' },
    { cat: 'templates', title: 'Lower thirds', desc: 'Barras de nome e informação prontas para usar.', tags: ['Títulos'], meta: '.aep', soon: true, href: '' },
    { cat: 'musicas', title: 'Trilhas para vídeos virais', desc: 'Músicas curtas e marcantes para segurar a atenção.', tags: ['Trilha', 'Viral'], meta: '.mp3', soon: true, href: '' },
    { cat: 'musicas', title: 'Pack de efeitos sonoros', desc: 'Whooshes, hits e impactos para sound design.', tags: ['SFX', 'Sound design'], meta: '.wav', soon: true, href: '' },
    { cat: 'videos', title: 'Overlays e glitches', desc: 'Camadas para dar textura e energia à edição.', tags: ['Overlay', 'Glitch'], meta: '.mp4', soon: true, href: '' },
    { cat: 'videos', title: 'Fundos animados em loop', desc: 'Backgrounds abstratos para vídeos, stories e thumbs.', tags: ['Loop', 'Fundo'], meta: '.mp4', soon: true, href: '' },
    { cat: 'imagens', title: 'Texturas e grãos', desc: 'Papel, ruído e granulação para acabamento.', tags: ['Textura', 'Grão'], meta: '.png', soon: true, href: '' },
    { cat: 'imagens', title: 'Elementos gráficos', desc: 'Formas, setas e detalhes para compor seus layouts.', tags: ['Shapes', 'Elementos'], meta: '.png', soon: true, href: '' },
    { cat: 'fontes', title: 'Fontes para títulos', desc: 'Seleção de tipografias fortes para vídeos e reels.', tags: ['Tipografia', 'Títulos'], meta: '.ttf', soon: true, href: '' },
    { cat: 'apps', title: 'Plugin Ryu Beta — Animation Suite', desc: 'Painel para After Effects com animações de texto, efeitos, movimentos, paletas e mais. Versão Beta grátis.', tags: ['After Effects', 'Painel .jsx', 'Beta'], meta: '.jsx', soon: true, href: '' },
    { cat: 'extras', title: 'Checklist de exportação', desc: 'Passo a passo para exportar sem esquecer nada.', tags: ['Checklist', 'Premiere'], meta: '.pdf', soon: true, href: '' }
  ];

  const WA = 'https://wa.me/5571983716396?text=';
  const $ = (s, r = document) => r.querySelector(s);
  const ui = window.RyuUI || { store: { get() { return null; }, set() {} }, toast() {}, confetti() {} };
  const catById = Object.fromEntries(CATS.map(c => [c.id, c]));
  ITEMS.forEach((it, i) => { it.id = it.id || it.cat + '-' + i; });

  const grid = $('#dl-grid'), catGrid = $('#cat-grid'), chips = $('#dl-chips'), info = $('#cat-info'),
    q = $('#dl-q'), bar = $('#cart-bar'), barText = $('#cart-text');
  let cat = 'all', query = '', cart = [];
  try { cart = JSON.parse(ui.store.get('ryu-cart') || '[]').filter(id => ITEMS.some(i => i.id === id)); } catch (e) { cart = []; }
  const saveCart = () => ui.store.set('ryu-cart', JSON.stringify(cart));
  const countIn = id => ITEMS.filter(i => id === 'all' ? true : id === 'cart' ? cart.includes(i.id) : i.cat === id).length;
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };

  /* ---------- números do topo ---------- */
  $('#st-files').textContent = ITEMS.length;
  $('#st-cats').textContent = CATS.length;
  $('#st-ready').textContent = ITEMS.filter(i => !i.soon && i.href).length;

  /* ---------- efeito de luz que segue o mouse nos cards ---------- */
  const spot = e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', (e.clientX - r.left) + 'px'); e.currentTarget.style.setProperty('--my', (e.clientY - r.top) + 'px'); };

  /* ---------- cards de categoria ---------- */
  function renderCats() {
    catGrid.replaceChildren(...CATS.map((c, i) => {
      const b = el('button', 'cat-card' + (cat === c.id ? ' on' : ''));
      b.type = 'button'; b.style.setProperty('--c', c.c); b.style.animationDelay = i * 55 + 'ms'; b.dataset.cat = c.id;
      b.append(el('div', 'cat-ico', c.ico), el('h3', null, c.name), el('p', null, c.desc));
      const n = countIn(c.id), foot = el('div', 'cat-count'); foot.append(el('span', null, n + (n === 1 ? ' ARQUIVO' : ' ARQUIVOS')), el('i', null, '↗'));
      b.append(foot);
      b.addEventListener('pointermove', spot);
      b.addEventListener('click', () => { select(c.id, true); });
      return b;
    }));
  }

  /* ---------- chips de filtro ---------- */
  function renderChips() {
    const defs = [{ id: 'all', name: 'Todos' }, ...CATS];
    const list = defs.map(c => {
      const b = el('button', 'dl-chip' + (cat === c.id ? ' on' : ''), c.name); b.type = 'button';
      b.append(el('b', null, String(countIn(c.id))));
      b.addEventListener('click', () => select(c.id, false)); return b;
    });
    const cb = el('button', 'dl-chip cart-chip' + (cat === 'cart' ? ' on' : ''), '🛒 Meu carrinho'); cb.type = 'button';
    cb.append(el('b', null, String(cart.length))); cb.addEventListener('click', () => select('cart', false));
    chips.replaceChildren(...list, cb);
  }

  /* ---------- faixa de informação da categoria ---------- */
  function renderInfo() {
    let c, title, text, ico;
    if (cat === 'all') { c = '#9471ce'; title = 'Todos os downloads'; text = 'Veja tudo que a Ryu preparou, de presets a aplicativos. Use a busca ou escolha uma categoria.'; ico = '✳'; }
    else if (cat === 'cart') { c = '#7a53c0'; title = 'Meu carrinho'; text = cart.length ? 'Os arquivos que você separou. Eles ficam salvos neste navegador.' : 'Seu carrinho está vazio. Toque no 🛒 de um arquivo para guardar aqui.'; ico = '🛒'; }
    else { const k = catById[cat]; c = k.c; title = k.name; text = k.desc; ico = k.ico; }
    info.style.setProperty('--c', c); info.dataset.ico = ico;
    const left = el('div'); left.append(el('h3', null, title), el('p', null, text));
    const n = visible().length;
    info.replaceChildren(left, el('small', null, n + (n === 1 ? ' RESULTADO' : ' RESULTADOS')));
  }

  /* ---------- lista de arquivos ---------- */
  function visible() {
    const nq = norm(query);
    return ITEMS.filter(i => {
      if (cat === 'cart' && !cart.includes(i.id)) return false;
      if (cat !== 'all' && cat !== 'cart' && i.cat !== cat) return false;
      if (!nq) return true;
      return norm(i.title + ' ' + i.desc + ' ' + i.tags.join(' ') + ' ' + catById[i.cat].name).includes(nq);
    });
  }
  function card(it, idx) {
    const k = catById[it.cat], a = el('article', 'dl-item'); a.style.setProperty('--c', k.c); a.style.setProperty('--i', Math.min(idx, 12));
    const top = el('div', 'dl-top'), cb = el('button', 'dl-cartbtn' + (cart.includes(it.id) ? ' on' : ''), cart.includes(it.id) ? '✓' : '🛒'); cb.type = 'button';
    cb.setAttribute('aria-label', cart.includes(it.id) ? 'Remover do carrinho' : 'Adicionar ao carrinho'); cb.setAttribute('aria-pressed', String(cart.includes(it.id)));
    cb.addEventListener('click', () => toggleCart(it));
    top.append(el('span', 'dl-ico', k.ico), el('span', 'dl-cat', k.name.toUpperCase()), cb);
    const tags = el('div', 'dl-tags'); it.tags.forEach(t => tags.append(el('span', null, t)));
    const foot = el('div', 'dl-foot'), ready = !it.soon && it.href;
    foot.append(el('span', 'dl-meta' + (ready ? '' : ' soon'), ready ? (it.meta || 'ARQUIVO').toUpperCase() : 'EM BREVE'));
    let btn;
    if (ready) { btn = el('a', 'dl-btn', 'Baixar ↓'); btn.href = it.href; btn.setAttribute('download', ''); btn.target = '_blank'; btn.rel = 'noreferrer'; }
    else { btn = el('a', 'dl-btn ghost', 'Avisar quando sair ↗'); btn.href = WA + encodeURIComponent('Oi Enzo! Quero ser avisado quando "' + it.title + '" estiver disponível nos downloads grátis da Studio.Ryu.'); btn.target = '_blank'; btn.rel = 'noreferrer'; }
    foot.append(btn);
    a.append(top, el('h3', null, it.title), el('p', null, it.desc), tags, foot);
    a.addEventListener('pointermove', spot);
    return a;
  }
  function renderGrid() {
    const list = visible();
    if (!list.length) {
      const box = el('div', 'dl-empty'), m = el('div', 'mascot'); m.dataset.says = 'Nada por aqui… ainda!|Tenta outra busca!';
      const img = el('img'); img.src = 'assets/tigre-mini.jpeg'; img.alt = ''; m.append(img);
      m.setAttribute('role', 'button'); m.tabIndex = 0;
      m.addEventListener('click', () => { const b = el('span', 'mascot-bubble', m.dataset.says.split('|')[Math.floor(Math.random() * 2)]); m.append(b); setTimeout(() => b.remove(), 2600); m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop'); });
      const btn = el('button', 'btn dark-btn', 'Limpar filtros'); btn.type = 'button'; btn.append(el('span', null, '↺'));
      btn.addEventListener('click', () => { q.value = ''; query = ''; select('all', false); });
      box.append(m, el('h3', null, cat === 'cart' ? 'Carrinho vazio' : 'Nada encontrado'), el('p', null, cat === 'cart' ? 'Adicione arquivos com o botão 🛒 e eles aparecem aqui.' : 'Nenhum arquivo bate com essa busca. Tente outra palavra ou categoria.'), btn);
      grid.replaceChildren(box); return;
    }
    grid.replaceChildren(...list.map(card));
  }

  /* ---------- carrinho ---------- */
  function toggleCart(it) {
    const i = cart.indexOf(it.id);
    if (i >= 0) { cart.splice(i, 1); ui.toast('Removido do carrinho'); }
    else { cart.push(it.id); ui.toast('🛒 “' + it.title + '” no carrinho'); }
    saveCart(); refresh(false);
  }
  function renderBar() {
    const n = cart.length; barText.textContent = '🛒 ' + n + (n === 1 ? ' item no carrinho' : ' itens no carrinho');
    bar.classList.toggle('show', n > 0 && cat !== 'cart');
  }
  $('#cart-view').addEventListener('click', () => select('cart', true));
  $('#cart-clear').addEventListener('click', () => { cart = []; saveCart(); ui.toast('Carrinho limpo'); refresh(false); });

  /* ---------- seleção, busca e atalhos ---------- */
  function refresh(rerenderCats = true) {
    if (rerenderCats) renderCats(); else document.querySelectorAll('.cat-card').forEach(b => b.classList.toggle('on', b.dataset.cat === cat));
    renderChips(); renderInfo(); renderGrid(); renderBar();
  }
  function select(id, scroll) {
    cat = id; refresh(false);
    try { history.replaceState(null, '', id === 'all' ? location.pathname : '#' + id); } catch (e) {}
    if (scroll) document.getElementById('arquivos').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  q.addEventListener('input', () => { query = q.value; renderInfo(); renderGrid(); });
  addEventListener('keydown', e => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); }
    if (e.key === 'Escape' && document.activeElement === q) { q.blur(); }
  });
  addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h === 'cart' || catById[h]) select(h, true); });

  /* ---------- início ---------- */
  const h0 = location.hash.slice(1);
  if (h0 === 'cart' || catById[h0]) cat = h0;
  renderCats(); refresh(false);
  if (catById[h0]) setTimeout(() => document.getElementById('arquivos').scrollIntoView({ block: 'start' }), 120);
})();
