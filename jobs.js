/* Flyancer — Live job postings dashboard (openings shared by verified experts) */
const sb = window.supabase.createClient(window.FLYANCER_SUPABASE_URL, window.FLYANCER_SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const JT = { full_time: 'Full-time', internship: 'Internship', contract: 'Contract' };
const ROLE_CHIPS = ['Software Engineer', 'Product Manager', 'Data Analyst', 'Data Scientist', 'AI Engineer', 'Product Designer', 'Talent Acquisition', 'Marketing', 'Sales'];
let all = [], session = null, saved = [];
const F = { q: '', types: [], cos: [], loc: '', sort: 'new', coq: '' };

try { saved = JSON.parse(localStorage.getItem('fly_saved_jobs') || '[]'); } catch (e) {}
const persist = () => { try { localStorage.setItem('fly_saved_jobs', JSON.stringify(saved)); } catch (e) {} };

function ago(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 6e4);
  if (m < 60) return Math.max(1, m) + ' min ago';
  const h = Math.floor(m / 60); if (h < 24) return h + ' hour' + (h > 1 ? 's' : '') + ' ago';
  const dd = Math.floor(h / 24); return dd + ' day' + (dd > 1 ? 's' : '') + ' ago';
}
function logoFor(co) {
  const L = window.FLY_LOGO || {}, k = Object.keys(L).find(n => co && co.toLowerCase().indexOf(n.toLowerCase()) > -1);
  return k ? '<svg viewBox="0 0 24 24" aria-label="' + esc(k) + '"><path d="' + L[k] + '"/></svg>' : esc((co || '?').charAt(0).toUpperCase());
}

async function init() {
  const { data: { session: s } } = await sb.auth.getSession(); session = s;
  if (session) { $('navDash').textContent = 'Dashboard'; $('navDash').href = 'dashboard.html'; }
  const q0 = new URLSearchParams(location.search).get('q'); if (q0) { F.q = q0; $('jbSearch').value = q0; }
  $('jbChips').innerHTML = ROLE_CHIPS.map(r => '<button type="button" class="jb-chip" data-q="' + esc(r) + '">' + esc(r) + '</button>').join('');
  const { data, error } = await sb.from('jobs')
    .select('id,title,company,location,job_type,description,job_url,created_at,profiles(full_name,username,job_title,gender,avatar,is_verified)')
    .gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(300);
  if (error) { $('jbGrid').innerHTML = '<div class="jb-empty"><h3>Couldn’t load openings</h3>Please refresh the page in a moment.</div>'; return; }
  all = (data || []).filter(j => j.profiles && j.profiles.is_verified);
  drawCompanies(); draw();
}

function drawCompanies() {
  const n = {}; all.forEach(j => { if (j.company) n[j.company] = (n[j.company] || 0) + 1; });
  const list = Object.keys(n).filter(c => c.toLowerCase().indexOf(F.coq) > -1).sort();
  $('jbCoList').innerHTML = list.length ? list.map(c => '<label><input type="checkbox" data-co="' + esc(c) + '"' + (F.cos.includes(c) ? ' checked' : '') + '> ' + esc(c) + '<em>' + n[c] + '</em></label>').join('') : '<p style="color:var(--muted);font-size:13px;margin:6px 0 0">No companies yet</p>';
}

function filtered() {
  const q = F.q.trim().toLowerCase(), l = F.loc.trim().toLowerCase();
  let r = all.filter(j => (!F.types.length || F.types.includes(j.job_type)) && (!F.cos.length || F.cos.includes(j.company)) &&
    (!l || (j.location || '').toLowerCase().includes(l)) &&
    (!q || q.split(/\s+/).every(w => [j.title, j.company, j.description, j.profiles.full_name, j.location].join(' ').toLowerCase().includes(w))));
  if (F.sort === 'co') r = r.slice().sort((a, b) => (a.company || '').localeCompare(b.company || ''));
  return r;
}

function draw() {
  const rows = filtered(), refs = {};
  all.forEach(j => { (refs[j.company] = refs[j.company] || new Set()).add(j.profiles.username); });
  const nf = F.types.length + F.cos.length + (F.loc ? 1 : 0); $('jbFcount').textContent = nf ? '(' + nf + ')' : '';
  $('jbCount').textContent = rows.length + (rows.length === 1 ? ' live opening' : ' live openings');
  document.querySelectorAll('.jb-chip').forEach(c => c.classList.toggle('on', c.dataset.q.toLowerCase() === F.q.trim().toLowerCase()));
  if (!rows.length) {
    $('jbGrid').innerHTML = '<div class="jb-empty"><h3>' + (all.length ? 'No openings match your filters' : 'No live openings yet') + '</h3>' +
      (all.length ? 'Try removing a filter or searching a broader role.' : 'Verified employees are just starting to post. In the meantime, you can ask an insider directly.') +
      '<br><a class="jb-btn" href="explore.html">Meet insiders →</a>' + (all.length ? '<button class="jb-btn g" id="jbReset" type="button">Clear filters</button>' : '') + '</div>';
    const rs = $('jbReset'); if (rs) rs.onclick = clearAll; return;
  }
  $('jbGrid').innerHTML = rows.map(j => {
    const p = j.profiles, isNew = Date.now() - new Date(j.created_at) < 3 * 864e5, nref = refs[j.company].size, sv = saved.includes(j.id);
    return '<article class="jb-card"><div class="jb-row"><div class="jb-logo">' + logoFor(j.company) + '</div>' +
      '<div class="jb-main"><div class="jb-co">' + esc(j.company || 'Company') + (isNew ? '<span class="jb-badge">New</span>' : '') + '<span class="jb-badge v">✓ Verified referrer</span></div>' +
      '<a class="jb-title" href="profile.html?u=' + esc(p.username) + '&job=' + j.id + '">' + esc(j.title) + '</a>' +
      '<div class="jb-meta">' + [esc(j.location || 'Location flexible'), JT[j.job_type], ago(j.created_at)].filter(Boolean).join('<i>·</i>') + '</div>' +
      (j.description ? '<p class="jb-desc">' + esc(j.description.length > 190 ? j.description.slice(0, 190) + '…' : j.description) + '</p>' : '') + '</div>' +
      '<div class="jb-act"><a class="jb-btn" href="profile.html?u=' + esc(p.username) + '&job=' + j.id + '">Request referral</a>' +
      '<button class="jb-btn g" type="button" data-save="' + j.id + '">' + (sv ? '★ Saved' : '☆ Save') + '</button></div></div>' +
      '<div class="jb-foot"><a class="jb-by" href="profile.html?u=' + esc(p.username) + '">' +
      (window.flyAvatar ? window.flyAvatar(p.avatar || p.gender || 'm1', p.username, 30, p.gender) : '') +
      '<span>Posted by <strong>' + esc(p.full_name) + '</strong>' + (p.job_title ? ' · ' + esc(p.job_title) : '') + '</span></a>' +
      '<span>' + nref + ' verified referrer' + (nref === 1 ? '' : 's') + ' at ' + esc(j.company) + ' <button class="jb-link" type="button" data-rep="' + j.id + '">Report</button></span></div></article>';
  }).join('');
  document.querySelectorAll('[data-rep]').forEach(b => b.onclick = () => report(b));
  document.querySelectorAll('[data-save]').forEach(b => b.onclick = () => {
    const id = b.dataset.save; saved = saved.includes(id) ? saved.filter(x => x !== id) : saved.concat(id); persist(); b.textContent = saved.includes(id) ? '★ Saved' : '☆ Save';
  });
}

function clearAll() {
  F.q = ''; F.types = []; F.cos = []; F.loc = ''; F.coq = ''; $('jbSearch').value = ''; $('jbLoc').value = ''; $('jbCoSearch').value = '';
  document.querySelectorAll('.jb-filters input[type=checkbox]').forEach(c => c.checked = false); drawCompanies(); draw();
}

async function report(btn) {
  if (!session) { location.href = 'join.html?role=candidate'; return; }
  const reason = prompt('What is wrong with this opening? (fake, expired, misleading…)');
  if (reason === null) return;
  const { error } = await sb.from('job_reports').insert({ job_id: btn.dataset.rep, reporter_id: session.user.id, reason: reason.trim().slice(0, 300) || null });
  btn.textContent = error ? (/duplicate|unique/i.test(error.message) ? 'Already reported' : 'Try again') : 'Reported ✓';
  if (!error || /duplicate|unique/i.test(error.message)) btn.disabled = true;
}

$('jbForm').addEventListener('submit', e => { e.preventDefault(); const go = () => { F.q = $('jbSearch').value; draw(); const t = document.querySelector('.jb-top'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  if (window.flyFinding && $('jbSearch').value.trim()) window.flyFinding(go, { kind: 'jobs', ms: 2800 }); else go(); });
$('jbSearch').addEventListener('input', () => { F.q = $('jbSearch').value; draw(); });
$('jbChips').addEventListener('click', e => { const b = e.target.closest('.jb-chip'); if (!b) return; F.q = (F.q.trim().toLowerCase() === b.dataset.q.toLowerCase()) ? '' : b.dataset.q; $('jbSearch').value = F.q; draw(); });
$('jbLoc').addEventListener('input', () => { F.loc = $('jbLoc').value; draw(); });
$('jbSort').addEventListener('change', () => { F.sort = $('jbSort').value; draw(); });
$('jbCoSearch').addEventListener('input', () => { F.coq = $('jbCoSearch').value.trim().toLowerCase(); drawCompanies(); });
$('jbClear').addEventListener('click', clearAll);
document.querySelector('.jb-filters').addEventListener('change', e => {
  const t = e.target; if (t.name === 'type') F.types = [...document.querySelectorAll('input[name=type]:checked')].map(x => x.value);
  if (t.dataset.co) F.cos = [...document.querySelectorAll('input[data-co]:checked')].map(x => x.dataset.co);
  draw();
});
if (window.matchMedia('(max-width:860px)').matches) $('jbFilters').open = false;
init();
