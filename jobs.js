/* Flyancer — Jobs: openings posted by verified experts */
const sb = window.supabase.createClient(window.FLYANCER_SUPABASE_URL, window.FLYANCER_SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const JT = { full_time: 'Full-time', internship: 'Internship', contract: 'Contract' };
let all = [], session = null;

async function init() {
  const { data: { session: s } } = await sb.auth.getSession(); session = s;
  if (session) $('navDash').textContent = 'Dashboard';
  const { data, error } = await sb.from('jobs')
    .select('id,title,company,location,job_type,description,created_at,profiles(full_name,username,job_title,gender,avatar,is_verified)')
    .gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(300);
  if (error) { $('jbGrid').innerHTML = '<div class="pf-empty">Could not load openings. Please refresh.</div>'; return; }
  all = (data || []).filter(j => j.profiles && j.profiles.is_verified);
  draw();
}

function draw() {
  const q = $('jbSearch').value.trim().toLowerCase(), t = $('jbType').value, l = $('jbLoc').value.trim().toLowerCase();
  const rows = all.filter(j => (!t || j.job_type === t) && (!l || (j.location || '').toLowerCase().includes(l)) &&
    (!q || [j.title, j.company, j.description, j.profiles.full_name].join(' ').toLowerCase().includes(q)));
  $('jbCount').textContent = rows.length + (rows.length === 1 ? ' opening' : ' openings');
  if (!rows.length) {
    $('jbGrid').innerHTML = `<div class="pf-empty" style="grid-column:1/-1">${all.length ? 'No openings match your filters.' : 'No openings yet — verified employees will post here soon.'}<br><br><a class="pf-btn" href="explore.html">Browse experts instead</a></div>`;
    return;
  }
  $('jbGrid').innerHTML = rows.map(j => {
    const p = j.profiles;
    return `<div class="pf-card">
      <span class="pf-type">💼 ${esc(JT[j.job_type] || '')}${j.location ? ' · ' + esc(j.location) : ''}</span>
      <h3>${esc(j.title)}</h3>
      <div style="color:var(--blue2);font-weight:600;font-size:14px">${esc(j.company || '')}</div>
      <p>${esc((j.description || '').slice(0, 160))}${(j.description || '').length > 160 ? '…' : ''}</p>
      <a class="ex-exp" href="profile.html?u=${esc(p.username)}">
        ${(p.avatar || p.gender) ? window.flyAvatar(p.avatar || p.gender, p.username, 38, p.gender) : `<span class="ex-ini">${esc(p.full_name.charAt(0))}</span>`}
        <span><strong>${esc(p.full_name)} <i class="ex-tick" title="Verified via company email">✓</i></strong><small>${esc(p.job_title || 'Verified employee')}</small></span>
      </a>
      <div class="pf-foot"><button class="pf-btn ghost" data-rep="${j.id}" type="button" style="padding:8px 12px;font-size:12px">Report</button>
        <a class="pf-btn" href="profile.html?u=${esc(p.username)}&job=${j.id}">Ask for referral →</a></div>
    </div>`; }).join('');
  document.querySelectorAll('[data-rep]').forEach(b => b.onclick = () => report(b));
}

async function report(btn) {
  if (!session) { location.href = 'index.html?join=candidate'; return; }
  const reason = prompt('What is wrong with this opening? (fake, expired, misleading…)');
  if (reason === null) return;
  const { error } = await sb.from('job_reports').insert({ job_id: btn.dataset.rep, reporter_id: session.user.id, reason: reason.trim().slice(0, 300) || null });
  btn.textContent = error ? (/duplicate|unique/i.test(error.message) ? 'Already reported' : 'Try again') : 'Reported ✓';
  if (!error || /duplicate|unique/i.test(error.message)) btn.disabled = true;
}

['jbSearch', 'jbLoc'].forEach(i => $(i).addEventListener('input', draw));
$('jbType').addEventListener('change', draw);
init();
