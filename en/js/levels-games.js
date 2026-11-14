/* Level 8–20: Minispiele, während die Schnecke hinter dir her ist */
(() => {
  'use strict';
  const { rand, irand, pick, shuffle } = Game;
  const pips = (n) => `<div class="pips">${'<i></i>'.repeat(n)}</div>`;
  const setPips = (root, n) => root.querySelectorAll('.pips i').forEach((p, k) => p.classList.toggle('on', k < n));

  /* 8 – Vorstellung der Schnecke + umgekehrter Cookie-Clicker */
  Game.add({
    name: 'Sheldon',
    snail: true,
    setup(c) {
      const play = () => {
        const w = c.cmp({ title: 'Cookie crusher', task: 'There are still cookies in your browser. Crumble them all – faster than our baker can restock.' });
        let n = 30;
        w.game.innerHTML = `<div class="clicker">
          <div class="clicker-n"><b>${n}</b><span>cookies left</span></div>
          <button class="bigcookie" aria-label="Crumble cookie"><i class="cookie"></i></button>
          <div class="clicker-baker">👨‍🍳 The baker adds 2 per second</div></div>`;
        const out = w.game.querySelector('.clicker-n b'), btn = w.game.querySelector('.bigcookie');
        const upd = () => { out.textContent = n; btn.style.setProperty('--left', n / 30); };
        c.on(btn, 'pointerdown', (e) => {
          e.preventDefault();
          n = Math.max(0, n - 1); upd();
          c.burst(e.clientX, e.clientY, 5); c.sfx('pop'); c.replay(btn, 'hit');
          if (n === 0) c.win();
        });
        c.every(() => { if (n < 60) { n++; upd(); } }, 500);
      };
      if (Game.seenSnail) return play();
      c.holdSnail(true);
      const intro = c.cmp({ title: 'Allow me to introduce: Sheldon', task: 'Sheldon is our data protection officer. He follows your cursor – slowly, but forever. If he touches you, that legally counts as consent.', foot: false });
      intro.game.innerHTML = `<div class="intro-snail">${Game.SNAIL_SVG}</div>
        <p class="intro-note">From now on you do every task while Sheldon crawls after you. Lure him away when he gets too close.</p>
        <button class="btn btn-primary btn-xl" data-go>Got it. I’m running.</button>`;
      c.on(intro.game.querySelector('[data-go]'), 'click', () => {
        Game.seenSnail = true; intro.el.remove(); c.sfx('click'); c.holdSnail(false); play();
      });
    },
  });

  /* 9 – Rechnen mit einem Ziffernfeld, das sich ständig neu mischt */
  Game.add({
    name: 'Mental maths',
    snail: true,
    setup(c) {
      const w = c.cmp({ title: 'Are you human?', task: 'Solve 3 problems. The keyboard is locked for security reasons. The keypad reshuffles for security reasons.' });
      w.game.innerHTML = `<div class="math"><div class="math-q"><span></span><b></b></div>${pips(3)}<div class="keypad"></div></div>`;
      const qEl = w.game.querySelector('.math-q span'), vEl = w.game.querySelector('.math-q b'), pad = w.game.querySelector('.keypad');
      let solved = 0, ans = 0, val = '';
      const drawPad = () => {
        pad.innerHTML = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).map(d => `<button data-d="${d}">${d}</button>`).join('')
          + '<button data-d="del" class="k-del">⌫</button><button data-d="ok" class="k-ok">OK</button>';
      };
      const gen = () => {
        let a, b, k;
        if (solved === 0) { a = irand(12, 49); b = irand(12, 49); ans = a + b; qEl.textContent = `${a} + ${b} =`; }
        else if (solved === 1) { a = irand(4, 9); b = irand(6, 9); ans = a * b; qEl.textContent = `${a} × ${b} =`; }
        else { a = irand(6, 9); b = irand(6, 9); k = irand(11, 29); ans = a * b - k; qEl.textContent = `${a} × ${b} − ${k} =`; }
        val = ''; vEl.textContent = '?'; drawPad();
      };
      c.on(pad, 'click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        const d = b.dataset.d;
        if (d === 'del') val = val.slice(0, -1);
        else if (d === 'ok') {
          if (val !== '' && +val === ans) {
            solved++; setPips(w.game, solved); c.sfx('good');
            if (solved === 3) return c.win();
            return gen();
          }
          c.nudge(w.el); c.sfx('bad'); val = '';
        } else if (val.length < 3) val += d;
        c.sfx('tick'); vEl.textContent = val || '?'; drawPad();
      });
      gen();
    },
  });

  /* 10 – Memory */
  Game.add({
    name: 'Memory lapse',
    snail: true,
    setup(c) {
      const w = c.cmp({ title: 'What do you remember?', task: 'Find all 6 pairs. Meanwhile, we are remembering a few things about you too.' });
      const icons = ['🍪', '🥠', '🍩', '🧁', '🥨', '🍫'], deck = shuffle([...icons, ...icons]);
      w.game.innerHTML = `<div class="memory">${deck.map((ic, i) => `<button class="card" data-i="${i}" aria-label="Card"><span class="card-in"><span class="card-f"></span><span class="card-b">${ic}</span></span></button>`).join('')}</div>`;
      let open = [], lock = false, found = 0;
      c.on(w.game, 'click', (e) => {
        const card = e.target.closest('.card');
        if (!card || lock || card.classList.contains('up')) return;
        card.classList.add('up'); open.push(card); c.sfx('tick');
        if (open.length < 2) return;
        const [a, b] = open;
        if (deck[a.dataset.i] === deck[b.dataset.i]) {
          a.classList.add('done'); b.classList.add('done'); open = []; found++; c.sfx('good');
          if (found === icons.length) c.later(() => c.win(), 450);
        } else {
          lock = true;
          c.later(() => { a.classList.remove('up'); b.classList.remove('up'); open = []; lock = false; }, 650);
        }
      });
    },
  });

  /* 11 – Tipptest */
  Game.add({
    name: 'Typing test',
    snail: true,
    keys: true,
    setup(c) {
      const phrase = pick(['I decline all cookies and I mean it.', 'My data stays with me and not with Kevin.', 'No still means no, however the button looks.']);
      const w = c.cmp({ title: 'Refusal in writing', task: 'Type out the sentence. Wrong keys simply don’t count. Don’t forget about your mouse while you do.', cls: 'cmp-top' });
      w.game.innerHTML = `<div class="typing"><div class="type-text">${[...phrase].map(ch => `<span>${ch}</span>`).join('')}</div>
        <input class="type-in" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Type the sentence" placeholder="Just start typing …"></div>`;
      const inp = w.game.querySelector('input'), spans = [...w.game.querySelectorAll('.type-text span')];
      let pos = 0, last = '';
      const draw = () => spans.forEach((s, i) => { s.className = i < pos ? 'ok' : i === pos ? 'cur' : ''; });
      const feed = (ch) => {
        if (!c.live()) return;
        if (ch.toLowerCase() !== phrase[pos].toLowerCase()) { c.sfx('bad'); c.replay(spans[pos], 'miss'); return; }
        pos++; c.sfx('tick'); draw();
        if (pos === phrase.length) c.win();
      };
      /* Das Feld ist nur Tastenfänger (wichtig fürs Handy); gewertet wird Zeichen für Zeichen */
      c.on(inp, 'input', (e) => {
        const v = inp.value; let k = 0;
        while (k < last.length && k < v.length && v[k] === last[k]) k++;
        for (const ch of v.slice(k)) feed(ch);
        last = v;
        if (!e.isComposing && (v.endsWith(' ') || v.length > 24)) { inp.value = ''; last = ''; }
      });
      c.on(inp, 'paste', (e) => e.preventDefault());
      /* Funktioniert auch, wenn das Feld den Fokus verloren hat */
      c.on(window, 'keydown', (e) => {
        if (document.activeElement === inp || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
        e.preventDefault(); feed(e.key);
      });
      inp.focus({ preventScroll: true }); draw();
    },
  });

  /* 12 – Reaktionstest */
  Game.add({
    name: 'Reflexes',
    snail: true,
    setup(c) {
      const LIMIT = 450;
      const w = c.cmp({ title: 'Reaction check', task: `Click as soon as the pad turns green. You need 3 hits under ${LIMIT} ms. Click too early and you accept cookies. Kidding. Almost.` });
      w.game.innerHTML = `<div class="react"><button class="react-pad" data-s="idle"></button>${pips(3)}</div>`;
      const pad = w.game.querySelector('.react-pad');
      let st = 'idle', t0 = 0, ok = 0, timer = 0;
      const set = (s, big, small) => { st = s; pad.dataset.s = s; pad.innerHTML = `<b>${big}</b><span>${small}</span>`; };
      set('idle', 'Ready?', 'Click to start');
      c.on(pad, 'pointerdown', (e) => {
        e.preventDefault();
        if (st === 'idle') {
          set('wait', 'Wait …', 'Click only on green');
          timer = c.later(() => { set('go', 'NOW!', ''); t0 = performance.now(); c.tone(880, .08); }, rand(1100, 3400));
        } else if (st === 'wait') {
          clearTimeout(timer); c.sfx('bad'); set('idle', 'Too early!', 'Click to try again');
        } else if (st === 'go') {
          const ms = Math.round(performance.now() - t0);
          if (ms <= LIMIT) {
            ok++; setPips(w.game, ok); c.sfx('good');
            if (ok === 3) return c.win();
            set('idle', `${ms} ms ✓`, 'Click for the next round');
          } else { c.sfx('bad'); set('idle', `${ms} ms`, `Too slow – under ${LIMIT} ms, please. Click to retry`); }
        }
      });
    },
  });

  /* 13 – Captcha */
  Game.add({
    name: 'I am not a robot',
    snail: true,
    setup(c) {
      const decoys = ['🥯', '🍩', '🌕', '🪙', '🥞', '🧇', '🥮', '🍘', '🟤', '🏀', '🥔', '🍔', '🧆', '🥧'];
      const rounds = [['Select all squares <b>with cookies</b>', true], ['Now select all squares <b>without cookies</b>', false]];
      const w = c.cmp({ title: 'Security check', task: '' });
      const task = w.el.querySelector('.cmp-task');
      w.game.innerHTML = `<div class="captcha"><div class="cap-grid"></div><div class="cap-foot">${pips(2)}<button class="btn btn-primary btn-s" data-ok>Verify</button></div></div>`;
      const grid = w.game.querySelector('.cap-grid');
      let r = 0;
      const gen = () => {
        task.innerHTML = rounds[r][0] + '. Any resemblance is intentional.';
        const n = irand(4, 6), cells = shuffle([...Array(n).fill('🍪'), ...Array.from({ length: 16 - n }, () => pick(decoys))]);
        grid.innerHTML = cells.map(ch => `<button data-c="${ch === '🍪' ? 1 : 0}">${ch}</button>`).join('');
      };
      c.on(grid, 'click', (e) => { const b = e.target.closest('button'); if (b) { b.classList.toggle('sel'); c.sfx('tick'); } });
      c.on(w.game.querySelector('[data-ok]'), 'click', () => {
        const want = rounds[r][1];
        const good = [...grid.children].every(b => b.classList.contains('sel') === ((b.dataset.c === '1') === want));
        if (!good) { c.nudge(w.el); c.sfx('bad'); return gen(); }
        r++; setPips(w.game, r); c.sfx('good');
        if (r === rounds.length) return c.win();
        gen();
      });
      gen();
    },
  });

  /* 14 – Fallende Blöcke stapeln */
  Game.add({
    name: 'Crumb stacker',
    snail: true,
    setup(c) {
      const W = 8, H = 13, GOAL = 2;
      const w = c.cmp({ title: 'Crumb stacker', task: `Clear <b>${GOAL} rows</b>. Arrow keys move and rotate, space drops.` });
      w.game.innerHTML = `<div class="stack">
        <div class="stack-grid" style="--w:${W}">${'<i></i>'.repeat(W * H)}</div>
        <div class="stack-side"><div class="stack-n"><b>0</b><span>of ${GOAL} rows</span></div>
          <div class="stack-keys"><button data-k="rot" aria-label="Rotate">⟳</button><button data-k="left" aria-label="Left">←</button><button data-k="down" aria-label="Down">↓</button><button data-k="right" aria-label="Right">→</button><button data-k="drop" aria-label="Drop">⤓</button></div></div></div>`;
      const cells = [...w.game.querySelectorAll('.stack-grid i')], out = w.game.querySelector('.stack-n b');
      const shapes = [
        [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]],
        [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 0], [1, 0], [2, 0], [0, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]],
      ];
      const empty = () => Array.from({ length: H }, () => Array(W).fill(0));
      let board = empty(), cur = null, lines = 0;
      const fits = (s, ox, oy) => s.every(([x, y]) => { const X = x + ox, Y = y + oy; return X >= 0 && X < W && Y >= 0 && Y < H && !board[Y][X]; });
      const spawn = () => {
        const k = irand(0, shapes.length - 1);
        cur = { k: k + 1, s: shapes[k].map(p => [...p]), x: 2, y: 0 };
        if (!fits(cur.s, cur.x, cur.y)) { board = empty(); c.nudge(w.el); c.sfx('bad'); }
      };
      const rot = () => {
        const s = cur.s.map(([x, y]) => [-y, x]);
        const mx = Math.min(...s.map(p => p[0])), my = Math.min(...s.map(p => p[1]));
        const n = s.map(([x, y]) => [x - mx, y - my]);
        for (const dx of [0, -1, 1, -2]) if (fits(n, cur.x + dx, cur.y)) { cur.s = n; cur.x += dx; return; }
      };
      const lock = () => {
        cur.s.forEach(([x, y]) => { board[cur.y + y][cur.x + x] = cur.k; });
        const kept = board.filter(row => row.some(v => !v)), cleared = H - kept.length;
        if (cleared) {
          lines += cleared; out.textContent = Math.min(lines, GOAL); c.sfx('good');
          board = [...Array.from({ length: cleared }, () => Array(W).fill(0)), ...kept];
          if (lines >= GOAL) { cur = null; return c.win(); }
        }
        spawn();
      };
      const step = () => { if (fits(cur.s, cur.x, cur.y + 1)) { cur.y++; return true; } lock(); return false; };
      const draw = () => {
        cells.forEach((el, i) => { el.dataset.v = board[(i / W) | 0][i % W] || ''; });
        if (cur) cur.s.forEach(([x, y]) => { const el = cells[(cur.y + y) * W + cur.x + x]; if (el) el.dataset.v = cur.k; });
      };
      const act = (k) => {
        if (!c.live() || !cur) return;
        if (k === 'left' && fits(cur.s, cur.x - 1, cur.y)) cur.x--;
        else if (k === 'right' && fits(cur.s, cur.x + 1, cur.y)) cur.x++;
        else if (k === 'rot') rot();
        else if (k === 'down') step();
        else if (k === 'drop') { while (cur && step()); c.sfx('tick'); }
        draw();
      };
      c.on(window, 'keydown', (e) => {
        const k = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'rot', ArrowDown: 'down', ' ': 'drop' }[e.key];
        if (k) { e.preventDefault(); act(k); }
      });
      c.on(w.game.querySelector('.stack-keys'), 'click', (e) => { const b = e.target.closest('button'); if (b) act(b.dataset.k); });
      spawn(); draw();
      c.every(() => { if (cur) { step(); draw(); } }, 600);
    },
  });

  /* 15 – Reihenfolge merken */
  Game.add({
    name: 'Copy me',
    snail: true,
    setup(c) {
      const lens = [3, 4, 5], freqs = [330, 415, 494, 622];
      const w = c.cmp({ title: 'Repeat the sequence', task: 'Watch, then tap the pads in the same order. Three rounds.' });
      w.game.innerHTML = `<div class="simon"><div class="simon-pads">${[0, 1, 2, 3].map(i => `<button data-p="${i}" aria-label="Pad ${i + 1}"></button>`).join('')}</div><p class="simon-st"></p>${pips(3)}</div>`;
      const pads = [...w.game.querySelectorAll('.simon-pads button')], stEl = w.game.querySelector('.simon-st');
      let round = 0, seq = [], pos = 0, input = false;
      const flash = (p) => { pads[p].classList.add('lit'); c.tone(freqs[p], .22); c.later(() => pads[p].classList.remove('lit'), 280); };
      const play = () => {
        input = false; pos = 0; stEl.textContent = 'Watch …';
        seq.forEach((p, i) => c.later(() => flash(p), 500 + i * 520));
        c.later(() => { input = true; stEl.textContent = 'Your turn.'; }, 500 + seq.length * 520);
      };
      const next = () => { seq = Array.from({ length: lens[round] }, () => irand(0, 3)); play(); };
      c.on(w.game.querySelector('.simon-pads'), 'pointerdown', (e) => {
        const b = e.target.closest('button'); if (!b || !input) return;
        e.preventDefault();
        const p = +b.dataset.p; flash(p);
        if (p !== seq[pos]) { input = false; c.nudge(w.el); c.sfx('bad'); stEl.textContent = 'Wrong. Same sequence again.'; c.later(play, 1000); return; }
        if (++pos < seq.length) return;
        input = false; round++; setPips(w.game, round);
        if (round === lens.length) return c.win();
        stEl.textContent = 'Correct!'; c.later(next, 800);
      });
      next();
    },
  });

  /* 16 – Labyrinth: Wände berühren verboten */
  Game.add({
    name: 'Maze',
    snail: true,
    setup(c) {
      const map = ['###########', '#S..#.....#', '###.#.###.#', '#...#.#...#', '#.###.#.###', '#.....#..G#', '###########'];
      const w = c.cmp({ title: 'The way to the Decline button', task: 'Click Start and guide the cursor to the goal without touching the walls. On a phone: hold your finger down and drag.', cls: 'cmp-wide' });
      w.game.innerHTML = `<div class="maze" style="--cols:${map[0].length}">${map.map(r => [...r].map(ch => `<i class="${ch === '#' ? 'w' : ch === 'S' ? 'p s' : ch === 'G' ? 'p g' : 'p'}"></i>`).join('')).join('')}</div>`;
      const grid = w.game.querySelector('.maze'), start = grid.querySelector('.s');
      start.dataset.l = 'Start'; grid.querySelector('.g').dataset.l = 'Goal';
      let active = false, lx = 0, ly = 0;
      const fail = () => { active = false; grid.classList.remove('on'); grid.querySelectorAll('.v').forEach(v => v.classList.remove('v')); c.nudge(grid); c.sfx('bad'); };
      const probe = (x, y) => {
        const t = document.elementFromPoint(x, y);
        if (!t || (t !== grid && t.parentElement !== grid)) return fail();
        if (t === grid) return;
        if (t.classList.contains('w')) return fail();
        t.classList.add('v');
        if (t.classList.contains('g')) c.win();
      };
      c.on(start, 'pointerdown', (e) => {
        e.preventDefault();
        if (start.hasPointerCapture && start.hasPointerCapture(e.pointerId)) start.releasePointerCapture(e.pointerId);
        active = true; lx = e.clientX; ly = e.clientY; grid.classList.add('on'); c.sfx('click');
      });
      c.on(window, 'pointermove', (e) => {
        if (!active) return;
        const n = Math.max(1, Math.ceil(Math.hypot(e.clientX - lx, e.clientY - ly) / 5));
        for (let k = 1; k <= n && active && c.live(); k++) probe(lx + (e.clientX - lx) * k / n, ly + (e.clientY - ly) * k / n);
        lx = e.clientX; ly = e.clientY;
      });
      c.on(window, 'pointerup', (e) => { if (active && e.pointerType === 'touch') fail(); });
    },
  });

  /* 17 – Passwort mit immer neuen Regeln */
  Game.add({
    name: 'Decline password',
    snail: true,
    keys: true,
    setup(c) {
      const rules = [
        ['At least 8 characters', v => v.length >= 8],
        ['At least one digit', v => /\d/.test(v)],
        ['Must contain the word “nope”', v => /nope/i.test(v)],
        ['The digits must add up to 12', v => (v.match(/\d/g) || []).reduce((a, b) => a + +b, 0) === 12],
        ['Must contain a baked good (cookie, waffle or pretzel)', v => /cookie|waffle|pretzel/i.test(v)],
        ['Must end with an exclamation mark', v => /!$/.test(v)],
      ];
      const w = c.cmp({ title: 'Set a decline password', task: 'So we can be sure it’s really you declining. There are a few rules. They show up one by one.' });
      w.game.innerHTML = `<div class="pw"><input class="pw-in" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="40" placeholder="Password" aria-label="Password">
        <ul class="pw-rules">${rules.map(r => `<li hidden><i></i>${r[0]}</li>`).join('')}</ul>
        <button class="btn btn-primary" data-ok disabled>Save &amp; decline</button></div>`;
      const inp = w.game.querySelector('input'), lis = [...w.game.querySelectorAll('.pw-rules li')], ok = w.game.querySelector('[data-ok]');
      let shown = 1;
      const draw = () => {
        const res = rules.map(r => r[1](inp.value));
        while (shown < rules.length && res.slice(0, shown).every(Boolean)) shown++;
        lis.forEach((li, i) => { li.hidden = i >= shown; li.classList.toggle('ok', res[i]); });
        ok.disabled = !res.every(Boolean);
      };
      c.on(inp, 'input', () => { c.sfx('tick'); draw(); });
      c.on(ok, 'click', () => c.win());
      c.on(window, 'keydown', (e) => { if (document.activeElement !== inp) inp.focus(); if (e.key === 'Enter' && !ok.disabled) c.win(); });
      inp.focus({ preventScroll: true }); draw();
    },
  });

  /* 18 – AGB bis zum Ende scrollen, während die Seite zurückscrollt */
  Game.add({
    name: 'The small print',
    snail: true,
    setup(c) {
      const clauses = [
        'By reading these terms you agree to reading these terms.',
        'For the purposes of this agreement, the term “decline” shall be understood as a general willingness to talk.',
        'Cookies you cannot see are deemed not to exist. Cookies you can see are deemed decoration.',
        'We never share your data with third parties. Fourth, fifth and sixth parties are exempt from this rule.',
        'Sheldon acts on his own responsibility. Complaints about Sheldon must be addressed to Sheldon.',
        'You waive your right to complain about the length of these terms.',
        'Should any clause be invalid, it shall be replaced by an even longer clause.',
        'This text box jumping back is not a bug but a measure to promote reading.',
        'The baker from level 8 does not work for us. We don’t know who let him in either.',
        'Reaching the end of these terms entitles you to nothing, except our respect.',
        'Pre-ticked boxes merely reflect our hopes.',
        'Grandma Hildegard expressly distances herself from everything written here.',
      ];
      const w = c.cmp({ title: 'General Terms of Declining', task: 'Please read everything to the end. Only then may you submit.' });
      w.game.innerHTML = `<div class="agb"><div class="agb-box" tabindex="0">${[...clauses, ...clauses].map((t, i) => `<p><b>§ ${i + 1}</b> ${t}</p>`).join('')}<p class="agb-end">— The end. You really scrolled all the way down here. —</p></div>
        <form class="agb-form locked">
          <label><input type="checkbox" name="read"> I have read everything and I decline.</label>
          <label><input type="checkbox" name="news" checked> I would like 47 newsletters a day.</label>
          <label><input type="checkbox" name="twist" checked> “Decline” shall be treated as “Accept”.</label>
          <button class="btn btn-primary" type="submit">Submit</button>
          <span class="agb-hint">Scroll to the end first.</span>
        </form></div>`;
      const box = w.game.querySelector('.agb-box'), form = w.game.querySelector('form'), hint = w.game.querySelector('.agb-hint');
      let unlocked = false;
      c.every(() => { if (!unlocked && box.scrollTop > 30) box.scrollBy({ top: -120, behavior: 'smooth' }); }, 1300);
      c.on(box, 'scroll', () => {
        if (!unlocked && box.scrollTop + box.clientHeight >= box.scrollHeight - 8) { unlocked = true; form.classList.remove('locked'); hint.textContent = 'Now you may.'; c.sfx('good'); }
      });
      c.on(form, 'submit', (e) => {
        e.preventDefault();
        if (!unlocked) { c.nudge(form); c.sfx('bad'); return; }
        if (form.news.checked || form.twist.checked) return c.lose('accept', 'Two boxes were already ticked for you. You submitted them too.');
        if (!form.read.checked) { hint.textContent = 'You must confirm that you decline.'; c.nudge(form); c.sfx('bad'); return; }
        c.win();
      });
    },
  });

  /* 19 – Tracker über den ganzen Bildschirm jagen */
  Game.add({
    name: 'Tracker hunt',
    snail: true,
    setup(c) {
      const names = ['_ga', 'fbclid', 'utm_source', 'pixel.gif', '_gid', 'IDE', 'NID', 'datr', '_fbp', 'beacon', 'fingerprint.js', 'replay.js'];
      let left = names.length;
      const w = c.cmp({ title: 'Tracker hunt', task: `There are still <b class="tr-n">${left}</b> trackers roaming free on this page. Catch them all before they hop away.`, cls: 'cmp-top' });
      const out = w.el.querySelector('.tr-n');
      const spawn = () => {
        const t = c.mount(`<button class="tracker"><i></i><span>${names[left - 1]}</span></button>`);
        c.place(t, { far: 170 });
        const hop = c.every(() => { c.place(t); c.replay(t, 'poof'); }, 1700);
        c.on(t, 'pointerdown', (e) => {
          e.preventDefault(); clearInterval(hop);
          c.burst(e.clientX, e.clientY, 9); c.sfx('pop'); t.remove();
          left--; out.textContent = left;
          if (!left) return c.win();
          spawn();
        });
      };
      spawn();
    },
  });

  /* 20 – Endgegner */
  Game.add({
    name: 'Final boss',
    snail: true,
    setup(c) {
      const HP = 10; let hp = HP;
      const says = ['“You’re not getting out of here without cookies.”', '“Ouch.”', '“Think of the partners!”', '“This is bad for business.”', '“I have a family. Well, third parties.”', '“At least take the functional ones!”', '“Who reads terms and conditions voluntarily?”', '“Fine, the hard way it is.”', '“I feel dizzy.”', '“Almost … gone …”'];
      const boss = c.mount(`<section class="boss">
        <div class="boss-bar"><span>CONSENT-MANAGER 3000</span><div class="boss-hp"><i></i></div></div>
        <div class="boss-face"><i class="cookie"></i><span class="eye l"></span><span class="eye r"></span><span class="mouth"></span></div>
        <p class="boss-say">${says[0]}</p>
        <p class="boss-tip">Hit the Decline button ${HP} times. Don’t touch anything green.</p>
      </section>`);
      const say = boss.querySelector('.boss-say');
      const no = c.mount('<button class="btn btn-ghost floaty boss-no">Decline</button>');
      let timer = 0;
      const hop = () => {
        clearTimeout(timer);
        c.place(no, { far: 180 }); c.replay(no, 'poof');
        timer = c.later(hop, 900 + 700 * (hp / HP));
      };
      c.on(no, 'pointerdown', (e) => {
        e.preventDefault();
        hp--; boss.style.setProperty('--hp', hp / HP);
        c.burst(e.clientX, e.clientY, 10); c.sfx('pop'); c.replay(boss, 'hit');
        say.textContent = says[Math.min(says.length - 1, HP - hp)];
        if (hp <= 0) {
          const r = boss.querySelector('.boss-face').getBoundingClientRect();
          for (let k = 0; k < 5; k++) c.burst(r.left + rand(0, r.width), r.top + rand(0, r.height), 14, 'big');
          return c.win();
        }
        hop();
      });
      c.every(() => {
        const a = c.mount(`<button class="btn btn-accept rain" style="left:${rand(2, 84).toFixed(1)}vw;--d:${rand(3.2, 5.4).toFixed(2)}s">${pick(['Accept', 'OK', 'Accept all', 'Agree', 'Yes!', 'Oh well', 'Sounds good'])}</button>`);
        c.on(a, 'click', () => c.lose('accept', 'It was raining Accept buttons. You caught one.'));
        c.later(() => a.remove(), 5600);
      }, 620);
      hop();
    },
  });
})();
