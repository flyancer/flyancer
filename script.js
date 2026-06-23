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
