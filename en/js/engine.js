/* Nein, danke. – Spiel-Motor: Level-Ablauf, Schnecke, Ton, Effekte */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const rand = (a, b) => a + Math.random() * (b - a);
  const irand = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const SNAIL_SVG = `<svg class="snail-svg" viewBox="0 0 130 100">
    <g class="sn-eye e1"><path d="M102 42 96 19" /><circle cx="95" cy="14" r="8.5"/><circle class="pupil" cx="97.5" cy="14" r="3.4"/></g>
    <g class="sn-eye e2"><path d="M110 42 118 21" /><circle cx="119" cy="16" r="8.5"/><circle class="pupil" cx="121.5" cy="16" r="3.4"/></g>
    <path class="sn-body" d="M6 88c0-10 8-16 22-16h62c5 0 8-4 8-10V44c0-9 16-9 16 0v26c0 12-8 18-20 18z"/>
    <path class="sn-mouth" d="M102 60q4.5 5 9 0"/>
    <g class="sn-shell">
      <circle class="shell" cx="52" cy="50" r="32"/>
      <path class="spiral" d="M52 50c0-6 9-6 9 1 0 10-16 11-17-1-1-15 22-18 25-1"/>
      <circle class="chip" cx="35" cy="37" r="4"/><circle class="chip" cx="67" cy="33" r="3.5"/><circle class="chip" cx="72" cy="62" r="4.5"/><circle class="chip" cx="38" cy="67" r="4"/><circle class="chip" cx="55" cy="74" r="3"/>
    </g>
  </svg>`;

  const Game = { levels: [], add(l) { this.levels.push(l); }, h, rand, irand, pick, shuffle, clamp, SNAIL_SVG, seenSnail: false };
  window.Game = Game;

  const els = {};
  const state = { i: 0, deaths: 0, tries: 0, elapsed: 0, live: false, fullRun: true, px: innerWidth / 2, py: innerHeight / 2, disposers: [], shownTime: '' };

  /* ---------- Ton (kleiner Synthesizer, keine Dateien) ---------- */
  const sfx = {
    ac: null, muted: false,
    init() {
      if (!this.ac) { try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* kein Ton */ } }
      if (this.ac && this.ac.state === 'suspended') this.ac.resume();
    },
    tone(f0, f1, dur, type = 'sine', vol = .1, delay = 0) {
      if (this.muted || !this.ac) return;
      const t = this.ac.currentTime + delay, o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(this.ac.destination); o.start(t); o.stop(t + dur + .03);
    },
    play(n) {
      const T = this.tone.bind(this);
      if (n === 'click') T(520, 520, .05, 'square', .04);
      else if (n === 'tick') T(1100, 1100, .025, 'square', .03);
      else if (n === 'pop') T(880, 300, .09, 'sine', .12);
      else if (n === 'whoosh') T(220, 900, .16, 'sine', .06);
      else if (n === 'bad') T(210, 110, .2, 'sawtooth', .07);
      else if (n === 'good') [523, 659, 784].forEach((f, i) => T(f, f, .12, 'triangle', .11, i * .08));
      else if (n === 'win') [523, 659, 784, 1047, 1319].forEach((f, i) => T(f, f, .2, 'triangle', .12, i * .1));
      else if (n === 'lose') { T(330, 55, .75, 'sawtooth', .11); T(165, 40, .75, 'square', .05); }
    },
  };

  /* ---------- Effekte ---------- */
  function burst(x, y, n = 8, cls = '') {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i'); p.className = 'crumb ' + cls;
      const a = Math.random() * Math.PI * 2, d = rand(30, 120);
      p.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 40}px;--r:${rand(-400, 400)}deg;--s:${rand(.5, 1.4)}`;
      els.fx.appendChild(p); setTimeout(() => p.remove(), 900);
    }
  }
  function nudge(el) { el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge'); }
  function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  /* Element zufällig im Fenster platzieren (Element muss position:fixed sein) */
  function place(el, opt = {}) {
    const w = el.offsetWidth || 120, hh = el.offsetHeight || 46, m = 14, top = 78;
    let x = m, y = top, tries = 0;
    do {
      x = rand(m, Math.max(m, innerWidth - w - m)); y = rand(top, Math.max(top, innerHeight - hh - m)); tries++;
    } while (tries < 40 && opt.far && Math.hypot(x + w / 2 - state.px, y + hh / 2 - state.py) < opt.far);
    el.style.left = x + 'px'; el.style.top = y + 'px';
  }

  /* ---------- Schnecke ---------- */
  const snail = { x: -200, y: -200, face: 1, active: false, hold: false, grace: 0, rage: 0, slimeT: 0, sayT: 3 };
  const SAYS = ['Just one little cookie?', 'I’ve got time.', 'We value your privacy.', 'Hold still for a second.', 'It won’t hurt a bit.', 'Personalisation!', 'I only want your data 🥺', 'Legitimate interest!', 'Almost got you.', 'Slime is a kind of cookie.'];
  function snailT() {
    const ids = Game.levels.map((l, i) => l.snail ? i : -1).filter(i => i >= 0);
    const k = ids.indexOf(state.i);
    return ids.length > 1 && k >= 0 ? k / (ids.length - 1) : 0;
  }
  function drawSnail() {
    els.snail.style.transform = `translate(${snail.x}px,${snail.y}px)`;
    els.snail.style.setProperty('--face', snail.face);
  }
  function spawnSnail() {
    const m = 90, W = innerWidth, H = innerHeight;
    const pts = [[-m, -m], [W + m, -m], [-m, H + m], [W + m, H + m], [W / 2, -m], [W / 2, H + m]];
    let best = pts[0], bd = -1;
    for (const p of pts) { const d = Math.hypot(p[0] - state.px, p[1] - state.py); if (d > bd) { bd = d; best = p; } }
    [snail.x, snail.y] = best; snail.grace = 1; snail.rage = 0; snail.sayT = rand(2, 4);
    drawSnail(); els.snail.classList.remove('gone');
  }
  function stepSnail(dt) {
    snail.grace -= dt; snail.rage += dt;
    const diag = Math.hypot(innerWidth, innerHeight);
    const speed = diag / lerp(20, 11, snailT()) * (1 + Math.min(snail.rage, 35) * .014);
    const dx = state.px - snail.x, dy = state.py - snail.y, d = Math.hypot(dx, dy);
    if (d > .5) { const s = Math.min(d, speed * dt); snail.x += dx / d * s; snail.y += dy / d * s; }
    if (Math.abs(dx) > 6) snail.face = dx < 0 ? -1 : 1;
    drawSnail();
    snail.slimeT -= dt;
    if (snail.slimeT <= 0) {
      snail.slimeT = .11;
      const s = document.createElement('i');
      s.style.cssText = `left:${snail.x - snail.face * 26}px;top:${snail.y + 34}px;rotate:${rand(-12, 12)}deg`;
      els.slime.appendChild(s); setTimeout(() => s.remove(), 3200);
    }
    snail.sayT -= dt;
    if (snail.sayT <= 0) {
      snail.sayT = rand(5, 9);
      const b = $('.snail-say', els.snail); b.textContent = pick(SAYS); replay(b, 'on');
    }
    if (snail.grace <= 0 && d < 30) lose('snail');
  }

  /* ---------- Level-Ablauf ---------- */
  function dispose() { state.disposers.splice(0).forEach(f => { try { f(); } catch { /* egal */ } }); }

  function makeCtx() {
    const d = state.disposers;
    const c = {
      stage: els.stage, h, rand, irand, pick, shuffle, clamp, burst, nudge, replay, place,
      win, lose,
      get px() { return state.px; }, get py() { return state.py; },
      live: () => state.live,
      sfx: (n) => sfx.play(n),
      tone: (f, dur = .25) => sfx.tone(f, f, dur, 'triangle', .12),
      later(fn, ms) { const id = setTimeout(fn, ms); d.push(() => clearTimeout(id)); return id; },
      every(fn, ms) { const id = setInterval(fn, ms); d.push(() => clearInterval(id)); return id; },
      on(t, ev, fn, o) { t.addEventListener(ev, fn, o); d.push(() => t.removeEventListener(ev, fn, o)); },
      loop(fn) {
        let alive = true, last = performance.now();
        const f = (n) => { if (!alive) return; const dt = Math.min(.05, (n - last) / 1000); last = n; if (state.live) fn(dt, n); requestAnimationFrame(f); };
        requestAnimationFrame(f); d.push(() => { alive = false; });
      },
      /* HTML in die Bühne hängen; [data-trap]-Knöpfe sind automatisch tödlich */
      mount(html) {
        const el = h(html); els.stage.appendChild(el);
        [el, ...el.querySelectorAll('[data-trap]')].forEach(t => {
          if (t.matches && t.matches('[data-trap]')) c.on(t, 'click', () => lose('accept', t.dataset.why));
        });
        return el;
      },
      /* Element aus seinem Kasten lösen und frei im Fenster schweben lassen */
      float(el) {
        if (el.classList.contains('floaty')) return;
        const r = el.getBoundingClientRect();
        els.stage.appendChild(el); el.classList.add('floaty');
        el.style.left = r.left + 'px'; el.style.top = r.top + 'px';
      },
      holdSnail(b) { snail.hold = b; if (!b) spawnSnail(); },
      /* Fenster für die Minispiele */
      cmp({ title, task, foot = true, cls = '' }) {
        const ids = Game.levels.map((l, i) => l.snail ? i : -1).filter(i => i >= 0);
        const el = c.mount(`<section class="cmp ${cls}">
          <header class="cmp-bar"><span class="cmp-dots"><i></i><i></i><i></i></span><b>Decline verification</b><em>Step ${ids.indexOf(state.i) + 1} of ${ids.length}</em></header>
          <div class="cmp-body"><h2>${title}</h2><p class="cmp-task">${task}</p><div class="cmp-game"></div></div>
          ${foot ? '<footer class="cmp-foot"><span>Had enough?</span><button class="btn btn-accept btn-s" data-trap data-why="You took the shortcut. The shortcut was “Accept all”.">Skip &amp; accept all</button></footer>' : ''}
        </section>`);
        return { el, game: $('.cmp-game', el) };
      },
    };
    return c;
  }

  function updateHud() {
    const L = Game.levels[state.i];
    els.hudN.textContent = state.i + 1; els.hudT.textContent = Game.levels.length;
    els.hudName.textContent = L.name; els.hudD.textContent = state.deaths;
    [...els.hudDots.children].forEach((d, k) => { d.className = k < state.i ? 'done' : k === state.i ? 'cur' : ''; });
  }

  function startLevel(i) {
    dispose();
    state.i = i; const L = Game.levels[i];
    els.stage.innerHTML = ''; els.stage.className = '';
    els.overlay.innerHTML = '';
    document.body.classList.remove('dead');
    document.documentElement.style.setProperty('--blur', lerp(9, 3, i / (Game.levels.length - 1)).toFixed(2));
    updateHud();
    snail.active = !!L.snail; snail.hold = false;
    els.snail.hidden = !L.snail;
    if (L.snail) spawnSnail(); else els.snail.classList.add('gone');
    state.live = true;
    const card = h(`<div class="lvcard"><small>Level ${i + 1}</small><b>${L.name}</b></div>`);
    els.fx.appendChild(card); setTimeout(() => card.remove(), 2300);
    L.setup(makeCtx());
  }

  const QUIPS = ['… or so you thought.', 'Almost. Just one small thing.', 'Your refusal is being reviewed …', 'Error 418: refusal could not be delivered.', 'That was only the pre-refusal.', 'Please confirm your refusal.', 'Lovely. Now make it official.', 'Refusal 12% complete.', 'Our partners are filing an objection.'];
  function win() {
    if (!state.live) return;
    state.live = false; dispose();
    const last = state.i === Game.levels.length - 1;
    sfx.play(last ? 'win' : 'good');
    els.snail.classList.add('gone');
    els.stage.classList.add('out');
    const st = h(`<div class="stamp"><b>DECLINED</b><span>${last ? 'For real this time.' : pick(QUIPS)}</span></div>`);
    els.fx.appendChild(st); setTimeout(() => st.remove(), 1500);
    setTimeout(() => (last ? finale() : startLevel(state.i + 1)), last ? 1500 : 1400);
  }

  const PARTNERS = ['Kevin’s crypto newsletter', 'a fridge in Ohio', '14 mattress start-ups', 'a credit bureau (just in case)', 'your old maths teacher', 'a guy called Rüdiger', 'DataHamster Ltd. & Sons', 'anyone who asks', 'the gym you never cancelled', 'a very nosy snail', 'the neighbours', 'a call centre with terrible hold music'];
  const WHY = {
    accept: ['One click. That’s all they ever wanted.', 'You pressed “Accept”. Voluntarily. Legally speaking.', 'The green button was a trap. The green button is always a trap.'],
    snail: ['Sheldon touched you. That counts as consent.', 'You were caught by a snail. Let that sink in.', 'Slow, but GDPR-compliant: Sheldon got you.'],
    fail: ['Sadly, that wasn’t convincing enough.'],
  };
  const HEAD = { accept: 'ACCEPTED.', snail: 'CAUGHT.', fail: 'FAILED.' };
  function lose(kind = 'accept', msg) {
    if (!state.live) return;
    state.live = false; dispose();
    state.deaths++; state.tries++; els.hudD.textContent = state.deaths;
    sfx.play('lose');
    document.body.classList.add('dead');
    const ov = h(`<div class="over over-lose" style="--x:${state.px}px;--y:${state.py}px">
      <div class="over-card">
        <p class="over-kicker">Level ${state.i + 1} · ${Game.levels[state.i].name}</p>
        <h1 class="glitch" data-t="${HEAD[kind]}">${HEAD[kind]}</h1>
        <p class="over-msg">${msg || pick(WHY[kind])}</p>
        <div class="over-partners"><span>Your data is now going to</span><ul>${shuffle(PARTNERS).slice(0, 3).map(p => `<li>${p}</li>`).join('')}</ul></div>
        <button class="btn btn-primary btn-xl" id="retry" disabled>Try again</button>
      </div></div>`);
    els.overlay.innerHTML = ''; els.overlay.appendChild(ov);
    const b = $('#retry', ov);
    setTimeout(() => { b.disabled = false; }, 650);
    b.addEventListener('click', () => { sfx.play('click'); startLevel(state.i); });
  }

  function rank(deaths) {
    if (deaths === 0) return 'Privacy deity';
    if (deaths <= 4) return 'GDPR ninja';
    if (deaths <= 12) return 'Brave decliner';
    if (deaths <= 25) return 'Cookie quitter on probation';
    return 'Crumb fiend in rehab';
  }

  function finale() {
    dispose(); state.live = false;
    snail.active = false; els.snail.hidden = true; els.hud.hidden = true; els.me.hidden = true;
    els.stage.innerHTML = ''; els.stage.className = 'off';
    document.documentElement.style.setProperty('--blur', 0);
    let best = null, isBest = false;
    try {
      best = JSON.parse(localStorage.getItem('neindanke:best') || 'null');
      if (state.fullRun && (!best || state.elapsed < best.t)) { isBest = true; localStorage.setItem('neindanke:best', JSON.stringify({ t: state.elapsed, d: state.deaths })); }
    } catch { /* privater Modus */ }
    for (let k = 0; k < 6; k++) setTimeout(() => burst(rand(.1, .9) * innerWidth, rand(.15, .6) * innerHeight, 16, 'big'), k * 180);
    const ov = h(`<div class="over over-win"><div class="over-card">
        <p class="over-kicker">All ${Game.levels.length} levels cleared</p>
        <h1>Declined.</h1>
        <p class="over-msg">You have successfully accepted <b>0 cookies</b>. Your choice will be saved for 24 hours. After that we will of course ask again.</p>
        <dl class="stats">
          <div><dt>Time</dt><dd>${fmt(state.elapsed)}</dd></div>
          <div><dt>Accepted</dt><dd>${state.deaths}</dd></div>
          <div><dt>Rank</dt><dd class="rank">${rank(state.deaths)}</dd></div>
        </dl>
        <p class="fine">${isBest ? 'New best time! ' : best ? `Best time: ${fmt(best.t)}. ` : ''}To remember this we sadly had to store something in your browser. 🍪 It’s only your best time. Honest.</p>
        <div class="over-btns"><button class="btn btn-primary btn-xl" id="read">Finally read the recipe</button><button class="btn btn-ghost" id="again">Play again</button></div>
      </div></div>`);
    els.overlay.innerHTML = ''; els.overlay.appendChild(ov);
    $('#again', ov).addEventListener('click', begin);
    $('#read', ov).addEventListener('click', () => {
      els.overlay.innerHTML = ''; document.body.classList.add('reading');
      const again = h('<button class="btn btn-primary reading-again">↺ Play again</button>');
      document.body.appendChild(again);
      again.addEventListener('click', () => { again.remove(); document.body.classList.remove('reading'); scrollTo(0, 0); begin(); });
    });
  }

  function begin() {
    sfx.init(); sfx.play('click');
    state.deaths = 0; state.tries = 0; state.elapsed = 0; Game.seenSnail = false;
    els.hud.hidden = false;
    const q = parseInt(new URLSearchParams(location.search).get('level'), 10);
    const first = q >= 1 && q <= Game.levels.length ? q - 1 : 0;
    state.fullRun = first === 0; /* Bestzeit zählt nur ab Level 1 */
    startLevel(first);
  }

  function showStart() {
    let best = null;
    try { best = JSON.parse(localStorage.getItem('neindanke:best') || 'null'); } catch { /* egal */ }
    const floaters = Array.from({ length: 14 }, (_, k) => `<i class="cookie" style="--s:${irand(28, 90)}px;left:${irand(0, 96)}%;--dur:${irand(9, 20)}s;--delay:-${irand(0, 20)}s;--sway:${irand(-60, 60)}px"></i>`).join('');
    const ov = h(`<div class="over over-start">
      <div class="start-rain">${floaters}</div>
      <a class="lang-link" href="../">Deutsche Version</a>
      <div class="start-card">
        <i class="cookie bite start-cookie"></i>
        <h1 class="title"><span>No,</span><span>thanks.</span></h1>
        <p class="start-sub">You just wanted to read a recipe. Between you and the cookies stand <b>${Game.levels.length} levels</b>, <b>1,482 partners</b> and <b>one snail</b>.</p>
        <button class="btn btn-primary btn-xl" id="go">Read the recipe →</button>
        <p class="fine">The only rule: <b>never accept.</b> Best played with mouse and keyboard.${best ? ` · Best time ${fmt(best.t)}` : ''}</p>
      </div></div>`);
    els.overlay.innerHTML = ''; els.overlay.appendChild(ov);
    $('#go', ov).addEventListener('click', begin);
  }

  let lastT = performance.now();
  function tick(now) {
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    if (state.live) {
      state.elapsed += dt;
      const t = fmt(state.elapsed);
      if (t !== state.shownTime) { state.shownTime = t; els.hudTime.textContent = t; }
      /* Am Handy kann man beim Tippen nicht weglaufen: dort wartet Schneck in den Tipp-Leveln */
      if (snail.active && !snail.hold && !(state.touch && Game.levels[state.i].keys)) stepSnail(dt);
    }
    requestAnimationFrame(tick);
  }

  Game.boot = () => {
    ['site', 'stage', 'snail', 'slime', 'fx', 'hud', 'overlay', 'me', 'hudN', 'hudT', 'hudName', 'hudDots', 'hudD', 'hudTime', 'mute'].forEach(id => { els[id] = document.getElementById(id); });
    $('.snail-in', els.snail).innerHTML = `<div class="snail-flip">${SNAIL_SVG}</div>`;
    els.hudDots.innerHTML = Game.levels.map(() => '<i></i>').join('');
    const track = (e) => {
      state.px = e.clientX; state.py = e.clientY;
      state.touch = e.pointerType === 'touch';
      if (e.pointerType === 'touch') { els.me.hidden = !state.live || !snail.active; els.me.style.transform = `translate(${state.px}px,${state.py}px)`; }
    };
    addEventListener('pointermove', track, { passive: true });
    addEventListener('pointerdown', track, { passive: true });
    els.mute.addEventListener('click', () => { sfx.muted = !sfx.muted; els.mute.textContent = sfx.muted ? '🔇' : '🔊'; });
    Game.debug = { goto: (n) => startLevel(n - 1), win, lose, state, snail };
    showStart();
    requestAnimationFrame(tick);
  };
})();
