/* Level 8–20: Minispiele, während die Schnecke hinter dir her ist */
(() => {
  'use strict';
  const { rand, irand, pick, shuffle } = Game;
  const pips = (n) => `<div class="pips">${'<i></i>'.repeat(n)}</div>`;
  const setPips = (root, n) => root.querySelectorAll('.pips i').forEach((p, k) => p.classList.toggle('on', k < n));

  /* 8 – Vorstellung der Schnecke + umgekehrter Cookie-Clicker */
  Game.add({
    name: 'Schneck',
    snail: true,
    setup(c) {
      const play = () => {
        const w = c.cmp({ title: 'Cookie-Vernichter', task: 'In deinem Browser liegen noch Cookies. Zerkrümle sie alle – schneller, als unser Bäcker nachlegt.' });
        let n = 30;
        w.game.innerHTML = `<div class="clicker">
          <div class="clicker-n"><b>${n}</b><span>Cookies übrig</span></div>
          <button class="bigcookie" aria-label="Cookie zerkrümeln"><i class="cookie"></i></button>
          <div class="clicker-baker">👨‍🍳 Der Bäcker legt 2 pro Sekunde nach</div></div>`;
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
      const intro = c.cmp({ title: 'Darf ich vorstellen: Schneck', task: 'Schneck ist unser Datenschutzbeauftragter. Er folgt deinem Mauszeiger – langsam, aber für immer. Berührt er dich, gilt das rechtlich als Zustimmung.', foot: false });
      intro.game.innerHTML = `<div class="intro-snail">${Game.SNAIL_SVG}</div>
        <p class="intro-note">Ab jetzt erledigst du alle Aufgaben, während Schneck dir hinterherkriecht. Lock ihn weg, wenn er zu nah kommt.</p>
        <button class="btn btn-primary btn-xl" data-go>Verstanden. Ich laufe.</button>`;
      c.on(intro.game.querySelector('[data-go]'), 'click', () => {
        Game.seenSnail = true; intro.el.remove(); c.sfx('click'); c.holdSnail(false); play();
      });
    },
  });

  /* 9 – Rechnen mit einem Ziffernfeld, das sich ständig neu mischt */
  Game.add({
    name: 'Kopfrechnen',
    snail: true,
    setup(c) {
      const w = c.cmp({ title: 'Bist du ein Mensch?', task: 'Löse 3 Aufgaben. Die Tastatur ist aus Sicherheitsgründen gesperrt. Das Ziffernfeld mischt sich aus Sicherheitsgründen neu.' });
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
    name: 'Gedächtnislücke',
    snail: true,
    setup(c) {
      const w = c.cmp({ title: 'Woran erinnerst du dich?', task: 'Finde alle 6 Paare. Wir merken uns währenddessen ebenfalls einiges über dich.' });
      const icons = ['🍪', '🥠', '🍩', '🧁', '🥨', '🍫'], deck = shuffle([...icons, ...icons]);
      w.game.innerHTML = `<div class="memory">${deck.map((ic, i) => `<button class="card" data-i="${i}" aria-label="Karte"><span class="card-in"><span class="card-f"></span><span class="card-b">${ic}</span></span></button>`).join('')}</div>`;
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
    name: 'Tipptest',
    snail: true,
    setup(c) {
      const phrase = pick(['Ich lehne alle Cookies ab und meine es ernst.', 'Meine Daten bleiben bei mir und nicht bei Kevin.', 'Nein bleibt nein, auch wenn der Knopf gruen ist.']);
      const w = c.cmp({ title: 'Schriftliche Ablehnung', task: 'Tippe den Satz exakt ab – mit Groß- und Kleinschreibung. Die Maus darfst du dabei nicht vergessen.' });
      w.game.innerHTML = `<div class="typing"><div class="type-text">${[...phrase].map(ch => `<span>${ch === ' ' ? '&nbsp;' : ch}</span>`).join('')}</div>
        <input class="type-in" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="${phrase.length}" aria-label="Satz abtippen" placeholder="Hier tippen …"></div>`;
      const inp = w.game.querySelector('input'), spans = [...w.game.querySelectorAll('.type-text span')];
      const draw = () => {
        const v = inp.value;
        spans.forEach((s, i) => { s.className = i < v.length ? (v[i] === phrase[i] ? 'ok' : 'bad') : i === v.length ? 'cur' : ''; });
        if (v === phrase) c.win();
      };
      c.on(inp, 'input', () => { c.sfx('tick'); draw(); });
      c.on(inp, 'paste', (e) => e.preventDefault());
      c.on(window, 'keydown', () => { if (document.activeElement !== inp) inp.focus(); });
      inp.focus({ preventScroll: true }); draw();
    },
  });

  /* 12 – Reaktionstest */
  Game.add({
    name: 'Reflexe',
    snail: true,
    setup(c) {
      const LIMIT = 450;
      const w = c.cmp({ title: 'Reaktionsprüfung', task: `Klick, sobald das Feld grün wird. Du brauchst 3 Treffer unter ${LIMIT} ms. Wer zu früh klickt, akzeptiert Cookies. Spaß. Fast.` });
      w.game.innerHTML = `<div class="react"><button class="react-pad" data-s="idle"></button>${pips(3)}</div>`;
      const pad = w.game.querySelector('.react-pad');
      let st = 'idle', t0 = 0, ok = 0, timer = 0;
      const set = (s, big, small) => { st = s; pad.dataset.s = s; pad.innerHTML = `<b>${big}</b><span>${small}</span>`; };
      set('idle', 'Bereit?', 'Klick zum Starten');
      c.on(pad, 'pointerdown', (e) => {
        e.preventDefault();
        if (st === 'idle') {
          set('wait', 'Warte …', 'Erst bei Grün klicken');
          timer = c.later(() => { set('go', 'JETZT!', ''); t0 = performance.now(); c.tone(880, .08); }, rand(1100, 3400));
        } else if (st === 'wait') {
          clearTimeout(timer); c.sfx('bad'); set('idle', 'Zu früh!', 'Klick für einen neuen Versuch');
        } else if (st === 'go') {
          const ms = Math.round(performance.now() - t0);
          if (ms <= LIMIT) {
            ok++; setPips(w.game, ok); c.sfx('good');
            if (ok === 3) return c.win();
            set('idle', `${ms} ms ✓`, 'Klick für die nächste Runde');
          } else { c.sfx('bad'); set('idle', `${ms} ms`, `Zu langsam – unter ${LIMIT} ms, bitte. Klick für nochmal`); }
        }
      });
    },
  });

  /* 13 – Captcha */
  Game.add({
    name: 'Ich bin kein Roboter',
    snail: true,
    setup(c) {
      const decoys = ['🥯', '🍩', '🌕', '🪙', '🥞', '🧇', '🥮', '🍘', '🟤', '🏀', '🥔', '🍔', '🧆', '🥧'];
      const rounds = [['Wähle alle Felder <b>mit Cookies</b>', true], ['Wähle jetzt alle Felder <b>ohne Cookies</b>', false]];
      const w = c.cmp({ title: 'Sicherheitsprüfung', task: '' });
      const task = w.el.querySelector('.cmp-task');
      w.game.innerHTML = `<div class="captcha"><div class="cap-grid"></div><div class="cap-foot">${pips(2)}<button class="btn btn-primary btn-s" data-ok>Bestätigen</button></div></div>`;
      const grid = w.game.querySelector('.cap-grid');
      let r = 0;
      const gen = () => {
        task.innerHTML = rounds[r][0] + '. Verwechslungen sind beabsichtigt.';
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
    name: 'Krümel-Stapler',
    snail: true,
    setup(c) {
      const W = 8, H = 13, GOAL = 2;
      const w = c.cmp({ title: 'Krümel-Stapler', task: `Räume <b>${GOAL} Reihen</b> ab. Pfeiltasten bewegen und drehen, die Leertaste lässt fallen.` });
      w.game.innerHTML = `<div class="stack">
        <div class="stack-grid" style="--w:${W}">${'<i></i>'.repeat(W * H)}</div>
        <div class="stack-side"><div class="stack-n"><b>0</b><span>von ${GOAL} Reihen</span></div>
          <div class="stack-keys"><button data-k="rot" aria-label="Drehen">⟳</button><button data-k="left" aria-label="Links">←</button><button data-k="down" aria-label="Runter">↓</button><button data-k="right" aria-label="Rechts">→</button><button data-k="drop" aria-label="Fallen lassen">⤓</button></div></div></div>`;
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
    name: 'Mach mir nach',
    snail: true,
    setup(c) {
      const lens = [3, 4, 5], freqs = [330, 415, 494, 622];
      const w = c.cmp({ title: 'Folge wiederholen', task: 'Schau zu und tippe die Felder danach in derselben Reihenfolge an. Drei Runden.' });
      w.game.innerHTML = `<div class="simon"><div class="simon-pads">${[0, 1, 2, 3].map(i => `<button data-p="${i}" aria-label="Feld ${i + 1}"></button>`).join('')}</div><p class="simon-st"></p>${pips(3)}</div>`;
      const pads = [...w.game.querySelectorAll('.simon-pads button')], stEl = w.game.querySelector('.simon-st');
      let round = 0, seq = [], pos = 0, input = false;
      const flash = (p) => { pads[p].classList.add('lit'); c.tone(freqs[p], .22); c.later(() => pads[p].classList.remove('lit'), 280); };
      const play = () => {
        input = false; pos = 0; stEl.textContent = 'Schau zu …';
        seq.forEach((p, i) => c.later(() => flash(p), 500 + i * 520));
        c.later(() => { input = true; stEl.textContent = 'Du bist dran.'; }, 500 + seq.length * 520);
      };
      const next = () => { seq = Array.from({ length: lens[round] }, () => irand(0, 3)); play(); };
      c.on(w.game.querySelector('.simon-pads'), 'pointerdown', (e) => {
        const b = e.target.closest('button'); if (!b || !input) return;
        e.preventDefault();
        const p = +b.dataset.p; flash(p);
        if (p !== seq[pos]) { input = false; c.nudge(w.el); c.sfx('bad'); stEl.textContent = 'Falsch. Gleiche Folge nochmal.'; c.later(play, 1000); return; }
        if (++pos < seq.length) return;
        input = false; round++; setPips(w.game, round);
        if (round === lens.length) return c.win();
        stEl.textContent = 'Richtig!'; c.later(next, 800);
      });
      next();
    },
  });

  /* 16 – Labyrinth: Wände berühren verboten */
  Game.add({
    name: 'Irrgarten',
    snail: true,
    setup(c) {
      const map = ['###########', '#S..#.....#', '###.#.###.#', '#...#.#...#', '#.###.#.###', '#.....#..G#', '###########'];
      const w = c.cmp({ title: 'Der Weg zum Ablehnen-Knopf', task: 'Klick auf den Start und führe den Zeiger zum Ziel, ohne die Wände zu berühren. Am Handy: Finger gedrückt halten und ziehen.', cls: 'cmp-wide' });
      w.game.innerHTML = `<div class="maze" style="--cols:${map[0].length}">${map.map(r => [...r].map(ch => `<i class="${ch === '#' ? 'w' : ch === 'S' ? 'p s' : ch === 'G' ? 'p g' : 'p'}"></i>`).join('')).join('')}</div>`;
      const grid = w.game.querySelector('.maze'), start = grid.querySelector('.s');
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
    name: 'Ablehn-Passwort',
    snail: true,
    setup(c) {
      const rules = [
        ['Mindestens 8 Zeichen', v => v.length >= 8],
        ['Mindestens eine Ziffer', v => /\d/.test(v)],
        ['Muss das Wort „nein“ enthalten', v => /nein/i.test(v)],
        ['Die Ziffern müssen zusammen 12 ergeben', v => (v.match(/\d/g) || []).reduce((a, b) => a + +b, 0) === 12],
        ['Muss ein Gebäck enthalten (Keks, Waffel oder Brezel)', v => /keks|waffel|brezel/i.test(v)],
        ['Muss mit einem Ausrufezeichen enden', v => /!$/.test(v)],
      ];
      const w = c.cmp({ title: 'Lege ein Ablehn-Passwort fest', task: 'Damit wir sicher sind, dass wirklich du ablehnst. Es gibt ein paar Regeln. Sie tauchen nach und nach auf.' });
      w.game.innerHTML = `<div class="pw"><input class="pw-in" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="40" placeholder="Passwort" aria-label="Passwort">
        <ul class="pw-rules">${rules.map(r => `<li hidden><i></i>${r[0]}</li>`).join('')}</ul>
        <button class="btn btn-primary" data-ok disabled>Speichern &amp; ablehnen</button></div>`;
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
    name: 'Das Kleingedruckte',
    snail: true,
    setup(c) {
      const clauses = [
        'Durch das Lesen dieser Bedingungen erklärst du dich mit dem Lesen dieser Bedingungen einverstanden.',
        'Der Begriff „Ablehnen“ ist im Sinne dieser Vereinbarung als Ausdruck grundsätzlicher Gesprächsbereitschaft zu verstehen.',
        'Cookies, die du nicht siehst, gelten als nicht vorhanden. Cookies, die du siehst, gelten als Dekoration.',
        'Wir geben deine Daten niemals an Dritte weiter. Vierte, Fünfte und Sechste sind von dieser Regel ausgenommen.',
        'Schneck handelt in eigener Verantwortung. Beschwerden über Schneck sind an Schneck zu richten.',
        'Du verzichtest auf dein Recht, dich über die Länge dieser Bedingungen zu beklagen.',
        'Sollte eine Klausel unwirksam sein, tritt an ihre Stelle eine noch längere Klausel.',
        'Das Zurückspringen dieses Textfeldes ist kein Fehler, sondern eine Maßnahme zur Leseförderung.',
        'Der Bäcker aus Level 8 ist nicht bei uns angestellt. Wir wissen auch nicht, wer ihn hereingelassen hat.',
        'Mit dem Erreichen des Endes dieser Bedingungen erwirbst du keinerlei Ansprüche, aber unseren Respekt.',
        'Vorausgewählte Häkchen spiegeln lediglich unsere Hoffnungen wider.',
        'Oma Hildegard distanziert sich ausdrücklich von allem, was hier steht.',
      ];
      const w = c.cmp({ title: 'Allgemeine Ablehnbedingungen', task: 'Bitte lies alles bis zum Ende. Erst dann darfst du absenden.' });
      w.game.innerHTML = `<div class="agb"><div class="agb-box" tabindex="0">${[...clauses, ...clauses].map((t, i) => `<p><b>§ ${i + 1}</b> ${t}</p>`).join('')}<p class="agb-end">— Ende. Du bist wirklich bis hierher gescrollt. —</p></div>
        <form class="agb-form locked">
          <label><input type="checkbox" name="read"> Ich habe alles gelesen und lehne ab.</label>
          <label><input type="checkbox" name="news" checked> Ich möchte 47 Newsletter pro Tag.</label>
          <label><input type="checkbox" name="twist" checked> „Ablehnen“ soll als „Akzeptieren“ gewertet werden.</label>
          <button class="btn btn-primary" type="submit">Absenden</button>
          <span class="agb-hint">Erst bis zum Ende scrollen.</span>
        </form></div>`;
      const box = w.game.querySelector('.agb-box'), form = w.game.querySelector('form'), hint = w.game.querySelector('.agb-hint');
      let unlocked = false;
      c.every(() => { if (!unlocked && box.scrollTop > 30) box.scrollBy({ top: -120, behavior: 'smooth' }); }, 1300);
      c.on(box, 'scroll', () => {
        if (!unlocked && box.scrollTop + box.clientHeight >= box.scrollHeight - 8) { unlocked = true; form.classList.remove('locked'); hint.textContent = 'Jetzt darfst du.'; c.sfx('good'); }
      });
      c.on(form, 'submit', (e) => {
        e.preventDefault();
        if (!unlocked) { c.nudge(form); c.sfx('bad'); return; }
        if (form.news.checked || form.twist.checked) return c.lose('accept', 'Zwei Häkchen waren schon für dich gesetzt. Du hast sie mit abgeschickt.');
        if (!form.read.checked) { hint.textContent = 'Du musst bestätigen, dass du ablehnst.'; c.nudge(form); c.sfx('bad'); return; }
        c.win();
      });
    },
  });

  /* 19 – Tracker über den ganzen Bildschirm jagen */
  Game.add({
    name: 'Tracker-Jagd',
    snail: true,
    setup(c) {
      const names = ['_ga', 'fbclid', 'utm_source', 'pixel.gif', '_gid', 'IDE', 'NID', 'datr', '_fbp', 'beacon', 'fingerprint.js', 'replay.js'];
      let left = names.length;
      const w = c.cmp({ title: 'Tracker-Jagd', task: `Auf dieser Seite laufen noch <b class="tr-n">${left}</b> Tracker frei herum. Erwisch sie alle, bevor sie weiterhüpfen.`, cls: 'cmp-top' });
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
    name: 'Endgegner',
    snail: true,
    setup(c) {
      const HP = 10; let hp = HP;
      const says = ['„Ohne Cookies kommst du hier nicht raus.“', '„Aua.“', '„Denk an die Partner!“', '„Das ist geschäftsschädigend.“', '„Ich hab Familie. Also Drittanbieter.“', '„Nimm wenigstens die funktionalen!“', '„Wer liest denn bitte freiwillig AGB?“', '„Na gut, dann halt die harte Tour.“', '„Mir wird schwindelig.“', '„Fast … weg …“'];
      const boss = c.mount(`<section class="boss">
        <div class="boss-bar"><span>CONSENT-MANAGER 3000</span><div class="boss-hp"><i></i></div></div>
        <div class="boss-face"><i class="cookie"></i><span class="eye l"></span><span class="eye r"></span><span class="mouth"></span></div>
        <p class="boss-say">${says[0]}</p>
        <p class="boss-tip">Triff den Ablehnen-Knopf ${HP}-mal. Fass nichts Grünes an.</p>
      </section>`);
      const say = boss.querySelector('.boss-say');
      const no = c.mount('<button class="btn btn-ghost floaty boss-no">Ablehnen</button>');
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
        const a = c.mount(`<button class="btn btn-accept rain" style="left:${rand(2, 84).toFixed(1)}vw;--d:${rand(3.2, 5.4).toFixed(2)}s">${pick(['Akzeptieren', 'OK', 'Alle akzeptieren', 'Zustimmen', 'Ja!', 'Na gut', 'Einverstanden'])}</button>`);
        c.on(a, 'click', () => c.lose('accept', 'Es hat Akzeptieren-Knöpfe geregnet. Du hast einen erwischt.'));
        c.later(() => a.remove(), 5600);
      }, 620);
      hop();
    },
  });
})();
