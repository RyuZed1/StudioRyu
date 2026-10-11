(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const mem = {};
  const store = {
    get(k) { try { const v = localStorage.getItem(k); return v === null ? (mem[k] ?? null) : v; } catch (e) { return mem[k] ?? null; } },
    set(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- utilidades visuais ---------- */
  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }
  function confetti(x, y, n = 44) {
    if (reduced) return;
    const colors = ['#9471ce', '#c9a9f5', '#ffffff', '#211d29', '#e5ccff'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('span'); c.className = 'confetti';
      const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 260;
      c.style.left = x + 'px'; c.style.top = y + 'px'; c.style.background = colors[i % colors.length];
      c.style.setProperty('--dx', Math.cos(a) * d + 'px'); c.style.setProperty('--dy', Math.sin(a) * d - 90 + 'px');
      c.style.setProperty('--rot', Math.random() * 720 - 360 + 'deg');
      document.body.appendChild(c); setTimeout(() => c.remove(), 1500);
    }
  }
  const centerConfetti = () => confetti(innerWidth / 2, innerHeight / 2.2);
  window.RyuUI = { toast, confetti, store };

  /* ---------- menu mobile ---------- */
  const menuButton = $('.menu-toggle'), nav = $('.nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    $$('a', nav).forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }));
  }
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- revelar ao rolar ---------- */
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target; el.classList.add('visible'); observer.unobserve(el);
        setTimeout(() => { el.style.transitionDelay = ''; }, 1000);
      }
    }), { threshold: .12 });
    revealItems.forEach((item, i) => { item.style.transitionDelay = (i % 3) * 65 + 'ms'; observer.observe(item); });
  } else revealItems.forEach(item => item.classList.add('visible'));

  /* ---------- barra de progresso ---------- */
  const bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- menu ativo conforme a seção ---------- */
  if ('IntersectionObserver' in window && nav) {
    const links = $$('a[href^="#"]', nav);
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { links.forEach(l => l.classList.remove('active')); const l = map.get(e.target.id); if (l) l.classList.add('active'); }
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- mostruário de estilos de edição ---------- */
  const styles = {
    viral: { kicker: 'CONTEÚDO VERTICAL · ALTA RETENÇÃO', title: 'Edição para vídeos virais', desc: 'Ritmo rápido, cortes precisos, legendas com personalidade, sound design e efeitos visuais que ajudam a segurar a atenção sem deixar o vídeo cansativo.', tags: ['Reels', 'TikTok', 'YouTube Shorts'], bg: 'linear-gradient(145deg,#d8c9f0,#a58bd6)', titleColor: '#fff', emColor: '#30233b', heading: 'PARA.<br>OLHA.<br><em>ASSISTE.</em>', code: 'RYU / CUT 001' },
    commercial: { kicker: 'PUBLICIDADE · MARCAS & PRODUTOS', title: 'Comerciais que valorizam a marca', desc: 'Imagens bem escolhidas, ritmo intencional, textos claros e acabamento sonoro para apresentar produtos e serviços com um visual profissional.', tags: ['Anúncios', 'Produtos', 'Campanhas'], bg: 'linear-gradient(145deg,#e8d9c7,#bd936a)', titleColor: '#fff9ed', emColor: '#3b291e', heading: 'SUA MARCA.<br><em>EM FOCO.</em>', code: 'RYU / CUT 002' },
    motion: { kicker: 'ANIMAÇÃO · DESIGN EM MOVIMENTO', title: 'Motion design com personalidade', desc: 'Tipografia animada, formas 2D e 3D, transições e composições gráficas para dar vida a conceitos e construir uma identidade marcante.', tags: ['After Effects', 'Tipografia', 'Animação'], bg: 'linear-gradient(145deg,#b9d6d1,#759f9c)', titleColor: '#f6ffff', emColor: '#173b3b', heading: 'DESIGN<br>QUE <em>SE MOVE.</em>', code: 'RYU / CUT 003' },
    cinematic: { kicker: 'ATMOSFERA · HISTÓRIA & EMOÇÃO', title: 'Edição cinematográfica', desc: 'Color grading, sound design, ritmo narrativo e escolhas de enquadramento que ajudam cada cena a transmitir a sensação certa.', tags: ['Color grading', 'Narrativa', 'Sound design'], bg: 'linear-gradient(145deg,#343244,#111017)', titleColor: '#f4edff', emColor: '#bca0ee', heading: 'SINTA<br>CADA <em>CENA.</em>', code: 'RYU / CUT 004' },
    social: { kicker: 'CONTEÚDO DIGITAL · IDENTIDADE', title: 'Conteúdo para redes sociais', desc: 'Vídeos pensados para cada plataforma, com linguagem visual consistente, hierarquia de informação e formatos preparados para feed e stories.', tags: ['Instagram', 'Stories', 'Conteúdo de marca'], bg: 'linear-gradient(145deg,#f3c5d6,#c69ce2)', titleColor: '#fff7fc', emColor: '#4b294b', heading: 'FEITO<br>PRA <em>APARECER.</em>', code: 'RYU / CUT 005' },
    story: { kicker: 'NARRATIVA · RITMO & SENTIMENTO', title: 'Storytelling e edição narrativa', desc: 'Uma edição que conduz o olhar, constrói expectativa e conecta as cenas para transformar informação em uma história mais envolvente.', tags: ['Narrativa', 'YouTube', 'Documental'], bg: 'linear-gradient(145deg,#d3d0ec,#9387bd)', titleColor: '#fff', emColor: '#2d2941', heading: 'CADA CORTE<br>CONTA <em>ALGO.</em>', code: 'RYU / CUT 006' }
  };
  const tabs = $$('.style-tab');
  const art = $('#showcase-art'), kicker = $('#style-kicker'), title = $('#style-title'), desc = $('#style-description'),
    tagBox = $('#style-tags'), screenHeading = $('#screen-heading'), screenCode = $('#screen-code');
  function activateStyle(key) {
    const s = styles[key]; if (!s || !art) return;
    tabs.forEach(tab => { const active = tab.dataset.style === key; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
    art.style.background = s.bg; kicker.textContent = s.kicker; title.textContent = s.title; desc.textContent = s.desc;
    screenHeading.innerHTML = s.heading; screenHeading.style.color = s.titleColor; screenHeading.querySelector('em').style.color = s.emColor; screenCode.textContent = s.code;
    tagBox.replaceChildren(...s.tags.map(tag => { const span = document.createElement('span'); span.textContent = tag; return span; }));
    if (!reduced) art.animate([{ opacity: .6, transform: 'scale(.99)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
  }
  tabs.forEach(tab => tab.addEventListener('click', () => activateStyle(tab.dataset.style)));

  /* ---------- player do mostruário (play/pause + timecode) ---------- */
  const playBtn = $('.fake-play'), timeEl = $('.screen-time');
  if (playBtn && art && timeEl) {
    let frames = 0, timer = null;
    const m = timeEl.textContent.match(/(\d+):(\d+):(\d+):(\d+)/);
    if (m) frames = ((+m[1] * 60 + +m[2]) * 60 + +m[3]) * 24 + +m[4];
    const fmt = f => { const p = n => String(n).padStart(2, '0'); const s = Math.floor(f / 24); return p(Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(s % 60) + ':' + p(f % 24); };
    playBtn.setAttribute('aria-label', 'Reproduzir prévia');
    playBtn.addEventListener('click', () => {
      const on = art.classList.toggle('playing'); playBtn.textContent = on ? '❚❚' : '▶';
      playBtn.setAttribute('aria-label', on ? 'Pausar prévia' : 'Reproduzir prévia');
      clearInterval(timer);
      if (on) timer = setInterval(() => { frames++; timeEl.textContent = fmt(frames); }, 42);
    });
  }

  /* ---------- mini painel do plugin na home ---------- */
  const win = $('.plugin-window');
  if (win) {
    const keys = { Easing: 'fx-easing', Text: 'fx-text', Loop: 'fx-loop', '3D': 'fx-3d' };
    $$('.plugin-controls b', win).forEach(b => {
      b.setAttribute('role', 'button'); b.tabIndex = 0;
      const toggle = () => { const on = b.classList.toggle('on'); win.classList.toggle(keys[b.textContent.trim()], on); };
      b.addEventListener('click', toggle);
      b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
  }

  /* ---------- digitação ---------- */
  const typer = $('#typer');
  if (typer) {
    const words = (typer.dataset.words || '').split('|').filter(Boolean);
    if (reduced || !words.length) typer.textContent = words[0] || '';
    else {
      let w = 0, c = 0, del = false;
      const tick = () => {
        const word = words[w];
        typer.textContent = word.slice(0, c);
        if (!del && c < word.length) { c++; setTimeout(tick, 85); }
        else if (!del) { del = true; setTimeout(tick, 1500); }
        else if (c > 0) { c--; setTimeout(tick, 45); }
        else { del = false; w = (w + 1) % words.length; setTimeout(tick, 250); }
      };
      tick();
    }
  }

  /* ---------- contadores ---------- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const run = el => {
      const end = +el.dataset.count, suf = el.dataset.suffix || '', pre = el.dataset.prefix || '', pad = +el.dataset.pad || 0;
      const fmt = n => pre + String(n).padStart(pad, '0') + suf;
      if (reduced) { el.textContent = fmt(end); return; }
      const t0 = performance.now(), dur = 1100;
      const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(end * e)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .5 });
      counters.forEach(c => io.observe(c));
    } else counters.forEach(run);
  }

  /* ---------- mascotes que falam ---------- */
  $$('.mascot').forEach(m => {
    if (!m.dataset.says) return;
    m.setAttribute('role', 'button'); m.tabIndex = 0;
    const say = () => {
      const lines = m.dataset.says.split('|');
      $$('.mascot-bubble', m).forEach(b => b.remove());
      const b = document.createElement('span'); b.className = 'mascot-bubble'; b.textContent = lines[Math.floor(Math.random() * lines.length)];
      m.appendChild(b); setTimeout(() => b.remove(), 2700);
      m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop');
    };
    m.addEventListener('click', say);
    m.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); say(); } });
  });

  /* ---------- ripple em botões ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('.btn,.style-tab,.plugin-option a,.chip-btn,.header-cta'); if (!t || reduced) return;
    const r = t.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2;
    const s = document.createElement('span'); s.className = 'ripple';
    s.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px';
    t.appendChild(s); setTimeout(() => s.remove(), 650);
  });

  /* ---------- transição entre páginas ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:)/.test(href) || !/\.html(#.*)?$/.test(href)) return;
    if (reduced) return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(() => { location.href = href; }, 220);
  });
  addEventListener('pageshow', () => document.body.classList.remove('leaving'));

  /* ---------- ímã nos botões, tilt nos cards, banner 3D ---------- */
  const canHoverFx = canHover && !reduced;
  if (canHoverFx) {
    document.addEventListener('pointermove', e => {
      const g = $('.cursor-glow') || (() => { const d = document.createElement('div'); d.className = 'cursor-glow'; document.body.appendChild(d); return d; })();
      g.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; g.style.opacity = '1';
    }, { passive: true });
    document.addEventListener('pointerleave', () => { const g = $('.cursor-glow'); if (g) g.style.opacity = '0'; });

    $$('.btn,.header-cta').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * .16) + 'px ' + ((e.clientY - r.top - r.height / 2) * .22) + 'px'; });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
    $$('.course-card,.download-card,.learn-card').forEach(card => {
      if (card.classList.contains('learn-card')) return;
      card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; card.style.transform = 'perspective(900px) rotateX(' + ((.5 - y) * 3) + 'deg) rotateY(' + ((x - .5) * 4) + 'deg) translateY(-3px)'; });
      card.addEventListener('pointerleave', () => card.style.transform = '');
    });
    const heroArt = $('.hero-art'), banner = $('.brand-banner');
    if (heroArt && banner) {
      heroArt.addEventListener('pointermove', e => { const r = heroArt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; banner.style.transform = 'perspective(900px) rotateY(' + (-8 + x * 11) + 'deg) rotateX(' + (3 - y * 7) + 'deg) translateY(-3px)'; });
      heroArt.addEventListener('pointerleave', () => banner.style.transform = '');
    }
  }

  /* ---------- acordeão: abrir/fechar todos ---------- */
  $$('[data-toggle-all]').forEach(btn => {
    const scope = document.querySelector(btn.dataset.toggleAll); if (!scope) return;
    btn.addEventListener('click', () => {
      const list = $$('details', scope), anyClosed = list.some(d => !d.open);
      list.forEach(d => d.open = anyClosed); btn.textContent = anyClosed ? 'Fechar todos' : 'Abrir todos';
    });
  });

  /* ---------- playground de easing (página do plugin) ---------- */
  const pg = $('#pg');
  if (pg) {
    const ball = $('.pg-ball', pg), track = $('.pg-track', pg), curve = $('#pg-curve'), code = $('#pg-code'), text = $('#pg-text');
    const dur = $('#pg-dur'), durOut = $('#pg-dur-out'), btns = $$('[data-ease]', pg), loopBtn = $('#pg-loop'), run = $('#pg-run');
    let cur = btns[0], loop = false, anim = null, letters = [];
    if (text) { const w = text.dataset.text || 'MAKE IT MOVE'; text.textContent = ''; letters = [...w].map(ch => { const s = document.createElement('span'); s.innerHTML = ch === ' ' ? '&nbsp;' : ch; text.appendChild(s); return s; }); }
    const bez = () => cur.dataset.ease.split(',').map(Number);
    const drawCurve = () => { const [a, b, c, d] = bez(); curve.setAttribute('d', 'M10,110 C' + (10 + a * 100) + ',' + (110 - b * 100) + ' ' + (10 + c * 100) + ',' + (110 - d * 100) + ' 110,10'); code.textContent = 'cubic-bezier(' + bez().join(', ') + ')'; };
    const play = () => {
      if (anim) anim.cancel();
      const ms = +dur.value, dist = track.clientWidth - 52 - 20, easing = 'cubic-bezier(' + bez().join(',') + ')';
      if (reduced) { ball.style.transform = 'translateX(' + dist + 'px)'; return; }
      anim = ball.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + dist + 'px)' }], { duration: ms, easing, fill: 'forwards', iterations: loop ? Infinity : 1, direction: loop ? 'alternate' : 'normal' });
      letters.forEach((s, i) => s.animate([{ transform: 'translateY(34px) rotate(8deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: ms * .7, delay: i * 55, easing, fill: 'backwards' }));
    };
    btns.forEach(b => b.addEventListener('click', () => { btns.forEach(x => x.classList.remove('on')); b.classList.add('on'); cur = b; drawCurve(); play(); }));
    dur.addEventListener('input', () => { durOut.textContent = dur.value + ' ms'; });
    dur.addEventListener('change', play);
    if (loopBtn) loopBtn.addEventListener('click', () => { loop = !loop; loopBtn.classList.toggle('on', loop); play(); });
    run.addEventListener('click', play);
    btns[0].classList.add('on'); drawCurve();
    if ('IntersectionObserver' in window) { const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { play(); o.disconnect(); } }, { threshold: .4 }); o.observe(pg); }
  }

  /* ---------- fogo roxo, patinhas escondidas e easter eggs ---------- */
  const TOTAL = 5;
  let fire = store.get('ryu-fire') === '1';
  const applyFire = on => { fire = on; document.body.classList.toggle('fire-mode', on); store.set('ryu-fire', on ? '1' : '0'); };
  if (fire) document.body.classList.add('fire-mode');
  let lastEmber = 0;
  document.addEventListener('pointermove', e => {
    if (!fire || !canHoverFx) return; const now = performance.now(); if (now - lastEmber < 45) return; lastEmber = now;
    const s = document.createElement('span'); s.className = 'ember'; s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
    s.style.setProperty('--dx', (Math.random() * 30 - 15) + 'px'); document.body.appendChild(s); setTimeout(() => s.remove(), 950);
  }, { passive: true });

  const found = () => (store.get('ryu-paws') || '').split(',').filter(Boolean);
  let badge;
  const showBadge = () => {
    const n = found().length; if (!n) return;
    if (!badge) { badge = document.createElement('div'); badge.className = 'paw-badge'; document.body.appendChild(badge); }
    badge.textContent = '🐾 ' + n + '/' + TOTAL; requestAnimationFrame(() => badge.classList.add('show'));
  };
  $$('.paw').forEach(p => {
    if (found().includes(p.dataset.paw)) p.classList.add('found');
    p.addEventListener('click', e => {
      e.stopPropagation(); const list = found(); if (list.includes(p.dataset.paw)) return;
      list.push(p.dataset.paw); store.set('ryu-paws', list.join(',')); p.classList.add('found'); showBadge();
      const r = p.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, 16);
      if (list.length >= TOTAL) { setTimeout(() => { centerConfetti(); applyFire(true); toast('🔥 Você achou todas as patinhas! Modo Fogo Roxo ativado.'); }, 450); }
      else toast('🐾 Patinha encontrada! ' + list.length + ' de ' + TOTAL + '. Ainda tem mais escondida por aí...');
    });
  });
  showBadge();
  $$('[data-paw-hint]').forEach(h => h.addEventListener('click', () => toast('Dica: passe o mouse (ou toque) em cantos vazios das páginas. São ' + TOTAL + ' patinhas no total.')));

  // 5 cliques rápidos na logo
  const brand = $('.header .brand[href^="#"]');
  if (brand) {
    let clicks = 0, t;
    brand.addEventListener('click', () => {
      clicks++; clearTimeout(t); t = setTimeout(() => clicks = 0, 1400);
      if (clicks >= 5) { clicks = 0; document.body.classList.add('shake'); setTimeout(() => document.body.classList.remove('shake'), 500); centerConfetti(); toast('RAAAWR! 🐯 Você achou o rugido secreto.'); }
    });
  }
  // código secreto
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let pos = 0;
  addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = k === seq[pos] ? pos + 1 : (k === seq[0] ? 1 : 0);
    if (pos === seq.length) { pos = 0; applyFire(!fire); centerConfetti(); toast(fire ? '🔥 Modo Fogo Roxo ligado!' : 'Modo Fogo Roxo desligado.'); }
  });
})();
