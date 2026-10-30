/* Flyancer — Explore: browse services by category, then request */
const sb = window.supabase.createClient(window.FLYANCER_SUPABASE_URL, window.FLYANCER_SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const QS = new URLSearchParams(location.search);
let topic = QS.get('topic') || '', subPhrase = QS.get('sub') || '';
let all = [], cat = new URLSearchParams(location.search).get('cat') || 'all';
if (cat !== 'all' && !window.FLY_CAT[cat]) cat = 'all';

async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) $('navDash').textContent = 'Dashboard';

  const { data, error } = await sb.from('services')
    .select('id,title,topic,description,price_inr,service_type,created_at,profiles(full_name,username,company,job_title,gender,avatar,is_verified,role)')
    .order('created_at', { ascending: false }).limit(300);
  if (error) { $('exGrid').innerHTML = '<div class="pf-empty">Could not load experts right now. Please refresh.</div>'; return; }
  all = (data || []).filter(s => s.profiles && s.profiles.role === 'expert');
  const T = window.FLY_TOPICS || [];
  $('exTopic').innerHTML = '<option value="">All topics</option>' + T.map(t => `<option value="${t.id}">${esc(t.label)}</option>`).join('');
  if (!T.some(t => t.id === topic)) topic = '';
  $('exTopic').value = topic;
  if (subPhrase) {
    const hit = T.flatMap(t => t.subs.map(s => ({ s, id: t.id }))).find(x => x.s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === subPhrase);
    if (hit) $('exBanner').innerHTML = `<div class="ex-banner">Looking for: <strong>${esc(hit.s)}</strong> — pick an expert below and mention this in your request.</div>`;
  }
  drawCats(); draw();
}

function drawCats() {
  const count = (k) => all.filter(s => k === 'all' || s.service_type === k).length;
  const items = [{ k: 'all', label: 'All', icon: '✨' }, ...window.FLY_CATS];
  $('exCats').innerHTML = items.map(c =>
    `<button class="ex-chip ${cat === c.k ? 'on' : ''}" data-k="${c.k}"><span>${c.icon}</span>${esc(c.label)}<em>${count(c.k)}</em></button>`).join('');
  $('exCats').querySelectorAll('.ex-chip').forEach(b => b.onclick = () => { cat = b.dataset.k; drawCats(); draw(); });
}

function draw() {
  const q = $('exSearch').value.trim().toLowerCase();
  let rows = all.filter(s => (cat === 'all' || s.service_type === cat) && (!topic || s.topic === topic) &&
    (!q || [s.title, s.description, s.profiles.full_name, s.profiles.company, s.profiles.job_title, s.profiles.username].join(' ').toLowerCase().includes(q)));
  const sort = $('exSort').value;
  if (sort === 'low') rows.sort((a, b) => a.price_inr - b.price_inr);
  if (sort === 'high') rows.sort((a, b) => b.price_inr - a.price_inr);
  $('exCount').textContent = rows.length + (rows.length === 1 ? ' service' : ' services');

  if (!rows.length) {
    const c = window.FLY_CAT[cat];
    $('exGrid').innerHTML = `<div class="pf-empty" style="grid-column:1/-1">No experts for ${c ? esc(c.label.toLowerCase()) : 'this'} yet.<br><br><a class="pf-btn" href="expert.html">Become an expert</a></div>`;
    return;
  }
  $('exGrid').innerHTML = rows.map(s => {
    const p = s.profiles, c = window.FLY_CAT[s.service_type];
    const sub = [p.job_title, p.company].filter(Boolean).join(' · ');
    return `<div class="pf-card">
      <span class="pf-type">${c ? c.icon + ' ' + esc(c.label) : esc(s.service_type)}</span>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.description || '')}</p>
      <a class="ex-exp" href="profile.html?u=${esc(p.username)}">
        ${(p.avatar || p.gender) ? window.flyAvatar(p.avatar || p.gender, p.username, 38, p.gender) : `<span class="ex-ini">${esc(p.full_name.charAt(0))}</span>`}
        <span><strong>${esc(p.full_name)}${p.is_verified ? ' <i class="ex-tick" title="Verified via company email">✓</i>' : ''}</strong><small>${esc(sub)}</small></span>
      </a>
      <div class="pf-foot"><span class="pf-price">₹${Number(s.price_inr).toLocaleString('en-IN')}</span>
        <a class="pf-btn" href="profile.html?u=${esc(p.username)}&book=${s.id}">Request →</a></div>
    </div>`;
  }).join('');
}

$('exSearch').addEventListener('input', draw);
$('exSort').addEventListener('change', draw);
$('exTopic').addEventListener('change', () => { topic = $('exTopic').value; draw(); });
init();
