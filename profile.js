/* Flyancer — public profile page. Works at /profile.html?u=name and (via 404.html) /name or /@name */
const sb = window.supabase.createClient(window.FLYANCER_SUPABASE_URL, window.FLYANCER_SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TYPES = Object.fromEntries(window.FLY_CATS.map(c => [c.k, c.label]));

function getUsername() {
  const q = new URLSearchParams(location.search).get('u');
  if (q) return q.replace(/^@/, '').toLowerCase();
  const m = location.pathname.match(/^\/@?([a-z0-9_]{3,20})\/?$/i);
  return m ? m[1].toLowerCase() : '';
}

const BOOK_ID = new URLSearchParams(location.search).get('book');
let session = null, me = null, profile = null, pendingService = null;

async function init() {
  const username = getUsername();
  const app = $('app');
  if (!username) { app.innerHTML = '<div class="pf-msg"><h2>No profile specified</h2><a class="pf-btn" href="index.html">Back to Flyancer</a></div>'; return; }

  const { data: { session: s } } = await sb.auth.getSession();
  session = s;
  if (session) {
    $('navDash').textContent = 'Dashboard';
    const { data } = await sb.from('profiles').select('id,role,username').eq('id', session.user.id).maybeSingle();
    me = data;
  }

  const { data: p, error } = await sb.from('profiles').select('*').eq('username', username).maybeSingle();
  if (error || !p) {
    document.title = 'Profile not found – Flyancer';
    app.innerHTML = `<div class="pf-msg"><h2>@${esc(username)} isn't on Flyancer yet</h2><p>This username is available — if it's yours, claim it.</p><br><a class="pf-btn" href="index.html">Get your free username</a></div>`;
    return;
  }
  profile = p;
  if (/^https?:$/.test(location.protocol) && location.pathname.endsWith('profile.html')) history.replaceState(null, '', '/' + p.username);
  const { data: services } = await sb.from('services').select('*').eq('profile_id', p.id).order('created_at');

  document.title = `${p.full_name}${p.company ? ' · ' + p.company : ''} – Flyancer`;
  const desc = `${p.full_name}${p.job_title ? ', ' + p.job_title : ''}${p.company ? ' at ' + p.company : ''} on Flyancer. ` + (p.bio || 'Book a 1:1 session.');
  document.querySelector('meta[name=description]').setAttribute('content', desc.slice(0, 160));

  const initials = p.full_name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const sub = [p.job_title, p.company].filter(Boolean).join(' · ');
  const isExpert = p.role === 'expert';
  const isOwn = me && me.id === p.id;

  app.innerHTML = `
    <section class="pf-hero">
      ${p.gender ? `<div class="pf-avatar pf-avatar--img">${window.flyAvatar(p.gender, p.username, 96)}</div>` : `<div class="pf-avatar">${esc(initials)}</div>`}
      <div>
        <div class="pf-name">${esc(p.full_name)}${p.is_verified ? `<span class="pf-badge" title="Verified through official ${esc(p.verified_domain)} email">✓ Verified${p.company ? ' · ' + esc(p.company) : ''}</span>` : ''}</div>
        ${sub ? `<div class="pf-role">${esc(sub)}</div>` : ''}
        <div class="pf-user">flyancer.com/${esc(p.username)}</div>
        ${isOwn ? '<div style="margin-top:12px"><a class="pf-btn ghost" href="dashboard.html">Edit profile &amp; services</a></div>' : ''}
      </div>
    </section>
    ${p.bio ? `<p class="pf-bio">${esc(p.bio)}</p>` : ''}
    ${isExpert ? `<h2 class="pf-h">Book a session</h2><div class="pf-grid" id="svcGrid"></div>` : ''}
    <p class="pf-note">Flyancer experts are verified through their official company email. Services are offered by individuals in a personal capacity — a referral is a recommendation and not a guarantee of an interview or job offer.</p>`;

  if (isExpert) {
    const grid = $('svcGrid');
    if (!services || !services.length) {
      grid.outerHTML = '<div class="pf-empty">No services listed yet — check back soon.</div>';
    } else {
      grid.innerHTML = services.map(s => `
        <div class="pf-card">
          <span class="pf-type">${(window.FLY_CAT[s.service_type]||{}).icon || ''} ${esc(TYPES[s.service_type] || s.service_type)}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.description || '')}</p>
          <div class="pf-foot"><span class="pf-price">₹${Number(s.price_inr).toLocaleString('en-IN')}</span>
          ${isOwn ? '' : `<button class="pf-btn" data-sid="${s.id}">Request →</button>`}</div>
        </div>`).join('');
      if (BOOK_ID && !isOwn) { const w = services.find(x => x.id === BOOK_ID); if (w) setTimeout(() => openRequest(w), 300); }
      grid.querySelectorAll('[data-sid]').forEach(b => b.addEventListener('click', () => openRequest(services.find(x => x.id === b.dataset.sid))));
    }
  }
}

function openRequest(svc) {
  if (!session) { location.href = 'index.html?join=candidate'; return; }
  if (!me) { location.href = 'onboarding.html'; return; }
  pendingService = svc;
  $('reqTitle').textContent = `Request: ${svc.title}`;
  $('reqErr').textContent = '';
  $('reqModal').classList.add('open');
}
$('reqCancel').onclick = () => $('reqModal').classList.remove('open');
$('reqForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('reqSend'); btn.disabled = true; btn.textContent = 'Sending…';
  const { error } = await sb.from('bookings').insert({
    candidate_id: me.id, expert_id: profile.id, service_id: pendingService.id,
    job_url: $('reqJob').value.trim() || null, resume_url: $('reqResume').value.trim() || null,
    message: $('reqMsg').value.trim() || null
  });
  btn.disabled = false; btn.textContent = 'Send request';
  if (error) { $('reqErr').textContent = 'Could not send: ' + error.message; return; }
  $('reqForm').innerHTML = '<h3 style="font:800 1.15rem var(--font-display)">Request sent ✓</h3><p style="color:rgba(240,244,255,.8)">The expert will review it and respond. Payment is arranged after they accept.</p><button type="button" class="pf-btn" onclick="location.reload()">Done</button>';
});

init();
