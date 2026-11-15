/* Flyancer — "Finding insiders for you" interstitial.
   Shows a short ID-verification animation, then continues (opens the page / runs the search).
   Use: flyFinding(function(){ ... }, {kind:'jobs'})   or   flyFinding('explore.html')  */
(function () {
  var LOTTIE = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var el, anim, timers = [], busy = false, jsonCache = null;

  function ensureLottie(cb) {
    if (window.lottie) return cb();
    var s = document.createElement('script'); s.src = LOTTIE; s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }
  function preload() { ensureLottie(function () {}); if (!jsonCache) fetch('assets/kyc-loading.json').then(function (r) { return r.json(); }).then(function (j) { jsonCache = j; }).catch(function () {}); }

  function build() {
    el = document.createElement('div'); el.className = 'ff'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<div class="ff-anim" id="ffAnim"></div>' +
      '<div class="ff-line">' +
      '<div class="ff-step" data-s="0"><b id="ffT0">Finding insiders for you</b><small>Searching verified employees <span class="ff-dots"><i></i><i></i><i></i></span></small></div>' +
      '<div class="ff-step" data-s="1"><b>Checking company emails</b><small>Only real, work-email-verified people</small></div>' +
      '<div class="ff-step ff-ok" data-s="2"><b>✓ Verified insiders for you</b></div></div>' +
      '<div class="ff-bar"><i id="ffBar"></i></div><button class="ff-skip" type="button">Skip</button>';
    document.body.appendChild(el);
    el.querySelector('.ff-skip').onclick = function () { finish(true); };
  }
  function step(n) { el.querySelectorAll('.ff-step').forEach(function (s) { s.classList.toggle('on', +s.dataset.s === n); }); }

  var cont = null;
  function finish() {
    if (!busy) return; busy = false; timers.forEach(clearTimeout); timers = [];
    if (anim) { try { anim.destroy(); } catch (e) {} anim = null; }
    el.classList.remove('in');
    var fn = cont; cont = null;
    setTimeout(function () { el.classList.remove('on'); document.documentElement.style.overflow = ''; if (fn) fn(); }, 180);
  }

  window.flyFinding = function (next, opts) {
    opts = opts || {};
    if (busy) return;
    if (!el) build();
    busy = true;
    cont = typeof next === 'function' ? next : function () { location.href = next; };
    var total = reduce ? 1200 : (opts.ms || 3800);
    el.querySelector('#ffT0').textContent = opts.kind === 'jobs' ? 'Finding live openings for you' : 'Finding insiders for you';
    document.documentElement.style.overflow = 'hidden';
    el.classList.add('on'); void el.offsetWidth; el.classList.add('in');
    step(0);
    var bar = $('ffBar'); bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth; bar.style.transition = 'width ' + total + 'ms linear'; bar.style.width = '100%';
    if (!reduce) {
      ensureLottie(function () {
        if (!busy || !window.lottie) return;
        var host = $('ffAnim'); host.innerHTML = '';
        var cfg = { container: host, renderer: 'svg', loop: true, autoplay: true, rendererSettings: { viewBoxSize: '0 100 1080 1050', preserveAspectRatio: 'xMidYMid meet' } };
        if (jsonCache) cfg.animationData = JSON.parse(JSON.stringify(jsonCache)); else cfg.path = 'assets/kyc-loading.json';
        anim = lottie.loadAnimation(cfg); anim.setSpeed(2.4);
      });
    }
    timers.push(setTimeout(function () { step(1); }, total * .36));
    timers.push(setTimeout(function () { step(2); }, total * .64));
    timers.push(setTimeout(finish, total));
  };
  window.addEventListener('pageshow', function (e) { if (e.persisted && el) { busy = false; el.classList.remove('on', 'in'); document.documentElement.style.overflow = ''; } });
  function $(id) { return document.getElementById(id); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && busy) finish(); });

  // Auto-intercept on pages that opt in (home page): links to Meet Insiders / Get Referrals show the animation first
  if (document.documentElement.hasAttribute('data-finder') || document.body.hasAttribute('data-finder')) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target === '_blank') return;
      var h = a.getAttribute('href') || '';
      if (/^(explore|jobs)\.html/.test(h)) { e.preventDefault(); window.flyFinding(h, { kind: /^jobs/.test(h) ? 'jobs' : 'insiders' }); }
    });
    if ('requestIdleCallback' in window) requestIdleCallback(preload); else setTimeout(preload, 1500);
  }
})();
