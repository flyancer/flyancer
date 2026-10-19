/* ═══════════════════════════════════════════
   FLYANCER — script.js
   ═══════════════════════════════════════════ */

// ── NAV scroll effect ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Mobile nav toggle ──
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Animated seconds counter (hero timer) ──
function animateCounter() {
  const el = document.getElementById('secCounter');
  if (!el) return;
  let val = 0;
  const target = 28;
  const duration = 2200;
  const step = duration / target;
  const interval = setInterval(() => {
    val++;
    el.textContent = val;
    if (val >= target) {
      clearInterval(interval);
      setTimeout(() => {
        val = 0;
        el.textContent = '0';
        animateCounter();
      }, 3000);
    }
  }, step);
}
animateCounter();

// ── Scroll reveal ──
const reveals = document.querySelectorAll('.service-card, .good-card, .why-inner, .comparison-card, .section-title, .section-sub');
reveals.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Stagger children ──
document.querySelectorAll('.services-grid, .good-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.style.transitionDelay = `${i * 80}ms`;
  });
});

// ── Waitlist form ──
function handleWaitlist(e) {
  e.preventDefault();
  const name = document.getElementById('wlName').value.trim();
  const email = document.getElementById('wlEmail').value.trim();
  const roleEl = document.getElementById('wlRole');
  const role = roleEl ? roleEl.value : '';
  if (!name || !email) return;

  // Store locally (in real deployment, send to backend / Airtable / Mailchimp)
  const waitlist = JSON.parse(localStorage.getItem('flyancer_waitlist') || '[]');
  waitlist.push({ name, email, role, ts: new Date().toISOString() });
  localStorage.setItem('flyancer_waitlist', JSON.stringify(waitlist));

  document.querySelector('.wl-form').style.display = 'none';
  const success = document.getElementById('wlSuccess');
  success.style.display = 'block';
  success.textContent = `✦ You're on the list, ${name}! We'll email you at ${email} when we launch.`;
}

// ── Smooth anchor offset (fixed nav) ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── AI particle cursor trail ──
(function initCursorTrail() {
  // Skip on touch devices — no real cursor to trail
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'cursorTrailCanvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = -100, mouseY = -100;
  let lastX = -100, lastY = -100;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const palette = ['#60A5FA', '#2563FF', '#22D3A5', '#A89DF9'];

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const dist = Math.hypot(mouseX - lastX, mouseY - lastY);
    const steps = Math.min(Math.max(Math.floor(dist / 8), 1), 4);

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const px = lastX + (mouseX - lastX) * t;
      const py = lastY + (mouseY - lastY) * t;

      particles.push({
        x: px + (Math.random() - 0.5) * 6,
        y: py + (Math.random() - 0.5) * 6,
        r: Math.random() * 2.5 + 1.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.15,
        life: 1,
        decay: Math.random() * 0.02 + 0.018,
        color: palette[Math.floor(Math.random() * palette.length)]
      });
    }

    lastX = mouseX;
    lastY = mouseY;

    if (particles.length > 160) particles.splice(0, particles.length - 160);
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life * 0.75;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    requestAnimationFrame(animate);
  }
  animate();
})();

/* ── SUPABASE CLIENT ── */
const flyancerSupabase = (window.supabase && window.FLYANCER_SUPABASE_URL)
  ? window.supabase.createClient(window.FLYANCER_SUPABASE_URL, window.FLYANCER_SUPABASE_ANON_KEY)
  : null;

/* ── LOGIN POPUP (real Supabase auth) ── */
(function initLoginPopup() {
  const popup = document.getElementById('loginPopup');
  if (!popup || !flyancerSupabase) return;

  const closeBtn = document.getElementById('lpClose');
  const roleSelect = document.getElementById('lpRoleSelect');
  const form = document.getElementById('lpForm');
  const backBtn = document.getElementById('lpBack');
  const formTitle = document.getElementById('lpFormTitle');
  const nameInput = document.getElementById('lpName');
  const emailInput = document.getElementById('lpEmail');
  const hint = document.getElementById('lpHint');
  const success = document.getElementById('lpSuccess');
  const roleBtns = document.querySelectorAll('.lp-role-btn');

  let currentRole = null;
  let reshowTimer = null;
  let loggedIn = false;

  // Common free/personal email domains — blocked for the Expert path.
  // NOTE: this is a client-side convenience check only. Real enforcement
  // should also live server-side (e.g. a Postgres trigger) before launch.
  const FREE_DOMAINS = [
    'gmail.com', 'yahoo.com', 'yahoo.co.in', 'hotmail.com', 'outlook.com',
    'live.com', 'icloud.com', 'me.com', 'aol.com', 'protonmail.com',
    'rediffmail.com', 'zoho.com', 'gmx.com', 'mail.com'
  ];

  function showPopup() {
    if (loggedIn) return;
    popup.classList.add('open');
  }

  function hidePopup() {
    popup.classList.remove('open');
  }

  function resetToRoleSelect() {
    popup.classList.remove('role-selected');
    form.classList.remove('active');
    success.classList.remove('active');
    roleSelect.style.display = 'block';
    form.reset();
    hint.textContent = '';
    hint.classList.remove('error');
    currentRole = null;
  }

  function scheduleReshow() {
    if (reshowTimer) clearInterval(reshowTimer);
    reshowTimer = setInterval(() => {
      if (!loggedIn && !popup.classList.contains('open')) showPopup();
    }, 18000);
  }

  // Check real Supabase session on load
  flyancerSupabase.auth.getSession().then(({ data }) => {
    loggedIn = !!data.session;
    if (loggedIn) {
      popup.style.display = 'none';
    } else {
      // Arriving from an Expert / Candidate page (?join=expert|candidate):
      // open the popup straight away with that role already chosen.
      const joinRole = new URLSearchParams(window.location.search).get('join');
      const preBtn = (joinRole === 'expert' || joinRole === 'candidate')
        ? document.querySelector('.lp-role-btn[data-role="' + joinRole + '"]') : null;
      if (preBtn) {
        showPopup();
        preBtn.click();
      } else {
        setTimeout(showPopup, 4000);
      }
      scheduleReshow();
    }
  });

  // Keep in sync if session changes (e.g. logs in via magic link in another tab)
  flyancerSupabase.auth.onAuthStateChange((_event, session) => {
    loggedIn = !!session;
    if (loggedIn) {
      popup.style.display = 'none';
      hidePopup();
      if (reshowTimer) clearInterval(reshowTimer);
    }
  });

  closeBtn.addEventListener('click', () => {
    hidePopup();
    resetToRoleSelect();
  });

  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentRole = btn.getAttribute('data-role');
      roleSelect.style.display = 'none';
      form.classList.add('active');
      if (currentRole === 'expert') {
        formTitle.textContent = 'Sign up as a Flyancer';
        emailInput.placeholder = 'Work email (e.g. you@company.com)';
      } else {
        formTitle.textContent = 'Sign up as a Candidate';
        emailInput.placeholder = 'Email address';
      }
      hint.textContent = '';
      hint.classList.remove('error');
    });
  });

  backBtn.addEventListener('click', () => {
    form.classList.remove('active');
    roleSelect.style.display = 'block';
    hint.textContent = '';
    hint.classList.remove('error');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    if (!name || !email) return;

    if (currentRole === 'expert') {
      const domain = email.split('@')[1] || '';
      if (FREE_DOMAINS.includes(domain)) {
        hint.textContent = 'Please use your official company email — personal addresses (Gmail, Yahoo, etc.) aren\'t accepted for Flyancer accounts.';
        hint.classList.add('error');
        return;
      }
    }

    const submitBtn = form.querySelector('.lp-submit');
    submitBtn.disabled = true;
    hint.classList.remove('error');
    hint.textContent = 'Sending your login link…';

    const { error } = await flyancerSupabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/onboarding.html',
        data: { full_name: name, role: currentRole }
      }
    });

    submitBtn.disabled = false;

    if (error) {
      hint.textContent = 'Something went wrong: ' + error.message;
      hint.classList.add('error');
      return;
    }

    form.classList.remove('active');
    success.classList.add('active');
    success.textContent = `✦ Check your inbox! We sent a login link to ${email}.`;
    if (reshowTimer) clearInterval(reshowTimer);
  });
})();

// Called by "Free Username" nav CTA and hero CTA
function openLoginPopup(e, role) {
  if (e) e.preventDefault();
  const popup = document.getElementById('loginPopup');
  if (!popup || !flyancerSupabase) return;
  flyancerSupabase.auth.getSession().then(({ data }) => {
    if (data.session) return; // already logged in
    popup.classList.add('open');
    if (role) {
      const btn = document.querySelector('.lp-role-btn[data-role="' + role + '"]');
      if (btn) btn.click(); // skip the "who are you" step — they already told us
    }
  });
}

/* ── ROTATING EXPERT MARQUEE + COMPANY FILTER ── */
(function initShowcaseMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;

  const originals = Array.from(track.querySelectorAll('.marquee-original'));
  const cloneHolder = track.querySelector('.marquee-clone-set');

  // Duplicate the card set for a seamless vertical loop, then discard the placeholder wrapper
  originals.forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.remove('marquee-original');
    clone.classList.add('marquee-clone');
    clone.setAttribute('aria-hidden', 'true');
    track.insertBefore(clone, cloneHolder);
  });
  if (cloneHolder) cloneHolder.remove();

  // Company filter chips
  const chips = document.querySelectorAll('.cf-chip');
  const marqueeWrap = document.getElementById('marqueeWrap');
  const filteredGrid = document.getElementById('filteredGrid');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.getAttribute('data-filter');

      if (filter === 'all') {
        marqueeWrap.style.display = '';
        filteredGrid.classList.remove('active');
        filteredGrid.innerHTML = '';
      } else {
        marqueeWrap.style.display = 'none';
        filteredGrid.classList.add('active');
        filteredGrid.innerHTML = '';
        originals.forEach(card => {
          if (card.getAttribute('data-company') === filter) {
            filteredGrid.appendChild(card.cloneNode(true));
          }
        });
      }
    });
  });
})();

/* ── WHOLE-PAGE GLITTER BACKGROUND ── */
(function initGlitterBackground() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'glitterCanvas';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const palette = [
    'rgba(96,165,250,ALPHA)',   // blue
    'rgba(37,99,255,ALPHA)',    // blue2
    'rgba(168,157,249,ALPHA)',  // purple
    'rgba(34,211,165,ALPHA)',   // green
    'rgba(255,255,255,ALPHA)'   // white pop
  ];

  let particles = [];
  let w = 0, h = 0;
  let running = true;

  function particleCount() {
    const area = window.innerWidth * window.innerHeight;
    // "Noticeable" density, capped for performance on very large screens
    return Math.max(90, Math.min(260, Math.floor(area / 7000)));
  }

  function makeParticle() {
    const isPop = Math.random() < 0.12; // occasional bigger sparkle
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: isPop ? 1.8 + Math.random() * 2.2 : 0.6 + Math.random() * 1.4,
      baseAlpha: isPop ? 0.55 + Math.random() * 0.35 : 0.25 + Math.random() * 0.35,
      color: palette[Math.floor(Math.random() * palette.length)],
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      twinkleSpeed: 0.015 + Math.random() * 0.035, // livelier twinkle
      phase: Math.random() * Math.PI * 2
    };
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const count = particleCount();
    if (particles.length < count) {
      while (particles.length < count) particles.push(makeParticle());
    } else {
      particles.length = count;
    }
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  });

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.twinkleSpeed;

      // Wrap around edges so particles drift forever
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
      if (p.y < -5) p.y = h + 5;
      if (p.y > h + 5) p.y = -5;

      const twinkle = (Math.sin(p.phase) + 1) / 2; // 0..1
      const alpha = p.baseAlpha * (0.35 + twinkle * 0.65);

      ctx.beginPath();
      ctx.fillStyle = p.color.replace('ALPHA', alpha.toFixed(3));
      ctx.shadowBlur = p.r * 2.5;
      ctx.shadowColor = p.color.replace('ALPHA', (alpha * 0.6).toFixed(3));
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ── LOGO CAROUSEL — duplicate the set for a seamless left-to-right loop ── */
(function initLogoMarquee() {
  const track = document.getElementById('logoMarqueeTrack');
  if (!track) return;

  const originals = Array.from(track.querySelectorAll('.logo-chip--orig'));
  originals.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
})();

/* ── AMBIENT SOUND — plays automatically, no button ──
   Browsers block audio-with-sound from starting on its own before the
   visitor has interacted with the page at all (a universal browser rule,
   not something we can switch off). So we try to play immediately, and
   if that's blocked, we start it on the very first click/tap/scroll/key
   press anywhere on the page — whichever happens first — with no icon
   or prompt involved. To the visitor it simply starts playing shortly
   after they land and begin browsing. */
(function initAmbientSound() {
  const audio = document.getElementById('ambientAudio');
  if (!audio) return;

  audio.volume = 0.35; // ambient background, not full blast

  const btn = document.getElementById('soundToggle');
  const KEY = 'flyancer_sound_muted';
  let userMuted = false;
  try { userMuted = localStorage.getItem(KEY) === 'true'; } catch (e) {}

  function setIcon(playing) {
    if (!btn) return;
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.setAttribute('aria-label', playing ? 'Turn off background sound' : 'Turn on background sound');
  }
  // Icon always reflects whether sound is actually playing
  audio.addEventListener('play', () => setIcon(true));
  audio.addEventListener('pause', () => setIcon(false));
  setIcon(false);

  let started = false;
  function start() {
    if (started || userMuted) return;
    audio.play().then(() => { started = true; }).catch(() => {
      // blocked until the visitor interacts — listeners below retry
    });
  }

  // Try right away (works in some browsers/contexts without interaction).
  start();

  // Fallback: start on the first interaction of any kind.
  const events = ['click', 'touchstart', 'keydown', 'scroll', 'pointerdown'];
  function onFirstInteraction(e) {
    if (btn && e && btn.contains(e.target)) return; // the icon handles its own click
    start();
    if (started || userMuted) {
      events.forEach(evt => document.removeEventListener(evt, onFirstInteraction));
    }
  }
  events.forEach(evt => document.addEventListener(evt, onFirstInteraction, { passive: true }));

  // Manual on/off via the tiny icon; choice is remembered
  if (btn) {
    btn.addEventListener('click', () => {
      if (audio.paused) {
        userMuted = false;
        try { localStorage.setItem(KEY, 'false'); } catch (e) {}
        audio.play().then(() => { started = true; }).catch(() => {});
      } else {
        userMuted = true;
        try { localStorage.setItem(KEY, 'true'); } catch (e) {}
        audio.pause();
      }
    });
  }
})();

/* ═══════════════ ROCKET (images) + generated sound effects ═══════════════ */
const Rocket = (function () {
  const meta = {"expert": {"w": 300, "h": 456, "cx": 0.4997, "cy": 0.4154, "ft": 0.8304}, "candidate": {"w": 300, "h": 757, "cx": 0.4991, "cy": 0.2993, "ft": 0.5978}};

  function make(theme, W, withFlame) {
    const m = meta[theme] || meta.candidate;
    const el = document.createElement('div');
    el.className = 'rk';
    const H = W * m.h / m.w;
    el.style.width = W + 'px';
    el.style.height = H + 'px';
    el.style.marginLeft = (-W * m.cx) + 'px';
    el.style.marginTop = (-H * m.cy) + 'px';
    el.style.setProperty('--ft', (m.ft * 100).toFixed(1) + '%');
    el.innerHTML = (withFlame ? '<img class="rk-flame" src="assets/rocket-' + theme + '-flame.webp" alt="" draggable="false">' : '') +
                   '<img class="rk-body" src="assets/rocket-' + theme + '-body.webp" alt="" draggable="false">';
    return el;
  }

  function puff(x, y, size) {
    const p = document.createElement('div');
    p.className = 'rk-puff';
    p.style.width = p.style.height = size + 'px';
    p.style.left = (x - size / 2) + 'px';
    p.style.top = (y - size / 2) + 'px';
    document.body.appendChild(p);
    const dx = (Math.random() - 0.5) * 50, dy = 30 + Math.random() * 60;
    const a = p.animate([
      { transform: 'translate(0,0) scale(.4)', opacity: 0.65 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + (2 + Math.random() * 1.6) + ')', opacity: 0 }
    ], { duration: 700 + Math.random() * 500, easing: 'ease-out' });
    a.onfinish = () => p.remove();
  }

  function shake(el, ms) {
    if (!el.animate) return;
    el.animate([
      { transform: 'translate(0,0)' }, { transform: 'translate(-3px,2px)' }, { transform: 'translate(3px,-2px)' },
      { transform: 'translate(-2px,-2px)' }, { transform: 'translate(2px,2px)' }, { transform: 'translate(0,0)' }
    ], { duration: ms, iterations: 2 });
  }

  return { make, puff, shake, meta };
})();

const FX = (function () {
  let ctx = null;
  function get() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    } catch (e) { return null; }
  }
  function muted() { try { return localStorage.getItem('flyancer_sound_muted') === 'true'; } catch (e) { return false; } }
  function noise(c, sec) {
    const b = c.createBuffer(1, Math.floor(c.sampleRate * sec), c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b; return s;
  }
  function env(g, t, pts) { // [[time, value, ...]]
    g.gain.setValueAtTime(0.0001, t);
    pts.forEach(([dt, v]) => g.gain.linearRampToValueAtTime(Math.max(v, 0.0001), t + dt));
  }

  // Fun rocket launch: ignition pop → rumble → rising whoosh → cartoon "whoop"
  function launch() {
    const c = get(); if (!c || muted() || c.state !== 'running') return;
    const t = c.currentTime, out = c.createGain(); out.gain.value = 0.9; out.connect(c.destination);

    const pop = noise(c, 0.15), pg = c.createGain(), pf = c.createBiquadFilter();
    pf.type = 'lowpass'; pf.frequency.value = 1400; pop.connect(pf); pf.connect(pg); pg.connect(out);
    env(pg, t, [[0.005, 0.5], [0.14, 0.0001]]); pop.start(t); pop.stop(t + 0.16);

    const rum = noise(c, 2), rf = c.createBiquadFilter(), rg = c.createGain();
    rf.type = 'lowpass'; rf.frequency.setValueAtTime(180, t); rf.frequency.linearRampToValueAtTime(520, t + 1.6);
    rum.connect(rf); rf.connect(rg); rg.connect(out);
    env(rg, t + 0.05, [[0.25, 0.55], [1.2, 0.35], [1.7, 0.0001]]); rum.start(t); rum.stop(t + 1.9);

    const wh = noise(c, 2), wf = c.createBiquadFilter(), wg = c.createGain();
    wf.type = 'bandpass'; wf.Q.value = 0.9;
    wf.frequency.setValueAtTime(380, t + 0.2); wf.frequency.exponentialRampToValueAtTime(4200, t + 1.7);
    wh.connect(wf); wf.connect(wg); wg.connect(out);
    env(wg, t + 0.2, [[0.5, 0.35], [1.0, 0.5], [1.5, 0.0001]]); wh.start(t); wh.stop(t + 1.9);

    const o = c.createOscillator(), og = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(170, t + 0.25); o.frequency.exponentialRampToValueAtTime(1350, t + 1.6);
    lfo.frequency.value = 9; lg.gain.value = 16; lfo.connect(lg); lg.connect(o.frequency);
    o.connect(og); og.connect(out);
    env(og, t + 0.25, [[0.15, 0.13], [1.0, 0.1], [1.3, 0.0001]]);
    o.start(t + 0.25); lfo.start(t + 0.25); o.stop(t + 1.65); lfo.stop(t + 1.65);
  }

  // Landing: descending whoosh, cartoon "wooop" down, soft thud at touchdown
  function land() {
    const c = get(); if (!c || muted() || c.state !== 'running') return;
    const t = c.currentTime, out = c.createGain(); out.gain.value = 0.85; out.connect(c.destination);

    const wh = noise(c, 2), wf = c.createBiquadFilter(), wg = c.createGain();
    wf.type = 'bandpass'; wf.Q.value = 0.8;
    wf.frequency.setValueAtTime(3200, t); wf.frequency.exponentialRampToValueAtTime(320, t + 1.7);
    wh.connect(wf); wf.connect(wg); wg.connect(out);
    env(wg, t, [[0.3, 0.4], [1.2, 0.3], [1.75, 0.0001]]); wh.start(t); wh.stop(t + 1.9);

    const o = c.createOscillator(), og = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(150, t + 1.6);
    o.connect(og); og.connect(out); env(og, t, [[0.2, 0.1], [1.4, 0.07], [1.7, 0.0001]]); o.start(t); o.stop(t + 1.75);

    const th = c.createOscillator(), tg = c.createGain();
    th.type = 'sine'; th.frequency.setValueAtTime(120, t + 1.7); th.frequency.exponentialRampToValueAtTime(42, t + 1.95);
    th.connect(tg); tg.connect(out); env(tg, t + 1.7, [[0.01, 0.55], [0.25, 0.0001]]); th.start(t + 1.7); th.stop(t + 2);
    const dust = noise(c, 0.3), df = c.createBiquadFilter(), dg = c.createGain();
    df.type = 'lowpass'; df.frequency.value = 700; dust.connect(df); df.connect(dg); dg.connect(out);
    env(dg, t + 1.7, [[0.01, 0.25], [0.25, 0.0001]]); dust.start(t + 1.7); dust.stop(t + 2);
  }
  return { launch, land, prime: get };
})();

/* ── LANDING (expert.html / candidate.html): rocket comes down and parks on the cloud ── */
(function initLanding() {
  const wrap = document.querySelector('.aud-cloud-wrap');
  const root = document.documentElement;
  if (!wrap) return;
  const theme = wrap.getAttribute('data-rocket') || 'candidate';
  const m = Rocket.meta[theme];

  // Parked rocket (always there, gently hovering)
  const parked = Rocket.make(theme, 100, false);
  parked.classList.add('rk--parked');
  parked.style.cssText = '';
  parked.style.aspectRatio = m.w + ' / ' + m.h;
  parked.style.translate = (-m.cx * 100) + '% ' + (-m.cy * 100) + '%';
  wrap.appendChild(parked);

  let flag = null;
  try { flag = JSON.parse(sessionStorage.getItem('flyancer_rocket') || 'null'); sessionStorage.removeItem('flyancer_rocket'); } catch (e) {}
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arriving = flag && Math.abs(Date.now() - flag.t) < 20000 && !reduce;
  if (!arriving) { root.classList.remove('rk-arriving'); return; }

  parked.style.visibility = 'hidden';
  const overlay = document.createElement('div');
  overlay.className = 'land-overlay';
  ['cloud-candidate', 'cloud-expert', 'cloud-candidate', 'cloud-expert'].forEach((n, i) => {
    const img = document.createElement('img');
    img.src = 'assets/' + n + '.webp'; img.alt = '';
    img.style.left = (6 + i * 24 + (i % 2) * 6) + '%';
    img.style.top = (30 + i * 28) + '%';
    overlay.appendChild(img);
    img.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-170vh)' }],
      { duration: 2100, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'forwards' });
  });
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    const pr = parked.getBoundingClientRect();
    const W = pr.width, H = W * m.h / m.w;
    const tx = pr.left + W * m.cx, ty = pr.top + H * m.cy;      // where the body centre must end up
    const fly = Rocket.make(theme, W, true);
    fly.classList.add('rk-fly');
    fly.style.left = tx + 'px'; fly.style.top = ty + 'px';
    document.body.appendChild(fly);

    const fall = ty + H * m.cy + 160;
    fly.animate([
      { transform: 'translateY(' + (-fall) + 'px) scale(1.1)' },
      { transform: 'translateY(0) scale(1)' }
    ], { duration: 2000, easing: 'cubic-bezier(.12,.7,.25,1)', fill: 'forwards' });
    const flame = fly.querySelector('.rk-flame');
    if (flame && flame.animate) {
      flame.animate([{ scale: '1 1.9' }, { scale: '1 1.3', offset: 0.65 }, { scale: '1 0.12' }],
        { duration: 2000, fill: 'forwards', easing: 'ease-out' });
    }

    let stop = false, last = 0;
    (function emit(ts) {
      if (stop) return;
      if (ts - last > 40) {
        last = ts;
        const r = fly.getBoundingClientRect();
        Rocket.puff(r.left + r.width * m.cx + (Math.random() - 0.5) * W * 0.4, r.top + r.height * m.ft * 0.95, 12 + Math.random() * 16);
      }
      requestAnimationFrame(emit);
    })(0);

    setTimeout(FX.land, 150);

    function touchdown() {
      stop = true;
      const baseY = pr.top + H * m.ft;
      for (let i = 0; i < 12; i++) {
        Rocket.puff(tx + (Math.random() - 0.5) * W * 1.7, baseY - 6 + Math.random() * 10, 18 + Math.random() * 26);
      }
      Rocket.shake(document.body, 260);
      parked.style.visibility = '';
      fly.remove();
      root.classList.remove('rk-arriving');
      overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, easing: 'ease-out', fill: 'forwards' })
        .onfinish = () => overlay.remove();
    }
    setTimeout(touchdown, 2000);
    setTimeout(() => { root.classList.remove('rk-arriving'); }, 7000); // failsafe
  });
})();

/* ── GATEWAY: cloud parallax + fly-through transition ── */
(function initGateway() {
  const gw = document.getElementById('gateway');
  if (!gw) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mouse parallax + cursor light (smoothed)
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    const clouds = Array.from(gw.querySelectorAll('.gw-cloud'));
    const imgs = clouds.map((c) => c.querySelector('.gw-cloud-img'));
    const lit = clouds.map(() => 0);
    const litTarget = clouds.map(() => 0);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function tick() {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      gw.style.setProperty('--mx', cx.toFixed(3));
      gw.style.setProperty('--my', cy.toFixed(3));
      let moving = Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002;
      for (let i = 0; i < lit.length; i++) {
        lit[i] += (litTarget[i] - lit[i]) * 0.12;
        if (Math.abs(litTarget[i] - lit[i]) > 0.004) moving = true;
        imgs[i].style.setProperty('--lit', lit[i].toFixed(3));
      }
      raf = moving ? requestAnimationFrame(tick) : null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    gw.addEventListener('mousemove', (e) => {
      const r = gw.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      gw.style.setProperty('--lx', (e.clientX - r.left) + 'px');
      gw.style.setProperty('--ly', (e.clientY - r.top) + 'px');
      gw.classList.add('gw-lit');
      // The closer the cursor is to a cloud's centre, the more that cloud lights up
      clouds.forEach((c, i) => {
        const cr = c.getBoundingClientRect();
        const dx = e.clientX - (cr.left + cr.width / 2);
        const dy = e.clientY - (cr.top + cr.height / 2);
        const reach = Math.max(cr.width, cr.height) * 0.85;
        const t = 1 - Math.min(1, Math.hypot(dx, dy) / reach);
        // Fully lit only when the cursor is on this cloud's icon / text; just a faint hint when merely nearby
        const onLabel = c.querySelector('.gw-cloud-label').matches(':hover');
        litTarget[i] = onLabel ? 1 : t * t * 0.22;
        c.classList.toggle('gw-hot', onLabel);
      });
      kick();
    });
    gw.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      litTarget.fill(0);
      clouds.forEach((c) => c.classList.remove('gw-hot'));
      gw.classList.remove('gw-lit');
      kick();
    });
  }

  // Click a cloud → rocket launches through the sky, then the page loads and the rocket lands
  let launching = false;
  const sky = gw.querySelector('.gw-sky');
  let skyAnim = null, streaks = null, flyer = null, puffTimer = null;

  function resetLaunch() {
    launching = false;
    gw.classList.remove('gw-launch');
    gw.querySelectorAll('.gw-picked').forEach((c) => c.classList.remove('gw-picked'));
    if (skyAnim) { skyAnim.cancel(); skyAnim = null; }
    if (streaks) { streaks.remove(); streaks = null; }
    if (flyer) { flyer.remove(); flyer = null; }
    if (puffTimer) { cancelAnimationFrame(puffTimer); puffTimer = null; }
    const fl = gw.querySelector('.gw-flash'); if (fl) fl.style.opacity = '';
  }

  gw.querySelectorAll('[data-gw-go]').forEach((cloud) => {
    cloud.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let "open in new tab" work
      e.preventDefault();
      if (launching) return;
      const href = cloud.getAttribute('href');
      const theme = cloud.classList.contains('gw-cloud--expert') ? 'expert' : 'candidate';
      try { sessionStorage.setItem('flyancer_rocket', JSON.stringify({ theme, t: Date.now() + 2200 })); } catch (err) {}
      if (reduce) { window.location.href = href; return; }
      launching = true;
      FX.prime();                      // unlock audio inside this click
      cloud.classList.add('gw-picked');
      gw.classList.add('gw-launch');

      // Rocket appears from the middle of the picked cloud
      const cr = cloud.getBoundingClientRect();
      const W = Math.max(70, Math.min(112, window.innerWidth * 0.075));
      flyer = Rocket.make(theme, W, true);
      flyer.classList.add('rk-fly');
      flyer.style.left = (cr.left + cr.width / 2) + 'px';
      flyer.style.top = (cr.top + cr.height / 2) + 'px';
      document.body.appendChild(flyer);
      const m = Rocket.meta[theme];
      const H = W * m.h / m.w;
      const dist = cr.top + cr.height / 2 + H + 120;

      flyer.animate([
        { transform: 'translateY(8px) scale(.4)', opacity: 0, offset: 0, easing: 'ease-out' },
        { transform: 'translateY(-6px) scale(1)', opacity: 1, offset: 0.22, easing: 'cubic-bezier(.55,0,.95,.5)' },
        { transform: 'translateY(' + (-dist) + 'px) scale(1.08)', opacity: 1, offset: 1 }
      ], { duration: 1750, fill: 'forwards' });
      const flame = flyer.querySelector('.rk-flame');
      if (flame && flame.animate) {
        flame.animate([
          { scale: '1 0.15', offset: 0 }, { scale: '1 1', offset: 0.22 }, { scale: '1 1.9', offset: 1 }
        ], { duration: 1750, fill: 'forwards', easing: 'ease-in' });
      }

      // Smoke trail from the nozzle
      let last = 0;
      (function emit(ts) {
        if (!flyer) return;
        if (ts - last > 34) {
          last = ts;
          const r = flyer.getBoundingClientRect();
          Rocket.puff(r.left + r.width * m.cx + (Math.random() - 0.5) * W * 0.3, r.top + r.height * m.ft * 0.92, 14 + Math.random() * 20);
        }
        puffTimer = requestAnimationFrame(emit);
      })(0);

      // Camera: the sky rushes downward as we climb; speed lines; flash to blue
      const cur = getComputedStyle(sky).transform;
      skyAnim = sky.animate(
        [{ transform: cur === 'none' ? 'none' : cur }, { transform: 'translateY(22%) scale(1.65)' }],
        { duration: 1750, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards' }
      );
      setTimeout(() => {
        streaks = document.createElement('div');
        streaks.className = 'gw-streaks';
        for (let i = 0; i < 22; i++) {
          const s = document.createElement('i');
          s.style.left = (Math.random() * 100).toFixed(1) + '%';
          s.style.animationDelay = (-Math.random() * 0.4).toFixed(2) + 's';
          s.style.animationDuration = (0.28 + Math.random() * 0.25).toFixed(2) + 's';
          s.style.opacity = (0.35 + Math.random() * 0.65).toFixed(2);
          streaks.appendChild(s);
        }
        gw.appendChild(streaks);
        requestAnimationFrame(() => streaks && streaks.classList.add('on'));
      }, 750);
      setTimeout(() => { const fl = gw.querySelector('.gw-flash'); if (fl) fl.style.opacity = '1'; }, 1350);

      FX.launch();
      Rocket.shake(gw, 420);
      setTimeout(() => { window.location.href = href; }, 1900);
    });
  });

  // Coming back with the browser Back button: reset everything
  window.addEventListener('pageshow', (e) => { if (e.persisted) resetLaunch(); });
})();
