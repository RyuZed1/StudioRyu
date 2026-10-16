/* RYU RUN — corra com o tigre, pule os glitches e pegue 5 ✳ para ativar o Modo Fogo
   Agora com sprites animados (corrida, pulo e aterrissagem) e ranking de quem tenta. */
(() => {
  const stage = document.getElementById('game-stage');
  if (!stage) return;

  /* ============================================================
     RANKING GLOBAL (opcional)
     Sem nada aqui, o ranking funciona só neste navegador.
     Para ranking compartilhado entre todo mundo, crie um Firebase
     Realtime Database (grátis) e cole a URL abaixo, por exemplo:
     'https://meu-projeto-default-rtdb.firebaseio.com'
     (veja o README para o passo a passo e as regras do banco)
     ============================================================ */
  const RANK_URL = '';

  const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
  const overlay = document.getElementById('game-overlay'), ovTitle = document.getElementById('g-title'),
    ovText = document.getElementById('g-text'), ovBtn = document.getElementById('g-start'),
    elScore = document.getElementById('g-score'), elBest = document.getElementById('g-best'),
    elStars = document.getElementById('g-stars'), elMeter = document.getElementById('g-meter'),
    saveForm = document.getElementById('g-save'), nameIn = document.getElementById('g-name'),
    rankList = document.getElementById('rank-list'), rankEmpty = document.getElementById('rank-empty'),
    rankTag = document.getElementById('rank-tag');
  const ui = window.RyuUI || { store: { get() { return null; }, set() {} }, toast() {}, confetti() {} };

  /* ---------- sprites ---------- */
  const load = src => { const im = new Image(); im.src = src; return im; };
  const SP = window.RYU_SPRITES || {};
  const spr = { run: load(SP.run || 'assets/tiger-run.png'), jump: load(SP.jump || 'assets/tiger-jump.png'), land: load(SP.land || 'assets/tiger-land.png') };
  const avatar = load('assets/ryu-tiger-avatar.jpeg');
  const ready = im => im.complete && im.naturalWidth > 0;
  const sprReady = () => ready(spr.run) && ready(spr.jump) && ready(spr.land);
  const CELL_W = 168, CELL_H = { run: 147, jump: 154, land: 142 }, ANCH = 97, NF = { run: 10, jump: 7, land: 4 };
  let DS = .8, OS = 1.15; // escala do tigre e dos obstáculos (acompanham a altura da tela)

  let W = 600, H = 260, DPR = 1, GROUND = 216;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(280, stage.clientWidth);
    H = Math.round(Math.max(250, Math.min(320, W * .36)));
    GROUND = H - 44;
    DS = H * .00265; OS = Math.max(1, DS / .7);
    PH = Math.round(DS * 125); PX = Math.round(115 * DS);
    JUMP = -Math.sqrt(2 * GRAV * H * .4); // o pulo sempre cabe na tela
    if (p && state !== 'run' && p.vy === 0) { p.x = PX; p.y = GROUND - PH; }
    canvas.style.height = H + 'px';
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (state !== 'run') draw();
  }

  const GRAV = 2300; let JUMP = -760, PH = 90, PX = 94;
  let state = 'idle', raf = 0, last = 0, t = 0;
  let p, obstacles, stars, parts, dist, speed, score, starCount, fireT, nextGap, best = 0, flash = 0;
  let runPh = 0, airT = 0, landT = 0, jumpT = 9, lastScore = 0;
  best = parseInt(ui.store.get('ryu-best') || '0', 10) || 0;
  elBest.textContent = best;

  function reset() {
    p = { x: PX, y: GROUND - PH, vy: 0 };
    obstacles = []; stars = []; parts = [];
    dist = 0; speed = 300; score = 0; starCount = 0; fireT = 0; flash = 0; t = 0;
    runPh = 0; airT = 0; landT = 0; jumpT = 9;
    nextGap = 420; hud();
  }
  function hud() {
    elScore.textContent = score; elBest.textContent = best; elStars.textContent = starCount;
    if (elMeter) elMeter.style.setProperty('--p', (fireT > 0 ? 100 : starCount / 5 * 100) + '%');
  }
  const onGround = () => p.y + PH >= GROUND - .5;

  function dust(n, x, y, sp) {
    for (let i = 0; i < n; i++) parts.push({ x, y, vx: Math.random() * 120 - 60 - sp * .2, vy: -Math.random() * 90, life: .4, c: '#ffffffaa', r: 3 });
  }
  function jump() {
    if (state !== 'run') return;
    if (onGround()) { p.vy = JUMP; jumpT = 0; landT = 0; dust(7, p.x, GROUND, speed); }
  }

  function spawn() {
    const type = Math.random();
    let o;
    if (type < .4) o = { w: 26 * OS, h: 36 * OS, kind: 'spike' };
    else if (type < .7) o = { w: 54 * OS, h: 36 * OS, kind: 'spike2' };
    else o = { w: 30 * OS, h: 60 * OS, kind: 'block' };
    o.x = W + 40; obstacles.push(o);
    if (Math.random() < .5) stars.push({ x: o.x + o.w / 2, y: GROUND - o.h - 56 - Math.random() * 26, got: false, ph: Math.random() * 6 });
    nextGap = speed * (.85 + Math.random() * .75) + o.w + 150;
  }

  function startFire() {
    fireT = 6; starCount = 0; flash = 1; ui.toast('🔥 MODO FOGO! Nada te para por 6 segundos.');
    for (let i = 0; i < 30; i++) parts.push({ x: p.x, y: p.y + PH / 2, vx: Math.random() * 360 - 180, vy: Math.random() * 360 - 220, life: .7, c: '#c79bff', r: 4 });
  }

  function gameOver() {
    state = 'over'; lastScore = score;
    if (score > best) { best = score; ui.store.set('ryu-best', String(best)); }
    hud();
    const msg = score < 60 ? 'Aquecimento! Tenta de novo.' : score < 200 ? 'Boa corrida! Dá pra ir mais longe.' : score < 400 ? 'Que ritmo! Você pensa em cortes rápidos.' : 'Lendário! Isso sim é edição na velocidade do tigre.';
    show('Fim de corrida', score + ' pontos. ' + msg + (score >= best && score > 0 ? ' Novo recorde! 🏆' : ''), 'Jogar de novo', score > 0);
    if (score >= best && score > 150) ui.confetti(stage.getBoundingClientRect().left + W / 2, stage.getBoundingClientRect().top + H / 2, 40);
  }

  function show(title, text, btn, withForm) {
    ovTitle.textContent = title; ovText.textContent = text; ovBtn.firstChild.textContent = btn + ' '; overlay.classList.remove('hide');
    if (saveForm) {
      saveForm.hidden = !withForm;
      if (withForm && nameIn) { paintWho(); if (submitBtn) submitBtn.disabled = false; }
    }
  }
  function hide() { overlay.classList.add('hide'); if (saveForm) saveForm.hidden = true; }

  function start() {
    reset(); state = 'run'; hide(); stage.focus({ preventScroll: true });
    last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }

  function update(dt) {
    t += dt;
    speed = Math.min(300 + score * .55, 640);
    dist += speed * dt; score = Math.floor(dist / 10);
    // física
    const wasAir = !onGround();
    p.vy += GRAV * dt; p.y += p.vy * dt;
    if (p.y + PH > GROUND) {
      p.y = GROUND - PH; p.vy = 0;
      if (wasAir) { if (airT > .18) { landT = .24; dust(6, p.x, GROUND, speed); } airT = 0; }
    }
    if (!onGround()) { airT += dt; jumpT += dt; } else jumpT = 9;
    if (landT > 0) landT = Math.max(0, landT - dt);
    runPh += dt * (11 + speed / 45);
    if (fireT > 0) { fireT -= dt; if (fireT <= 0) { fireT = 0; ui.toast('O fogo acabou. Pegue mais 5 ✳!'); } }
    if (flash > 0) flash = Math.max(0, flash - dt * 2.5);
    // spawn
    nextGap -= speed * dt;
    if (nextGap <= 0) spawn();
    // mover
    obstacles.forEach(o => o.x -= speed * dt); stars.forEach(s => s.x -= speed * dt);
    obstacles = obstacles.filter(o => o.x + o.w > -20); stars = stars.filter(s => s.x > -30 && !s.got);
    // colisão
    const hb = { x: p.x - PH * .2, y: p.y + PH * .1, w: PH * .4, h: PH * .85 };
    for (const o of obstacles) {
      if (o.dead) continue;
      const ox = o.x + 4, ow = o.w - 8, oh = o.h * .86, oy = GROUND - oh;
      if (hb.x < ox + ow && hb.x + hb.w > ox && hb.y < oy + oh && hb.y + hb.h > oy) {
        if (fireT > 0) {
          o.dead = true; dist += 120;
          for (let i = 0; i < 16; i++) parts.push({ x: o.x + o.w / 2, y: GROUND - o.h / 2, vx: Math.random() * 400 - 120, vy: Math.random() * 400 - 300, life: .6, c: i % 2 ? '#c79bff' : '#fff', r: 3 });
        } else { gameOver(); return; }
      }
    }
    obstacles = obstacles.filter(o => !o.dead);
    // estrelas
    const cx = p.x, cy = p.y + PH / 2;
    for (const s of stars) {
      const sy = s.y + Math.sin(t * 4 + s.ph) * 4;
      if (Math.hypot(s.x - cx, sy - cy) < PH * .5 + 8) {
        s.got = true; dist += 30;
        for (let i = 0; i < 8; i++) parts.push({ x: s.x, y: sy, vx: Math.random() * 200 - 100, vy: Math.random() * 200 - 160, life: .45, c: '#9471ce', r: 3 });
        if (fireT <= 0) { starCount++; if (starCount >= 5) startFire(); }
      }
    }
    // partículas
    if (onGround() && Math.random() < .35) parts.push({ x: p.x - PH * .25, y: GROUND - 2, vx: -speed * .25 - Math.random() * 40, vy: -Math.random() * 40, life: .3, c: '#ffffff80', r: 2.4 });
    if (fireT > 0 && Math.random() < .8) parts.push({ x: p.x - 20, y: p.y + PH * (.2 + Math.random() * .7), vx: -speed * .5 - Math.random() * 80, vy: -Math.random() * 90, life: .5, c: Math.random() < .5 ? '#b57cff' : '#e6ccff', r: 4 });
    parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 500 * dt; q.life -= dt; });
    parts = parts.filter(q => q.life > 0);
    hud();
  }

  /* ---------- desenho ---------- */
  function star(x, y, r, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(-Math.cos(a) * r, -Math.sin(a) * r); }
    ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = '#7a53c0'; ctx.stroke(); ctx.restore();
  }
  function obstacle(o) {
    const x = o.x, base = GROUND;
    ctx.fillStyle = '#211d29'; ctx.strokeStyle = '#9471ce'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    if (o.kind === 'block') {
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, base - o.h, o.w, o.h, 6) : ctx.rect(x, base - o.h, o.w, o.h); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#9471ce'; ctx.fillRect(x + 6, base - o.h + 10, o.w - 12, 3); ctx.fillRect(x + 6, base - o.h + 20, o.w - 18, 3);
    } else {
      const n = o.kind === 'spike2' ? 2 : 1, w = o.w / n;
      for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.moveTo(x + i * w, base); ctx.lineTo(x + i * w + w / 2, base - o.h); ctx.lineTo(x + (i + 1) * w, base); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    }
  }

  // escolhe a animação e o quadro do tigre
  function pose() {
    if (state === 'idle') return { k: 'run', i: 0 };
    if (!onGround()) {
      const v = p.vy;
      let i = v < -500 ? 2 : v < 150 ? 3 : v < 450 ? 4 : v < 750 ? 5 : 6;
      if (jumpT < .07) i = 1;
      return { k: 'jump', i };
    }
    if (landT > 0) return { k: 'land', i: Math.min(NF.land - 1, Math.floor((.24 - landT) / .24 * NF.land)) };
    return { k: 'run', i: Math.floor(runPh) % NF.run };
  }
  function drawTiger() {
    if (!sprReady()) {
      // reserva enquanto os sprites carregam
      ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y + PH / 2, 30, 0, 6.283); ctx.fillStyle = '#7a64b0'; ctx.fill(); ctx.clip();
      if (ready(avatar)) ctx.drawImage(avatar, p.x - 30, p.y + PH / 2 - 30, 60, 60); ctx.restore(); return;
    }
    const { k, i } = pose(), ch = CELL_H[k], dw = CELL_W * DS, dh = ch * DS;
    const dx = p.x - ANCH * DS, dy = p.y + PH + 3 - dh;
    if (fireT > 0) { // rastro de fogo roxo
      ctx.save(); ctx.globalAlpha = .22; ctx.filter = 'hue-rotate(20deg) saturate(1.6)';
      for (let n = 3; n >= 1; n--) ctx.drawImage(spr[k], i * CELL_W, 0, CELL_W, ch, dx - n * 16, dy, dw, dh);
      ctx.restore();
      ctx.shadowColor = '#b57cff'; ctx.shadowBlur = 22;
    }
    ctx.drawImage(spr[k], i * CELL_W, 0, CELL_W, ch, dx, dy, dw, dh);
    ctx.shadowBlur = 0;
  }

  function draw() {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, fireT > 0 ? '#c7aaf5' : '#e6dcf6'); g.addColorStop(1, fireT > 0 ? '#8e63d6' : '#c9b6ec');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const d = dist || 0;
    // fundo: círculos e grade de timeline
    ctx.fillStyle = '#ffffff30';
    for (let i = 0; i < 4; i++) { const x = ((i * 260 - d * .12) % (W + 260) + (W + 260)) % (W + 260) - 130; ctx.beginPath(); ctx.arc(x, 70 + (i % 2) * 40, 46 + i * 8, 0, 6.283); ctx.fill(); }
    ctx.strokeStyle = '#ffffff40'; ctx.lineWidth = 1;
    for (let i = -1; i < W / 60 + 2; i++) { const x = i * 60 - (d * .35 % 60); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GROUND); ctx.stroke(); }
    ctx.fillStyle = '#7a53c0'; ctx.font = '700 10px sans-serif'; ctx.textAlign = 'left';
    const fr = Math.floor(d / 10), p2 = n => String(n).padStart(2, '0');
    ctx.fillText('RYU / ' + p2(Math.floor(fr / 24 / 60) % 60) + ':' + p2(Math.floor(fr / 24) % 60) + ':' + p2(fr % 24), 14, 20);
    // chão = trilha de timeline
    ctx.fillStyle = '#2b2535'; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#9471ce'; ctx.fillRect(0, GROUND, W, 3);
    for (let i = -1; i < W / 110 + 2; i++) {
      const x = i * 110 - (d % 110), k = Math.abs(Math.floor((d - x) / 110)) % 3;
      ctx.fillStyle = ['#5b4287', '#7a58b3', '#3f3157'][k];
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x + 4, GROUND + 14, 100, 14, 5) : ctx.rect(x + 4, GROUND + 14, 100, 14); ctx.fill();
    }
    // objetos
    stars.forEach(s => star(s.x, s.y + Math.sin(t * 4 + s.ph) * 4, 9, t * 2 + s.ph));
    obstacles.forEach(obstacle);
    // sombra
    const air = Math.max(0, GROUND - (p.y + PH));
    ctx.fillStyle = '#00000030'; ctx.beginPath(); ctx.ellipse(p.x, GROUND + 2, PH * .36 * (1 - Math.min(.7, air / 260)), 5, 0, 0, 6.283); ctx.fill();
    // tigre
    drawTiger();
    // partículas
    parts.forEach(q => { ctx.globalAlpha = Math.max(0, Math.min(1, q.life * 2.2)); ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283); ctx.fill(); }); ctx.globalAlpha = 1;
    if (flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + flash * .55 + ')'; ctx.fillRect(0, 0, W, H); }
  }

  function loop(now) {
    if (state !== 'run') return;
    const dt = Math.min(.033, (now - last) / 1000); last = now;
    update(dt);
    if (state === 'run') { draw(); raf = requestAnimationFrame(loop); } else draw();
  }

  /* ---------- ranking ---------- */
  const RK = 'ryu-rank';
  const RP = window.RyuProfile;
  const keyOf = n => String(n).toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24) || 'anon';
  const safePhoto = p => (RP ? RP.okPhoto(p) : false) ? p : '';
  const entryKey = e => String(e.id || keyOf(e.name));
  const localList = () => { try { const l = JSON.parse(ui.store.get(RK) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
  function localSave(p, bio, sc) {
    const l = localList(), k = String(p.id), e = l.find(x => entryKey(x) === k);
    if (e) { e.tries = (e.tries || 1) + 1; e.score = Math.max(e.score || 0, sc); e.name = p.name; e.photo = p.photo; e.bio = bio; }
    else l.push({ id: p.id, name: p.name, photo: p.photo, bio, score: sc, tries: 1 });
    l.sort((a, b) => b.score - a.score);
    ui.store.set(RK, JSON.stringify(l.slice(0, 100)));
  }
  const remote = RANK_URL.replace(/\/+$/, '');
  async function rf(path, opts) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 7000);
    try { const r = await fetch(remote + path, Object.assign({ signal: ctl.signal }, opts)); if (!r.ok) throw new Error(r.status); return await r.json(); }
    finally { clearTimeout(to); }
  }
  async function remoteSave(p, bio, sc) {
    const k = String(p.id), cur = await rf('/ranking/' + k + '.json');
    const entry = { id: k, name: p.name, photo: p.photo || '', bio, score: Math.max(sc, cur && +cur.score || 0), tries: (cur && +cur.tries || 0) + 1, t: Date.now() };
    await rf('/ranking/' + k + '.json', { method: 'PUT', body: JSON.stringify(entry) });
  }
  async function getList() {
    if (remote) {
      try {
        const o = await rf('/ranking.json');
        const l = o ? Object.values(o).filter(x => x && typeof x.score === 'number') : [];
        return { list: l, global: true };
      } catch (e) { /* cai para o ranking local */ }
    }
    return { list: localList(), global: false, offline: !!remote };
  }
  async function renderRank() {
    if (!rankList) return;
    const { list, global, offline } = await getList();
    const prof = RP && RP.get(), me = prof ? String(prof.id) : '';
    list.sort((a, b) => b.score - a.score || (a.tries || 1) - (b.tries || 1));
    const top = list.slice(0, 10);
    rankList.replaceChildren(...top.map((e, i) => {
      const name = String(e.name || '?').slice(0, 14), tries = +e.tries || 1, bio = String(e.bio || '').slice(0, 60);
      const li = document.createElement('li');
      if (me && entryKey(e) === me) li.className = 'me';
      li.style.animationDelay = i * 40 + 'ms';
      const pos = document.createElement('span'); pos.className = 'rk-pos'; pos.textContent = i < 3 ? ['🥇', '🥈', '🥉'][i] : String(i + 1);
      const av = RP ? RP.avatar({ name, photo: safePhoto(e.photo) }, 42) : document.createElement('span');
      const who = document.createElement('span'); who.className = 'rk-who';
      const nm = document.createElement('b'); nm.className = 'rk-name'; nm.textContent = name; who.append(nm);
      if (bio) { const q = document.createElement('em'); q.className = 'rk-bio'; q.textContent = '“' + bio + '”'; who.append(q); }
      const tr = document.createElement('span'); tr.className = 'rk-tries'; tr.textContent = tries + (tries === 1 ? ' tentativa' : ' tentativas');
      const sc = document.createElement('b'); sc.className = 'rk-score'; sc.textContent = Math.round(+e.score) || 0;
      li.append(pos, av, who, tr, sc); return li;
    }));
    if (rankEmpty) rankEmpty.hidden = top.length > 0;
    if (rankTag) rankTag.textContent = global ? 'RANKING GLOBAL' : offline ? 'SEM CONEXÃO · NESTE NAVEGADOR' : 'NESTE NAVEGADOR';
  }

  /* quem está salvando: perfil logado ou convite para entrar */
  const whoBox = document.getElementById('g-who'), submitBtn = document.getElementById('g-submit');
  function paintWho() {
    if (!whoBox) return;
    const p = RP && RP.get(); whoBox.replaceChildren();
    nameIn.hidden = submitBtn.hidden = !p;
    if (p) {
      const t = document.createElement('span'); t.className = 'g-who-t';
      const n = document.createElement('b'); n.textContent = p.name;
      const c = document.createElement('button'); c.type = 'button'; c.className = 'g-link'; c.textContent = 'trocar perfil';
      c.addEventListener('click', () => RP.open());
      t.append(n, c); whoBox.append(RP.avatar(p, 40), t);
      if (!nameIn.dataset.touched) nameIn.value = p.bio || '';
    } else {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn light-btn'; b.textContent = 'Entrar para salvar no ranking ';
      const sp = document.createElement('span'); sp.textContent = '☺'; b.append(sp);
      b.addEventListener('click', () => RP && RP.open());
      whoBox.append(b);
    }
  }
  if (nameIn) nameIn.addEventListener('input', () => { nameIn.dataset.touched = '1'; });
  if (RP) RP.onChange(() => { paintWho(); renderRank(); });
  if (saveForm) saveForm.addEventListener('submit', async e => {
    e.preventDefault(); e.stopPropagation();
    const p = RP && RP.get(); if (!p) { RP && RP.open(); return; }
    const bio = RP.clean(nameIn.value, 60);
    if (submitBtn) submitBtn.disabled = true;
    localSave(p, bio, lastScore);
    if (remote) { try { await remoteSave(p, bio, lastScore); } catch (err) { ui.toast('Salvo só neste navegador (ranking global fora do ar).'); } }
    saveForm.hidden = true; ui.toast('🏆 ' + p.name + ' entrou no ranking com ' + lastScore + ' pontos!');
    renderRank();
  });
  ['keydown', 'keyup', 'pointerdown'].forEach(ev => saveForm && saveForm.addEventListener(ev, e => e.stopPropagation()));

  /* ---------- controles ---------- */
  ovBtn.addEventListener('click', e => { e.stopPropagation(); start(); });
  canvas.addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
  addEventListener('keydown', e => {
    const k = e.code;
    if (k !== 'Space' && k !== 'ArrowUp' && k !== 'KeyW') return;
    if (state === 'run') { e.preventDefault(); jump(); }
    else if (document.activeElement === stage && state !== 'run') { e.preventDefault(); start(); }
  });
  // pausa quando sai da tela ou da aba
  function pause() { if (state === 'run') { state = 'paused'; cancelAnimationFrame(raf); show('Pausado', 'Toque em continuar para voltar de onde parou.', 'Continuar', false); } }
  function resume() { state = 'run'; hide(); last = performance.now(); raf = requestAnimationFrame(loop); }
  ovBtn.addEventListener('click', e => { if (state === 'paused') { e.stopImmediatePropagation(); resume(); } }, true);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { if (!es[0].isIntersecting) pause(); }, { threshold: .2 }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  addEventListener('resize', resize);

  reset(); resize(); renderRank();
  const wait = setInterval(() => { draw(); if (sprReady()) clearInterval(wait); }, 200);
  draw();
})();
