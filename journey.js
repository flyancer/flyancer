/* Flyancer — Create · Connect · Grow tabs with small looping motion previews */
(function () {
  var tabs = document.getElementById('jnTabs'); if (!tabs) return;
  var panes = document.querySelectorAll('.jn-pane'), reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.jv-av').forEach(function (el) {
    var big = el.classList.contains('jv-av-lg'); el.innerHTML = window.flyAvatar ? window.flyAvatar(el.dataset.av, 'jn' + el.dataset.av, big ? 92 : 46) : '';
  });
  var typeEl = document.getElementById('jnType'), TXT = 'flyancer.com/soni', typeT = 0;
  function typeIt() {
    clearInterval(typeT); if (!typeEl) return;
    if (reduce) { typeEl.textContent = TXT; return; }
    var i = 0; typeEl.textContent = '';
    typeT = setInterval(function () { typeEl.textContent = TXT.slice(0, ++i); if (i >= TXT.length) clearInterval(typeT); }, 70);
  }
  function count(el) {
    var to = +el.dataset.to, n = 0; if (reduce) { el.textContent = to; return; }
    el.textContent = 0; var t = setInterval(function () { n++; el.textContent = n; if (n >= to) clearInterval(t); }, 55);
  }
  function show(id, scroll) {
    tabs.querySelectorAll('.jn-tab').forEach(function (b) { var on = b.dataset.t === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    panes.forEach(function (p) {
      var on = p.dataset.p === id; p.classList.toggle('on', on); p.classList.remove('play');
      if (on) { void p.offsetWidth; p.classList.add('play'); }
    });
    if (id === 'create') typeIt();
    if (id === 'grow') count(document.querySelector('.jv-num'));
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('.jn-tab'); if (b) show(b.dataset.t); });
  // deep links: #create / #connect / #grow
  function fromHash() { var h = (location.hash || '').slice(1); if (h === 'connect' || h === 'grow' || h === 'create') show(h); }
  window.addEventListener('hashchange', fromHash);
  var started = false;
  function start() { if (started) return; started = true; if (!/^#(connect|grow)$/.test(location.hash)) show('create'); else fromHash(); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) { start(); } }, { threshold: .25 }).observe(document.querySelector('.jn-pane.on'));
  else start();
  if (/^#(connect|grow)$/.test(location.hash)) fromHash();
})();
