/* Flyancer — dashboard: edit profile, manage services (experts), see requests */
const sb = window.supabase.createClient(window.FLYANCER_SUPABASE_URL, window.FLYANCER_SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TYPES = { referral:'Referral', mock_interview:'Mock interview', coaching:'Coaching', resume_review:'Resume review' };
let me = null;

$('logoutBtn').onclick = async () => { await sb.auth.signOut(); location.href = 'index.html'; };

async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    $('app').innerHTML = '<div class="pf-msg"><h2>Please log in</h2><p>Use the “Free Username” button on the home page to get a magic login link.</p><br><a class="pf-btn" href="index.html">Go to Flyancer</a></div>';
    $('logoutBtn').style.display = 'none'; return;
  }
  const { data: p } = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  if (!p) { location.href = 'onboarding.html'; return; }
  me = p;
  $('viewPublic').href = 'profile.html?u=' + p.username;
  render();
}

async function render() {
  const isExpert = me.role === 'expert';
  $('app').innerHTML = `
    <h1 class="pf-h" style="margin-top:6px">Hi ${esc(me.full_name.split(' ')[0])} 👋 ${me.is_verified ? '<span class="pf-badge">✓ Verified</span>' : ''}</h1>
    <p style="color:var(--muted)">Your page: <a style="color:var(--blue2)" href="profile.html?u=${esc(me.username)}">flyancer.com/@${esc(me.username)}</a></p>

    <h2 class="pf-h">Your profile</h2>
    <form class="pf-form" id="profForm">
      <label>Full name<input id="pName" required value="${esc(me.full_name)}"></label>
      ${isExpert ? `<div class="pf-row"><label>Company<input id="pCompany" value="${esc(me.company)}"></label><label>Job title<input id="pTitle" value="${esc(me.job_title)}"></label></div>` : ''}
      <label>Bio<textarea id="pBio" rows="3">${esc(me.bio)}</textarea></label>
      <div><span class="pf-err" id="profMsg"></span></div>
      <div><button class="pf-btn" type="submit">Save profile</button></div>
    </form>

    ${isExpert ? `
    <h2 class="pf-h">Your services</h2>
    <div id="svcList"></div>
    <form class="pf-form" id="svcForm" style="margin-top:14px">
      <h3 style="font:700 1rem var(--font-display)">Add a service</h3>
      <div class="pf-row">
        <label>Type<select id="sType">${Object.entries(TYPES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
        <label>Price (₹)<input id="sPrice" type="number" min="1" step="1" required placeholder="e.g. 499"></label>
      </div>
      <label>Title<input id="sTitle" required maxlength="80" placeholder="e.g. 30-min mock interview for SDE roles"></label>
      <label>Description<textarea id="sDesc" rows="3" maxlength="500" placeholder="What will the candidate get? How will you run the session?"></textarea></label>
      <div class="pf-err" id="svcMsg"></div>
      <div><button class="pf-btn" type="submit">Add service</button></div>
    </form>` : ''}

    <h2 class="pf-h">${isExpert ? 'Requests from candidates' : 'Your requests'}</h2>
    <div id="reqList"><div class="pf-empty">Loading…</div></div>`;

  $('profForm').addEventListener('submit', saveProfile);
  if (isExpert) { $('svcForm').addEventListener('submit', addService); loadServices(); }
  loadRequests();
}

async function saveProfile(e) {
  e.preventDefault();
  const upd = { full_name: $('pName').value.trim(), bio: $('pBio').value.trim() || null };
  if (me.role === 'expert') { upd.company = $('pCompany').value.trim() || null; upd.job_title = $('pTitle').value.trim() || null; }
  const { error } = await sb.from('profiles').update(upd).eq('id', me.id);
  const m = $('profMsg');
  m.className = error ? 'pf-err' : 'pf-ok';
  m.textContent = error ? error.message : 'Saved ✓';
  if (!error) Object.assign(me, upd);
}

async function loadServices() {
  const { data } = await sb.from('services').select('*').eq('profile_id', me.id).order('created_at');
  const box = $('svcList');
  if (!data || !data.length) { box.innerHTML = '<div class="pf-empty">No services yet — add your first one below.</div>'; return; }
  box.innerHTML = data.map(s => `
    <div class="pf-svc-row"><div><h4>${esc(s.title)}</h4><small>${esc(TYPES[s.service_type])} · ₹${Number(s.price_inr).toLocaleString('en-IN')}</small></div>
    <button class="pf-btn danger" data-del="${s.id}">Delete</button></div>`).join('');
  box.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (!confirm('Delete this service?')) return;
    await sb.from('services').delete().eq('id', b.dataset.del);
    loadServices();
  });
}

async function addService(e) {
  e.preventDefault();
  const m = $('svcMsg'); m.className = 'pf-err'; m.textContent = '';
  const price = parseInt($('sPrice').value, 10);
  if (!(price > 0)) { m.textContent = 'Enter a price above ₹0.'; return; }
  const { error } = await sb.from('services').insert({
    profile_id: me.id, service_type: $('sType').value,
    title: $('sTitle').value.trim(), description: $('sDesc').value.trim() || null, price_inr: price
  });
  if (error) { m.textContent = error.message; return; }
  $('svcForm').reset(); m.className = 'pf-ok'; m.textContent = 'Service added ✓';
  loadServices();
}

async function loadRequests() {
  const col = me.role === 'expert' ? 'expert_id' : 'candidate_id';
  const other = me.role === 'expert' ? 'candidate_id' : 'expert_id';
  const { data: rows } = await sb.from('bookings').select('*').eq(col, me.id).order('created_at', { ascending: false });
  const box = $('reqList');
  if (!rows || !rows.length) { box.innerHTML = '<div class="pf-empty">Nothing here yet.</div>'; return; }
  const ids = [...new Set(rows.map(r => r[other]))], sids = [...new Set(rows.map(r => r.service_id))];
  const [{ data: ps }, { data: ss }] = await Promise.all([
    sb.from('profiles').select('id,full_name,username').in('id', ids),
    sb.from('services').select('id,title,price_inr').in('id', sids)]);
  const P = Object.fromEntries((ps || []).map(x => [x.id, x])), S = Object.fromEntries((ss || []).map(x => [x.id, x]));
  box.innerHTML = rows.map(r => `
    <div class="pf-req"><div style="min-width:0">
      <strong>${esc(S[r.service_id]?.title || 'Service')}</strong> · ₹${Number(S[r.service_id]?.price_inr || 0).toLocaleString('en-IN')}<br>
      <small style="color:var(--muted)">${me.role === 'expert' ? 'From' : 'To'} ${esc(P[r[other]]?.full_name || 'user')}</small>
      ${r.message ? `<p style="margin-top:6px;color:rgba(240,244,255,.8);font-size:14px">${esc(r.message)}</p>` : ''}
      ${r.job_url ? `<a style="color:var(--blue2);font-size:13px" target="_blank" rel="noopener noreferrer" href="${esc(r.job_url)}">Job link</a> ` : ''}
      ${r.resume_url ? `<a style="color:var(--blue2);font-size:13px" target="_blank" rel="noopener noreferrer" href="${esc(r.resume_url)}">Resume</a>` : ''}
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end"><span class="pf-status ${r.status}">${r.status}</span>
    ${me.role === 'expert' && r.status === 'pending' ? `<div style="display:flex;gap:8px"><button class="pf-btn" data-st="accepted" data-id="${r.id}">Accept</button><button class="pf-btn danger" data-st="declined" data-id="${r.id}">Decline</button></div>` : ''}
    ${me.role === 'expert' && r.status === 'accepted' ? `<button class="pf-btn ghost" data-st="completed" data-id="${r.id}">Mark completed</button>` : ''}
    </div></div>`).join('');
  box.querySelectorAll('[data-st]').forEach(b => b.onclick = async () => {
    await sb.from('bookings').update({ status: b.dataset.st }).eq('id', b.dataset.id);
    loadRequests();
  });
}

init();
