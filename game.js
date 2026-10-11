/* RYU RUN — corra com o tigre, pule os glitches e pegue 5 ✳ para ativar o Modo Fogo */
(() => {
  const stage = document.getElementById('game-stage');
  if (!stage) return;
  const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
  const overlay = document.getElementById('game-overlay'), ovTitle = document.getElementById('g-title'),
    ovText = document.getElementById('g-text'), ovBtn = document.getElementById('g-start'),
    elScore = document.getElementById('g-score'), elBest = document.getElementById('g-best'),
    elStars = document.getElementById('g-stars'), elMeter = document.getElementById('g-meter');
  const ui = window.RyuUI || { store: { get() { return null; }, set() {} }, toast() {}, confetti() {} };

  const imgs = { run: new Image(), fire: new Image() };
  imgs.run.src = 'assets/ryu-tiger-avatar.jpeg';
  imgs.fire.src = 'assets/tigre-tiguer.jpeg';
  const ready = im => im.complete && im.naturalWidth > 0;

  let W = 600, H = 260, DPR = 1, GROUND = 216;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(280, stage.clientWidth);
    H = Math.round(Math.max(220, Math.min(300, W * .36)));
    GROUND = H - 44;
    canvas.style.height = H + 'px';
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (state !== 'run') draw();
  }

  const GRAV = 2300, JUMP = -800, SIZE = 56;
  let state = 'idle', raf = 0, last = 0, t = 0;
  let p, obstacles, stars, parts, dist, speed, score, starCount, fireT, nextGap, best = 0, flash = 0;
  best = parseInt(ui.store.get('ryu-best') || '0', 10) || 0;
  elBest.textContent = best;

  function reset() {
    p = { x: 56, y: GROUND - SIZE, vy: 0, rot: 0 };
    obstacles = []; stars = []; parts = [];
    dist = 0; speed = 300; score = 0; starCount = 0; fireT = 0; flash = 0; t = 0;
    nextGap = 420; hud();
  }
  function hud() {
    elScore.textContent = score; elBest.textContent = best; elStars.textContent = starCount;
    if (elMeter) elMeter.style.setProperty('--p', (fireT > 0 ? 100 : starCount / 5 * 100) + '%');
  }
  const onGround = () => p.y + SIZE >= GROUND - .5;

  function jump() {
    if (state !== 'run') return;
    if (onGround()) { p.vy = JUMP; for (let i = 0; i < 6; i++) parts.push({ x: p.x + SIZE / 2, y: GROUND, vx: Math.random() * 120 - 60 - speed * .2, vy: -Math.random() * 90, life: .4, c: '#ffffffaa', r: 3 }); }
  }

  function spawn() {
    const type = Math.random();
    let o;
    if (type < .4) o = { w: 26, h: 36, kind: 'spike' };
    else if (type < .7) o = { w: 54, h: 36, kind: 'spike2' };
    else o = { w: 30, h: 60, kind: 'block' };
    o.x = W + 40; obstacles.push(o);
    if (Math.random() < .5) stars.push({ x: o.x + o.w / 2, y: GROUND - o.h - 56 - Math.random() * 26, got: false, ph: Math.random() * 6 });
    nextGap = speed * (.85 + Math.random() * .75) + o.w + 150;
  }

  function startFire() {
    fireT = 6; starCount = 0; flash = 1; ui.toast('🔥 MODO FOGO! Nada te para por 6 segundos.');
    for (let i = 0; i < 30; i++) parts.push({ x: p.x + SIZE / 2, y: p.y + SIZE / 2, vx: Math.random() * 360 - 180, vy: Math.random() * 360 - 220, life: .7, c: '#c79bff', r: 4 });
  }

  function gameOver() {
    state = 'over';
    if (score > best) { best = score; ui.store.set('ryu-best', String(best)); }
    hud();
    const msg = score < 60 ? 'Aquecimento! Tenta de novo.' : score < 200 ? 'Boa corrida! Dá pra ir mais longe.' : score < 400 ? 'Que ritmo! Você pensa em cortes rápidos.' : 'Lendário! Isso sim é edição na velocidade do tigre.';
    show('Fim de corrida', score + ' pontos. ' + msg + (score >= best && score > 0 ? ' Novo recorde! 🏆' : ''), 'Jogar de novo');
    if (score >= best && score > 150) ui.confetti(stage.getBoundingClientRect().left + W / 2, stage.getBoundingClientRect().top + H / 2, 40);
  }

  function show(title, text, btn) { ovTitle.textContent = title; ovText.textContent = text; ovBtn.firstChild.textContent = btn + ' '; overlay.classList.remove('hide'); }
  function hide() { overlay.classList.add('hide'); }

  function start() {
    reset(); state = 'run'; hide(); stage.focus({ preventScroll: true });
    last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }

  function update(dt) {
    t += dt;
    speed = Math.min(300 + score * .55, 640);
    dist += speed * dt; score = Math.floor(dist / 10);
    // física
    p.vy += GRAV * dt; p.y += p.vy * dt;
    if (p.y + SIZE > GROUND) { p.y = GROUND - SIZE; p.vy = 0; p.rot = 0; }
    else p.rot += dt * 7 * (p.vy < 0 ? 1 : 1.4) * (fireT > 0 ? 1.4 : 1);
    if (fireT > 0) { fireT -= dt; if (fireT <= 0) { fireT = 0; ui.toast('O fogo acabou. Pegue mais 5 ✳!'); } }
    if (flash > 0) flash = Math.max(0, flash - dt * 2.5);
    // spawn
    nextGap -= speed * dt;
    if (nextGap <= 0) spawn();
    // mover
    obstacles.forEach(o => o.x -= speed * dt); stars.forEach(s => s.x -= speed * dt);
    obstacles = obstacles.filter(o => o.x + o.w > -20); stars = stars.filter(s => s.x > -30 && !s.got);
    // colisão
    const hb = { x: p.x + 10, y: p.y + 8, w: SIZE - 20, h: SIZE - 14 };
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
    const cx = p.x + SIZE / 2, cy = p.y + SIZE / 2;
    for (const s of stars) {
      const sy = s.y + Math.sin(t * 4 + s.ph) * 4;
      if (Math.hypot(s.x - cx, sy - cy) < SIZE / 2 + 14) {
        s.got = true; dist += 30;
        for (let i = 0; i < 8; i++) parts.push({ x: s.x, y: sy, vx: Math.random() * 200 - 100, vy: Math.random() * 200 - 160, life: .45, c: '#9471ce', r: 3 });
        if (fireT <= 0) { starCount++; if (starCount >= 5) startFire(); }
      }
    }
    // partículas
    if (fireT > 0 && Math.random() < .8) parts.push({ x: p.x + 8, y: p.y + SIZE * (.3 + Math.random() * .6), vx: -speed * .5 - Math.random() * 80, vy: -Math.random() * 90, life: .5, c: Math.random() < .5 ? '#b57cff' : '#e6ccff', r: 4 });
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
    const air = Math.max(0, GROUND - (p.y + SIZE));
    ctx.fillStyle = '#00000030'; ctx.beginPath(); ctx.ellipse(p.x + SIZE / 2, GROUND + 2, SIZE / 2 * (1 - air / 300), 5, 0, 0, 6.283); ctx.fill();
    // tigre
    const bob = onGround() && state === 'run' ? -Math.abs(Math.sin(t * 15)) * 4 : 0;
    ctx.save(); ctx.translate(p.x + SIZE / 2, p.y + SIZE / 2 + bob); ctx.rotate(onGround() ? Math.sin(t * 15) * .07 : p.rot);
    if (fireT > 0) { ctx.shadowColor = '#b57cff'; ctx.shadowBlur = 24; }
    ctx.beginPath(); ctx.arc(0, 0, SIZE / 2, 0, 6.283); ctx.fillStyle = '#7a64b0'; ctx.fill(); ctx.save(); ctx.clip();
    const im = fireT > 0 ? imgs.fire : imgs.run; if (ready(im)) ctx.drawImage(im, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
    ctx.restore(); ctx.shadowBlur = 0; ctx.lineWidth = 2.5; ctx.strokeStyle = fireT > 0 ? '#e6ccff' : '#fff'; ctx.beginPath(); ctx.arc(0, 0, SIZE / 2, 0, 6.283); ctx.stroke(); ctx.restore();
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
  function pause() { if (state === 'run') { state = 'paused'; cancelAnimationFrame(raf); show('Pausado', 'Toque em continuar para voltar de onde parou.', 'Continuar'); } }
  function resume() { state = 'run'; hide(); last = performance.now(); raf = requestAnimationFrame(loop); }
  ovBtn.addEventListener('click', e => { if (state === 'paused') { e.stopImmediatePropagation(); resume(); } }, true);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { if (!es[0].isIntersecting) pause(); }, { threshold: .2 }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  addEventListener('resize', resize);

  reset(); resize();
  const wait = setInterval(() => { draw(); if (ready(imgs.run)) clearInterval(wait); }, 200);
  draw();
})();
