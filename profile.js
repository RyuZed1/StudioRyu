/* PERFIL / LOGIN — Studio.Ryu
   ===========================================================
   Cria o botão "Entrar" no topo de todas as páginas e uma janelinha de perfil
   (nome, foto e frase). O perfil fica salvo neste navegador e é usado no
   ranking do Ryu Run.

   LOGIN COM GOOGLE (opcional)
   1) https://console.cloud.google.com → APIs e serviços → Credenciais →
      "Criar credenciais" → "ID do cliente OAuth" → tipo "Aplicativo da Web".
   2) Em "Origens JavaScript autorizadas" coloque o endereço do seu site
      (ex.: https://seuusuario.github.io).
   3) Cole o ID do cliente abaixo. O botão "Entrar com Google" aparece sozinho
      e pega nome e foto da conta automaticamente.
   Deixe vazio para usar só o perfil manual.
   =========================================================== */
(() => {
  const GOOGLE_CLIENT_ID = '';

  const ui = window.RyuUI || { store: { get() { return null; }, set() {} }, toast() {} };
  const KEY = 'ryu-profile';
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const clean = (s, n) => (s || '').replace(/[<>`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
  const okPhoto = p => typeof p === 'string' && p.length < 20000 && (/^assets\/[\w.-]+$/.test(p) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) || /^https:\/\/[^\s"'<>]+$/.test(p));
  const uid = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(36).padStart(2, '0')).join('').slice(0, 10);
  const COLORS = ['#9471ce', '#7a64d8', '#b07cd9', '#6f7fd8', '#a06bc9', '#8b8be0', '#c08be0', '#7a53c0'];
  const colorOf = s => { let h = 0; for (const ch of String(s || '?')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return COLORS[h % COLORS.length]; };

  let profile = null; const subs = [];
  function load() {
    try {
      const p = JSON.parse(ui.store.get(KEY) || 'null');
      if (p && p.name) profile = { id: String(p.id || uid()).replace(/[^a-z0-9]/gi, '').slice(0, 24), name: clean(p.name, 14), photo: okPhoto(p.photo) ? p.photo : '', bio: clean(p.bio, 60), google: !!p.google };
    } catch (e) { profile = null; }
  }
  function save(p) {
    profile = p;
    if (p) ui.store.set(KEY, JSON.stringify(p)); else ui.store.set(KEY, '');
    if (p) ui.store.set('ryu-name', p.name); // compatível com o ranking antigo
    paintBtn(); subs.forEach(f => { try { f(profile); } catch (e) {} });
  }

  /* avatar: foto se houver, senão bolinha colorida com a inicial */
  function avatar(who, size) {
    const a = el('span', 'av'); a.style.width = a.style.height = (size || 40) + 'px'; a.style.fontSize = Math.round((size || 40) * .42) + 'px';
    if (who && okPhoto(who.photo)) { const i = el('img'); i.src = who.photo; i.alt = ''; i.referrerPolicy = 'no-referrer'; i.loading = 'lazy'; i.onerror = () => { i.remove(); fb(); }; a.append(i); }
    else fb();
    function fb() { a.style.background = colorOf(who && who.name); a.textContent = ((who && who.name) || '?').trim().charAt(0).toUpperCase(); }
    return a;
  }

  /* ---------- botão no topo ---------- */
  let btn;
  function mountBtn() {
    const h = document.querySelector('.header'); if (!h) return;
    btn = el('button', 'acct'); btn.type = 'button';
    const cta = h.querySelector('.header-cta'); cta ? h.insertBefore(btn, cta) : h.append(btn);
    btn.addEventListener('click', () => openModal());
    paintBtn();
  }
  function paintBtn() {
    if (!btn) return; btn.replaceChildren();
    if (profile) { btn.classList.add('in'); btn.append(avatar(profile, 28), el('span', null, profile.name)); btn.title = 'Meu perfil'; }
    else { btn.classList.remove('in'); btn.append(el('i', null, '☺'), el('span', null, 'Entrar')); btn.title = 'Entrar ou criar perfil'; }
  }

  /* ---------- janela de perfil ---------- */
  let modal, lastFocus, draft;
  function resize(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const S = 112, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
        const m = Math.min(img.width, img.height), sx = (img.width - m) / 2, sy = (img.height - m) / 2;
        x.fillStyle = '#fff'; x.fillRect(0, 0, S, S); x.drawImage(img, sx, sy, m, m, 0, 0, S, S);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', .82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
      img.src = url;
    });
  }
  function openModal(after) {
    closeModal(true); lastFocus = document.activeElement;
    draft = { id: profile ? profile.id : uid(), photo: profile ? profile.photo : '', google: profile ? profile.google : false };
    modal = el('div', 'pf-back'); modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Perfil');
    const box = el('form', 'pf-box'); box.autocomplete = 'off';
    const x = el('button', 'pf-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Fechar'); x.addEventListener('click', () => closeModal());
    box.append(x, el('span', 'eyebrow-number', profile ? 'MEU PERFIL' : 'ENTRAR'), el('h3', null, profile ? 'Seu perfil' : 'Entre na corrida'),
      el('p', 'pf-sub', 'Escolha um nome, uma foto e uma frase. É isso que aparece para todo mundo no ranking do Ryu Run.'));

    if (GOOGLE_CLIENT_ID) {
      const g = el('div', 'pf-google'); g.id = 'pf-google'; box.append(g, el('div', 'pf-or', 'ou crie manualmente'));
      loadGoogle(g);
    }

    const pick = el('div', 'pf-photo'), prev = el('span', 'pf-prev');
    const paintPrev = () => { prev.replaceChildren(avatar({ name: nameIn.value || '?', photo: draft.photo }, 76)); };
    const file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.hidden = true;
    const upl = el('button', 'pf-btn', 'Enviar foto'); upl.type = 'button'; upl.addEventListener('click', () => file.click());
    const rm = el('button', 'pf-btn ghost', 'Usar o tigre'); rm.type = 'button';
    const nameIn = el('input'); nameIn.maxLength = 14; nameIn.placeholder = 'Seu apelido'; nameIn.value = profile ? profile.name : ''; nameIn.setAttribute('aria-label', 'Apelido'); nameIn.required = true;
    rm.addEventListener('click', () => { draft.photo = 'assets/ryu-tiger-avatar.jpeg'; paintPrev(); });
    file.addEventListener('change', async () => {
      const f = file.files && file.files[0]; if (!f) return;
      try { draft.photo = await resize(f); paintPrev(); } catch (e) { ui.toast('Não consegui ler essa imagem. Tente outra.'); }
    });
    nameIn.addEventListener('input', paintPrev);
    const pbtns = el('div', 'pf-pbtns'); pbtns.append(upl, rm);
    pick.append(prev, pbtns, file);

    const bioIn = el('input'); bioIn.maxLength = 60; bioIn.placeholder = 'Uma frase para o ranking (opcional)'; bioIn.value = profile ? profile.bio : ''; bioIn.setAttribute('aria-label', 'Frase');
    const cnt = el('small', 'pf-cnt', bioIn.value.length + '/60'); bioIn.addEventListener('input', () => { cnt.textContent = bioIn.value.length + '/60'; });
    const l1 = el('label', null, 'Apelido'), l2 = el('label', null, 'Frase embaixo do seu nome');
    l1.append(nameIn); l2.append(bioIn, cnt);
    const row = el('div', 'pf-actions'), ok = el('button', 'btn dark-btn', profile ? 'Salvar perfil' : 'Entrar'); ok.type = 'submit'; ok.append(el('span', null, '→'));
    row.append(ok);
    if (profile) { const out = el('button', 'pf-btn ghost', 'Sair'); out.type = 'button'; out.addEventListener('click', () => { save(null); ui.toast('Você saiu do perfil.'); closeModal(true); }); row.append(out); }
    box.append(pick, l1, l2, row);
    box.addEventListener('submit', e => {
      e.preventDefault(); const name = clean(nameIn.value, 14);
      if (!name) { nameIn.focus(); return; }
      save({ id: draft.id, name, photo: okPhoto(draft.photo) ? draft.photo : '', bio: clean(bioIn.value, 60), google: draft.google });
      ui.toast('✓ Perfil salvo, ' + name + '!'); closeModal(true); if (typeof after === 'function') after(profile);
    });
    paintPrev(); modal.append(box); document.body.append(modal);
    requestAnimationFrame(() => modal.classList.add('open')); nameIn.focus();
    modal.addEventListener('pointerdown', e => { if (e.target === modal) closeModal(); });
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); e.stopPropagation(); });
  }
  function closeModal(quick) {
    if (!modal) return; const m = modal; modal = null;
    m.classList.remove('open'); setTimeout(() => m.remove(), quick ? 0 : 200);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---------- Google (só se tiver o ID do cliente) ---------- */
  function loadGoogle(host) {
    const go = () => {
      if (!window.google || !google.accounts || !google.accounts.id) return;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID, callback: r => {
          try {
            const b = r.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), j = JSON.parse(decodeURIComponent(escape(atob(b))));
            save({ id: 'g' + String(j.sub).replace(/\D/g, '').slice(0, 20), name: clean(j.given_name || j.name, 14) || 'Ryu', photo: okPhoto(j.picture) ? j.picture : '', bio: profile ? profile.bio : '', google: true });
            ui.toast('✓ Conectado com o Google!'); closeModal(true);
          } catch (e) { ui.toast('Não consegui entrar com o Google.'); }
        }
      });
      google.accounts.id.renderButton(host, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'pt-BR', width: 280 });
    };
    if (window.google && window.google.accounts) return go();
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = go; s.onerror = () => host.remove(); document.head.append(s);
  }

  load();
  window.RyuProfile = {
    get: () => profile,
    open: openModal,
    onChange: f => subs.push(f),
    avatar, okPhoto, clean
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountBtn); else mountBtn();
})();
