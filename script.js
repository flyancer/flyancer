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

/* ── LOGIN POPUP ── */
(function initLoginPopup() {
  const popup = document.getElementById('loginPopup');
  if (!popup) return;

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

  // Common free/personal email domains — blocked for the Expert path
  const FREE_DOMAINS = [
    'gmail.com', 'yahoo.com', 'yahoo.co.in', 'hotmail.com', 'outlook.com',
    'live.com', 'icloud.com', 'me.com', 'aol.com', 'protonmail.com',
    'rediffmail.com', 'zoho.com', 'gmx.com', 'mail.com'
  ];

  function isLoggedIn() {
    return !!localStorage.getItem('flyancer_user');
  }

  function showPopup() {
    if (isLoggedIn()) return;
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
      if (!isLoggedIn() && !popup.classList.contains('open')) {
        showPopup();
      }
    }, 18000);
  }

  // Don't show anything if already logged in
  if (isLoggedIn()) {
    popup.style.display = 'none';
  } else {
    // Initial appearance after a short delay
    setTimeout(showPopup, 4000);
    scheduleReshow();
  }

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

  form.addEventListener('submit', (e) => {
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

    // Store login state (in real deployment, this hits a backend / auth provider)
    localStorage.setItem('flyancer_user', JSON.stringify({ name, email, role: currentRole, ts: new Date().toISOString() }));

    form.classList.remove('active');
    success.classList.add('active');
    if (reshowTimer) clearInterval(reshowTimer);

    setTimeout(hidePopup, 2200);
  });
})();

// Called by "Free Username" nav CTA and hero CTA
function openLoginPopup(e) {
  if (e) e.preventDefault();
  const popup = document.getElementById('loginPopup');
  if (!popup) return;
  if (localStorage.getItem('flyancer_user')) return; // already logged in
  popup.classList.add('open');
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
