/* Flyancer · "What's on a candidate's mind" — robot thinks a question, then answers in its thought bubble. */
(function () {
  'use strict';
  var DATA = [
    { q: 'Why would someone refer me?',
      a: 'Many companies pay employees a bonus when a referred hire joins, and a strong referral reflects well on the person making it. Make it easy for them to say yes.' },
    { q: 'How much do referral bonuses pay?',
      a: 'It depends on the company and role. TCS pays ₹15,000–₹40,000 depending on how quickly the hire joins; US tech roles often fall between $1,000 and $10,000. Paid only after the hire joins.',
      s: 'TCS (2026) · Erin (2023)' },
    { q: 'Does a referral really help?',
      a: 'In a Lever study of 4M+ candidates, about 1 in 16 referrals was hired, against about 1 in 152 career-page applicants. A referral gets you noticed. You still earn the offer.',
      s: 'Lever study · 2015–16 data' },
    { q: 'How do I find the right insider?',
      a: 'Search by company or role. Every expert is verified with a work email, so you can compare titles and services, then send one focused request.' },
    { q: 'Will my current employer find out?',
      a: 'Flyancer never contacts employers, and your request goes only to the expert you choose. Use a personal email, not your work one.' },
    { q: 'Is a referral a guarantee?',
      a: 'No. A referral is a professional recommendation, not a promise of an interview or offer. It opens the door; your preparation gets you through.' }
  ];
  
  window.FLY_FAQ = DATA;
  var root = document.getElementById('hq'); if (!root) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var qBox = root.querySelector('.hq-qb .hq-g'), aBox = root.querySelector('.hq-ab .hq-g');
  var qt = root.querySelector('.hq-qt'), at = root.querySelector('.hq-at'), src = root.querySelector('.hq-src');
  var dotsBox = document.getElementById('hqDots');
  /* invisible copies of every question/answer reserve the tallest height, so the bubbles never jump */
  DATA.forEach(function (d, i) {
    var g1 = document.createElement('div'); g1.className = 'hq-gh'; g1.setAttribute('aria-hidden', 'true'); g1.innerHTML = '<p class="hq-q">' + d.q + '</p>'; qBox.appendChild(g1);
    var g2 = document.createElement('div'); g2.className = 'hq-gh'; g2.setAttribute('aria-hidden', 'true'); g2.innerHTML = '<p class="hq-a">' + d.a + '</p>' + (d.s ? '<p class="hq-src" style="opacity:1">Source: ' + d.s + '</p>' : ''); aBox.appendChild(g2);
    if (dotsBox) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'hq-dot'; b.setAttribute('aria-label', 'Question ' + (i + 1) + ': ' + d.q);
      b.addEventListener('click', function () { show(i, true); }); dotsBox.appendChild(b);
    }
  });
  var dots = dotsBox ? dotsBox.querySelectorAll('.hq-dot') : [];
  var cur = -1, tok = 0, timers = [], running = false, visible = true;
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearAll() { timers.forEach(clearTimeout); timers = []; }
  function type(el, full, speed, done, my) {
    var i = 0;
    (function step() { if (my !== tok) return; i = Math.min(full.length, i + 1); el.textContent = full.slice(0, i); if (i < full.length) later(step, speed); else if (done) done(); })();
  }
  function show(i, manual) {
    var my = ++tok; clearAll(); cur = i; var d = DATA[i];
    for (var k = 0; k < dots.length; k++) dots[k].classList.toggle('on', k === i);
    qt.textContent = ''; at.textContent = ''; src.textContent = '';
    if (reduce) { qt.textContent = d.q; at.textContent = d.a; src.textContent = d.s ? 'Source: ' + d.s : ''; root.setAttribute('data-s', 'done'); return; }
    root.setAttribute('data-s', 'out');
    later(function () {
      if (my !== tok) return;
      root.setAttribute('data-s', 'q');                      /* student's question floats in and types */
      type(qt, d.q, 34, function () {
        later(function () {
          if (my !== tok) return;
          root.setAttribute('data-s', 'dots');               /* insider starts replying */
          later(function () {
            if (my !== tok) return;
            root.setAttribute('data-s', 'a');
            type(at, d.a, 16, function () {
              root.setAttribute('data-s', 'done'); src.textContent = d.s ? 'Source: ' + d.s : '';
              later(function () { if (my === tok) show((cur + 1) % DATA.length); }, 3400 + d.a.length * 14);
            }, my);
          }, 750);
        }, 550);
      }, my);
    }, manual ? 120 : 380);
  }
  function sync() {
    var on = visible && !document.hidden;
    if (on && !running) { running = true; show(cur < 0 ? 0 : cur); }
    else if (!on && running) { running = false; tok++; clearAll(); }
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }, { threshold: 0.2 }).observe(root); else sync();
  document.addEventListener('visibilitychange', sync);
  sync();
})();
