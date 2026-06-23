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
  if (!name || !email) return;

  // Store locally (in real deployment, send to backend / Airtable / Mailchimp)
  const waitlist = JSON.parse(localStorage.getItem('flyancer_waitlist') || '[]');
  waitlist.push({ name, email, ts: new Date().toISOString() });
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
