/* Level 1–7: das Banner wehrt sich (noch ohne Schnecke) */
(() => {
  'use strict';
  const { rand, pick, shuffle } = Game;

  const banner = ({ title, text, accept = 'Accept all', extra = '', cls = '' }) => `
    <section class="banner ${cls}">
      <i class="cookie bite"></i>
      <div class="banner-txt"><h2>${title}</h2><p>${text}</p></div>
      <div class="banner-btns"><button class="btn btn-accept" data-trap>${accept}</button>${extra}</div>
    </section>`;

  /* 1 – Der Knopf springt weg */
  Game.add({
    name: 'Perfectly normal',
    setup(c) {
      const b = c.mount(banner({
        title: 'We value your privacy',
        text: 'We and our <u>1,482 partners</u> use cookies to give you the best possible recipe experience. Is that okay with you?',
        extra: '<button class="btn btn-ghost" data-no>Decline</button>',
      }));
      const no = b.querySelector('[data-no]'), p = b.querySelector('p'), t = b.querySelector('h2');
      const steps = [
        ['Oops.', 'The button slipped. It happens. Feel free to try again.', 'Decline'],
        ['Are you sure?', 'Our partners are very sad. One of them is crying.', 'Decline anyway'],
        ['Really sure?', 'Technically, cookies are a gift.', 'No means no'],
        ['Fine.', 'Last chance to change your mind.', 'DECLINE'],
      ];
      let n = 0;
      c.on(no, 'click', (e) => {
        if (n >= steps.length) return c.win();
        const [tt, pp, label] = steps[n++];
        t.textContent = tt; p.textContent = pp;
        c.burst(e.clientX, e.clientY, 8);
        c.float(no); no.textContent = label;
        c.place(no, { far: 240 }); c.replay(no, 'poof'); c.sfx('whoosh');
      });
    },
  });

  /* 2 – Der Knopf flieht vor dem Mauszeiger */
  Game.add({
    name: 'Camera shy',
    setup(c) {
      const b = c.mount(banner({
        title: 'Okay, let’s try again',
        text: 'The Decline button is a little shy today. Please approach slowly. The green button, on the other hand, loves visitors.',
        extra: '<button class="btn btn-ghost" data-no>Decline</button>',
      }));
      const no = b.querySelector('[data-no]'), yes = b.querySelector('[data-trap]');
      const MAX = 8; let stamina = MAX, cool = 0;
      const flee = () => {
        if (performance.now() < cool) return;
        cool = performance.now() + 320;
        if (!no.classList.contains('floaty')) { c.float(no); void no.offsetWidth; no.classList.add('slide'); }
        stamina--;
        c.place(no, { far: 280 }); c.sfx('whoosh');
        yes.style.setProperty('--grow', 1 + (MAX - stamina) * .1);
        no.textContent = pick(['Nope!', 'Whoa!', 'Too slow', 'Catch me', 'Decline?', 'Hehe', 'Close!']);
        if (stamina <= 0) { no.textContent = 'Phew … okay. Decline😮‍💨'; no.classList.add('tired'); }
      };
      c.on(window, 'pointermove', (e) => {
        if (stamina <= 0 || e.pointerType === 'touch') return;
        const r = no.getBoundingClientRect();
        if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 105) flee();
      });
      c.on(no, 'click', () => (stamina > 0 ? flee() : c.win()));
    },
  });

  /* 3 – Doppelte Verneinung und falsche Farben */
  Game.add({
    name: 'The fine print',
    setup(c) {
      const qs = [
        { q: 'Cancel declining?', s: '“Continue” cancels the declining. “Cancel” cancels the cancelling.', o: [['Continue', 'btn-accept', 0], ['Cancel', 'btn-ghost', 1]], why: 'You cancelled the declining. In other words: you accepted.' },
        { q: 'Do you not want no cookies?', s: 'Please answer honestly and without thinking.', o: [['Yes', 'btn-accept', 0], ['No', 'btn-ghost', 1]], why: '“Not no cookies” means: cookies. English is hard.' },
        { q: 'Decline cookies?', s: 'Last question. Promise.', o: [['NO 👍', 'btn-accept btn-xl', 0], ['yes, decline', 'btn-link', 1]], why: 'The big green button meant “No, don’t decline”.' },
      ];
      let i = 0;
      const d = c.mount('<section class="dialog"></section>');
      const show = () => {
        const Q = qs[i];
        d.innerHTML = `<span class="dialog-step">Question ${i + 1} of ${qs.length}</span><h2>${Q.q}</h2><p>${Q.s}</p>
          <div class="dialog-btns">${Q.o.map((o, k) => `<button class="btn ${o[1]}" data-k="${k}">${o[0]}</button>`).join('')}</div>`;
        c.replay(d, 'pop');
      };
      c.on(d, 'click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        const Q = qs[i];
        if (!Q.o[b.dataset.k][2]) return c.lose('accept', Q.why);
        c.sfx('click');
        if (++i >= qs.length) return c.win();
        show();
      });
      show();
    },
  });

  /* 4 – Schalter, die sich wieder einschalten */
  Game.add({
    name: 'Legitimate interest',
    setup(c) {
      const partners = ['Kevin’s crypto newsletter', 'DataHamster Ltd.', 'Snoop & Sons', 'AdBlaster 3000', 'Grandma (reading along)', 'Cookie Cartel Inc.', 'Cloud No. 9', 'Somebody in Panama'];
      const el = c.mount(`<section class="panel">
        <header><h2>Legitimate interest</h2><p>These partners have a <em>legitimate interest</em> in you. You can object to each one individually. They will then object right back.</p></header>
        <ul class="toggles">${partners.map(p => `<li><span>${p}</span><button class="switch on" role="switch" aria-checked="true"><i></i></button></li>`).join('')}</ul>
        <footer><span class="panel-msg" aria-live="polite">All switches must be off at the same time.</span>
          <button class="btn btn-accept" data-trap>Accept all</button><button class="btn btn-ghost" data-save>Save selection</button></footer>
      </section>`);
      const timers = new Map(), msg = el.querySelector('.panel-msg');
      const set = (s, on) => {
        (timers.get(s) || []).forEach(clearTimeout);
        s.classList.toggle('on', on); s.classList.remove('warn'); s.setAttribute('aria-checked', on);
        if (!on) {
          timers.set(s, [
            c.later(() => s.classList.add('warn'), 3400),
            c.later(() => { set(s, true); c.sfx('bad'); msg.textContent = pick(['A partner has renewed their interest.', 'Objection to your objection.', 'Switch turned back on as a courtesy.']); }, 5000),
          ]);
        }
      };
      c.on(el, 'click', (e) => {
        const s = e.target.closest('.switch');
        if (s) { set(s, !s.classList.contains('on')); c.sfx('tick'); return; }
        if (e.target.closest('[data-save]')) {
          const left = el.querySelectorAll('.switch.on').length;
          if (!left) return c.win();
          msg.textContent = `${left} partners with legitimate interest remaining.`; c.nudge(el); c.sfx('bad');
        }
      });
    },
  });

  /* 5 – ABLEHNEN aus herumfliegenden Buchstaben zusammenklicken */
  Game.add({
    name: 'Alphabet soup',
    setup(c) {
      const word = 'DECLINE', D = 58;
      const el = c.mount(`<section class="dialog spell">
        <span class="dialog-step">Security check</span>
        <h2>Please spell out your decision</h2>
        <p>Catch the letters below in the right order. Make a mistake and you lose your last letter.</p>
        <div class="slots">${[...word].map(ch => `<b data-ch="${ch}"></b>`).join('')}</div>
        <div class="dialog-btns"><button class="btn btn-accept btn-s" data-trap data-why="Spelling was too much effort. Understandable. You still accepted.">Too much effort – accept</button></div>
      </section>`);
      const slots = [...el.querySelectorAll('.slots b')], placed = [];
      /* Spielfeld = alles unterhalb der Karte, damit kein Buchstabe über Text oder Knöpfen liegt */
      const top = () => Math.min(el.getBoundingClientRect().bottom + 14, innerHeight - D - 30);
      let pos = 0;
      const balls = [...word, 'Y', 'S', 'O', 'K'].map((ch, i) => {
        const b = c.mount(`<button class="letter" style="--hue:${(i * 47) % 360}">${ch}</button>`);
        const a = rand(0, 6.28), v = rand(60, 115);
        return { el: b, ch, taken: false, x: rand(10, innerWidth - D - 10), y: rand(top(), innerHeight - D - 10), vx: Math.cos(a) * v, vy: Math.sin(a) * v };
      });
      const paint = (b) => { b.el.style.transform = `translate(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px)`; };
      balls.forEach(paint);
      c.loop((dt) => {
        const x0 = 8, x1 = innerWidth - D - 8, y0 = top(), y1 = innerHeight - D - 8;
        const live = balls.filter(b => !b.taken);
        for (const b of live) {
          b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.x < x0) { b.x = x0; b.vx = Math.abs(b.vx); } else if (b.x > x1) { b.x = x1; b.vx = -Math.abs(b.vx); }
          if (b.y < y0) { b.y = y0; b.vy = Math.abs(b.vy); } else if (b.y > y1) { b.y = y1; b.vy = -Math.abs(b.vy); }
        }
        /* Buchstaben prallen voneinander ab, statt sich zu überdecken */
        for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
          const a = live[i], b = live[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
          if (d >= D) continue;
          const nx = dx / d, ny = dy / d, push = (D - d) / 2;
          a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) { a.vx += rel * nx; a.vy += rel * ny; b.vx -= rel * nx; b.vy -= rel * ny; }
        }
        live.forEach(paint);
      });
      balls.forEach(b => c.on(b.el, 'pointerdown', (e) => {
        e.preventDefault(); if (b.taken) return;
        if (b.ch === word[pos]) {
          b.taken = true; b.el.classList.add('taken'); placed.push(b);
          slots[pos].textContent = b.ch; slots[pos].classList.add('ok'); pos++;
          c.sfx('pop'); c.burst(e.clientX, e.clientY, 6);
          if (pos === word.length) c.win();
        } else {
          c.sfx('bad'); c.replay(b.el, 'wrong');
          const last = placed.pop();
          if (last) { pos--; slots[pos].textContent = ''; slots[pos].classList.remove('ok'); last.taken = false; last.el.classList.remove('taken'); }
        }
      }));
    },
  });

  /* 6 – Pop-ups schließen, ohne neue aufzumachen */
  Game.add({
    name: 'Pop-up hell',
    setup(c) {
      const defs = [
        { t: '📬 Newsletter!', p: 'Get 47 emails a day. Unsubscribe by fax only.', cta: 'Yesss!', no: 'No thanks, I hate discounts' },
        { t: '🔔 Notifications', p: 'grandmas-bakery.com wants to wake you at 3 a.m.', cta: 'Allow' },
        { t: '🎉 Congratulations!', p: 'You are the 1,000,000th visitor. Again.', cta: 'Claim prize' },
        { t: '💬 Kevin from support', p: 'Hi! I’m Kevin. I am not a bot. Beep.', cta: 'Chat' },
        { t: '📱 Get the app', p: 'The recipe is 0% better in the app.', cta: 'Install' },
        { t: '⭐ Rate us', p: 'How do you like the recipe you haven’t been allowed to read yet?', cta: '5 stars' },
        { t: '🛒 Wait!', p: 'Your basket is empty. We’re worried about you.', cta: 'Buy something' },
      ];
      const trap = { t: '🍪 Quick reminder', p: 'You haven’t accepted yet. Is everything all right?', cta: 'Accept all', trap: 1 };
      const colors = ['var(--sun)', 'var(--pink)', 'var(--sky)', 'var(--lilac)', 'var(--mint)'];
      const START = 6; let open = 0, total = 0, z = 6;
      const counter = c.mount('<div class="chip-counter">Open windows: <b>0</b> · Close them all. Hands off the big buttons.</div>');
      const upd = () => { counter.querySelector('b').textContent = open; if (open === 0 && total >= START) c.win(); };
      const spawn = (def = pick(defs)) => {
        if (open >= 12 || !c.live()) return;
        total++; open++;
        const w = c.mount(`<div class="popup x-${pick(['tl', 'tr', 'bl', 'br'])}" style="--tilt:${rand(-3, 3).toFixed(1)}deg;--c:${pick(colors)}">
          <button class="popup-x" aria-label="Close">×</button><h3>${def.t}</h3><p>${def.p}</p>
          <button class="btn ${def.trap ? 'btn-accept' : 'btn-primary'} popup-cta">${def.cta}</button>
          ${def.no ? `<button class="btn-link popup-no">${def.no}</button>` : ''}</div>`);
        c.place(w); w.style.zIndex = ++z;
        c.on(w, 'pointerdown', () => { w.style.zIndex = ++z; });
        c.on(w, 'click', (e) => {
          if (e.target.closest('.popup-x, .popup-no')) {
            if (w.classList.contains('closing')) return;
            w.classList.add('closing'); open--; c.sfx('pop'); c.later(() => w.remove(), 200); upd(); return;
          }
          if (e.target.closest('.popup-cta')) {
            if (def.trap) return c.lose('accept', 'One of the pop-ups said “Accept all”. You clicked it.');
            c.sfx('bad'); spawn(); spawn(); upd();
          }
        });
        upd();
      };
      shuffle([...shuffle(defs).slice(0, START - 1), trap]).forEach((d, k) => c.later(() => spawn(d), 250 + k * 380));
    },
  });

  /* 7 – Gedrückt halten, während der Knopf zappelt */
  Game.add({
    name: 'Hold on',
    setup(c) {
      c.mount(banner({
        cls: 'banner-slim',
        title: 'Nearly there',
        text: 'Hold the round button for <b>4 seconds</b> to decline. It wriggles a bit. That’s normal.',
        accept: 'Let go & accept',
      }));
      const btn = c.mount('<button class="hold"><span>Hold<br>to<br>decline</span></button>');
      const R = 66; let p = 0, holding = false, t = rand(0, 6);
      c.on(btn, 'pointerdown', (e) => { e.preventDefault(); holding = true; c.sfx('click'); });
      c.on(btn, 'contextmenu', (e) => e.preventDefault());
      c.on(window, 'pointerup', () => { holding = false; });
      c.on(window, 'pointercancel', () => { holding = false; });
      c.loop((dt) => {
        t += dt * (.65 + p * 1.2);
        const ax = Math.min(innerWidth * .32, 340), ay = Math.min(innerHeight * .17, 150);
        const cx = innerWidth / 2 + Math.sin(t * 1.3) * ax, cy = innerHeight * .4 + Math.sin(t * 2.1 + 1) * ay;
        btn.style.transform = `translate(${cx - R}px,${cy - R}px)`;
        if (holding && Math.hypot(c.px - cx, c.py - cy) > R + 10) { holding = false; c.sfx('bad'); }
        p = holding ? p + dt / 4 : Math.max(0, p - dt * 1.6);
        btn.style.setProperty('--p', p.toFixed(3)); btn.classList.toggle('holding', holding);
        if (p >= 1) { c.burst(cx, cy, 14); c.win(); }
      });
    },
  });
})();
