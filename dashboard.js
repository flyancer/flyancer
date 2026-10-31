/* Flyancer — dashboard: edit profile, manage services (experts), see requests */
const sb = window.supabase.createClient(window.FLYANCER_SUPABASE_URL, window.FLYANCER_SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TYPES = Object.fromEntries(window.FLY_CATS.map(c => [c.k, c.label]));
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
    <div style="display:flex;align-items:center;gap:14px;margin-top:6px">
      <h1 class="pf-h" style="margin:0">Hi ${esc(me.full_name.split(' ')[0])} 👋 ${me.is_verified ? '<span class="pf-badge">✓ Verified</span>' : ''}</h1></div>
    <p style="color:var(--muted)">Your page: <a style="color:var(--blue2)" href="profile.html?u=${esc(me.username)}">flyancer.com/${esc(me.username)}</a></p>

    <div class="pf-h-row"><h2 class="pf-h">Your profile</h2><button class="pf-btn ghost" id="editProf" type="button">✎ Edit profile</button></div>
    <div class="pf-sum">
      ${(me.avatar || me.gender) ? window.flyAvatar(me.avatar || me.gender, me.username, 64, me.gender) : ''}
      <div style="min-width:0">
        <div style="font:700 1.1rem var(--font-display)">${esc(me.full_name)}</div>
        ${isExpert ? `<div style="color:rgba(240,244,255,.8);font-size:14px">${me.job_title || me.company ? esc([me.job_title, me.company].filter(Boolean).join(' · ')) : '<span class="pf-dim">Add your company and job title</span>'}</div>` : ''}
        <div class="pf-sum-bio">${me.bio ? esc(me.bio) : '<span class="pf-dim">Add a short bio so people know who you are.</span>'}</div>
      </div>
    </div>
    <div class="pf-modal" id="profModal"><form class="pf-form wide pf-wide2" id="profForm">
      <div class="pf-mh"><h3>Edit profile</h3><button type="button" class="pf-x" data-close aria-label="Close">✕</button></div>
      <div class="pf-cols">
        <div class="pf-col">
          <label>Full name<input id="pName" required value="${esc(me.full_name)}"></label>
          ${isExpert ? `<label>Company<input id="pCompany" value="${esc(me.company)}"></label><label>Job title<input id="pTitle" value="${esc(me.job_title)}"></label>` : ''}
          <label>Bio<textarea id="pBio" rows="3">${esc(me.bio)}</textarea></label>
        </div>
        <div class="pf-col">
          <span class="pf-lbl">Choose your avatar</span>
          <div class="ob-avatars ob-av8" id="pAvatars">${window.FLY_AVATARS.map(id => `<button type="button" class="ob-av ${window.flyAvatarId(me.avatar, me.gender, me.username) === id ? 'on' : ''}" data-a="${id}">${window.flyAvatar(id, id, 56)}</button>`).join('')}</div>
        </div>
      </div>
      <div><span class="pf-err" id="profMsg"></span></div>
      <div><button class="pf-btn" type="submit">Save profile</button></div>
    </form></div>

    ${isExpert ? `
    <div class="pf-h-row"><h2 class="pf-h">Your services</h2><button class="pf-btn" id="addSvc" type="button">+ Add a service</button></div>
    <div id="svcList"></div>
    <div class="pf-modal" id="svcModal"><form class="pf-form wide pf-wide2" id="svcForm">
      <div class="pf-mh"><h3>Add a service</h3><button type="button" class="pf-x" data-close aria-label="Close">✕</button></div>
      <div class="pf-cols">
        <div class="pf-col"><span class="pf-lbl">Start from a category</span>
      <div class="cat-tiles" id="catTiles">${window.FLY_CATS.map(c => `<button type="button" class="cat-tile" data-k="${c.k}"><span>${c.icon} ${c.label}</span><small>${c.blurb}</small></button>`).join('')}</div>
        </div>
        <div class="pf-col">
      <div class="pf-row">
        <label>Type<select id="sType">${Object.entries(TYPES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
        <label>Price (₹)<input id="sPrice" type="number" min="1" step="1" required placeholder="e.g. 499"></label>
      </div>
      <label>Topic<select id="sTopic" required><option value="">Choose a topic…</option>${(window.FLY_TOPICS||[]).map(t => `<option value="${t.id}">${t.label}</option>`).join('')}</select></label>
      <label>Title<input id="sTitle" required maxlength="80" placeholder="e.g. 30-min mock interview for SDE roles"></label>
      <label>Description<textarea id="sDesc" rows="3" maxlength="500" placeholder="What will the candidate get? How will you run the session?"></textarea></label>
        </div>
      </div>
      <div class="pf-err" id="svcMsg"></div>
      <div><button class="pf-btn" type="submit">Add service</button></div>
    </form></div>` : ''}

    ${isExpert ? `
    <div class="pf-h-row"><h2 class="pf-h">Your job openings</h2><button class="pf-btn" id="addJob" type="button">+ Post a job</button></div>
    <p class="pf-dim" style="margin:-6px 0 12px;font-size:13px">Share openings at ${esc(me.company || 'your company')} (up to 5 live, each stays up for 30 days). Candidates can then ask you for a referral.</p>
    <div id="jobList"></div>
    <div class="pf-modal" id="jobModal"><form class="pf-form" id="jobForm">
      <div class="pf-mh"><h3>Post a job opening</h3><button type="button" class="pf-x" data-close aria-label="Close">✕</button></div>
      <label>Job title<input id="jTitle" required maxlength="100" placeholder="e.g. Software Engineer II"></label>
      <div class="pf-row">
        <label>Location<input id="jLoc" maxlength="80" placeholder="e.g. Bengaluru / Remote"></label>
        <label>Type<select id="jType"><option value="full_time">Full-time</option><option value="internship">Internship</option><option value="contract">Contract</option></select></label>
      </div>
      <label>Official job link (optional)<input id="jUrl" type="url" placeholder="https://careers.company.com/…"></label>
      <label>Short description<textarea id="jDesc" rows="3" maxlength="1000" placeholder="Skills needed, experience, team…"></textarea></label>
      <p class="pf-dim" style="font-size:12px">This is your personal referral opening, not an official posting by ${esc(me.company || 'your company')}. Only post roles you can genuinely refer for.</p>
      <div class="pf-err" id="jobMsg"></div>
      <div><button class="pf-btn" type="submit">Post job</button></div>
    </form></div>` : ''}

    ${isExpert ? '' : `<div class="pf-hero" style="margin-top:22px;padding:24px"><div><h2 style="font:800 1.3rem var(--font-display)">Find an expert</h2><p style="color:rgba(240,244,255,.8);margin:6px 0 14px">Resume review, mock interviews, referrals and more — from people at real companies.</p><a class="pf-btn" href="explore.html">Browse experts →</a></div></div>`}
    <h2 class="pf-h">${isExpert ? 'Requests from candidates' : 'Your requests'}</h2>
    <div id="reqList"><div class="pf-empty">Loading…</div></div>`;

  window.__a = window.flyAvatarId(me.avatar, me.gender, me.username);
  document.querySelectorAll('#pAvatars .ob-av').forEach(b => b.addEventListener('click', () => {
    window.__a = b.dataset.a;
    document.querySelectorAll('#pAvatars .ob-av').forEach(x => x.classList.toggle('on', x === b));
  }));
  const openM = (id) => $(id).classList.add('open');
  document.querySelectorAll('.pf-modal').forEach(m => {
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) m.classList.remove('open'); });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.pf-modal.open').forEach(m => m.classList.remove('open')); });
  $('editProf').onclick = () => openM('profModal');
  if (isExpert) $('addJob').onclick = () => { $('jobMsg').textContent = ''; if (!me.is_verified) { alert('Jobs can be posted once your work email is verified.'); return; } openM('jobModal'); };
  if (isExpert) $('addSvc').onclick = () => { $('svcMsg').textContent = ''; openM('svcModal'); };
  $('profForm').addEventListener('submit', saveProfile);
  if (isExpert) { $('jobForm').addEventListener('submit', addJob); loadJobs(); }
  if (isExpert) { $('svcForm').addEventListener('submit', addService);
    $('catTiles').querySelectorAll('.cat-tile').forEach(t => t.onclick = () => {
      const c = window.FLY_CAT[t.dataset.k];
      $('catTiles').querySelectorAll('.cat-tile').forEach(x => x.classList.toggle('on', x === t));
      $('sType').value = c.k;
      if (!$('sTitle').value || $('sTitle').dataset.auto) { $('sTitle').value = c.sugTitle; $('sTitle').dataset.auto = '1'; }
      if (!$('sDesc').value || $('sDesc').dataset.auto) { $('sDesc').value = c.sugDesc; $('sDesc').dataset.auto = '1'; }
      if (!$('sPrice').value || $('sPrice').dataset.auto) { $('sPrice').value = c.sugPrice; $('sPrice').dataset.auto = '1'; }
    });
    ['sTitle','sDesc','sPrice'].forEach(i => $(i).addEventListener('input', () => { delete $(i).dataset.auto; })); loadServices(); }
  loadRequests();
}

async function saveProfile(e) {
  e.preventDefault();
  const upd = { full_name: $('pName').value.trim(), bio: $('pBio').value.trim() || null, avatar: window.__a, gender: window.__a.charAt(0) === 'f' ? 'female' : 'male' };
  if (me.role === 'expert') { upd.company = $('pCompany').value.trim() || null; upd.job_title = $('pTitle').value.trim() || null; }
  const { error } = await sb.from('profiles').update(upd).eq('id', me.id);
  const m = $('profMsg');
  m.className = error ? 'pf-err' : 'pf-ok';
  m.textContent = error ? error.message : 'Saved ✓';
  if (!error) { Object.assign(me, upd); render(); }
}

async function loadServices() {
  const { data } = await sb.from('services').select('*').eq('profile_id', me.id).order('created_at');
  const box = $('svcList');
  if (!data || !data.length) { box.innerHTML = '<div class="pf-empty">No services yet — click “+ Add a service” to create your first one.</div>'; return; }
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
    profile_id: me.id, service_type: $('sType').value, topic: $('sTopic').value || null,
    title: $('sTitle').value.trim(), description: $('sDesc').value.trim() || null, price_inr: price
  });
  if (error) { m.textContent = error.message; return; }
  $('svcForm').reset(); $('svcModal').classList.remove('open');
  loadServices();
}

const JT = { full_time: 'Full-time', internship: 'Internship', contract: 'Contract' };
async function loadJobs() {
  const { data } = await sb.from('jobs').select('*').eq('profile_id', me.id).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false });
  const box = $('jobList');
  if (!data || !data.length) { box.innerHTML = '<div class="pf-empty">No openings posted yet — click “+ Post a job”.</div>'; return; }
  box.innerHTML = data.map(j => {
    const days = Math.max(0, Math.ceil((new Date(j.expires_at) - Date.now()) / 864e5));
    return `<div class="pf-svc-row"><div><h4>${esc(j.title)}</h4><small>${esc([j.company, j.location, JT[j.job_type]].filter(Boolean).join(' · '))} · expires in ${days} day${days === 1 ? '' : 's'}</small></div>
    <button class="pf-btn danger" data-jdel="${j.id}">Delete</button></div>`; }).join('');
  box.querySelectorAll('[data-jdel]').forEach(b => b.onclick = async () => {
    if (!confirm('Delete this opening?')) return;
    await sb.from('jobs').delete().eq('id', b.dataset.jdel); loadJobs();
  });
}
async function addJob(e) {
  e.preventDefault();
  const m = $('jobMsg'); m.className = 'pf-err'; m.textContent = '';
  const { error } = await sb.from('jobs').insert({
    profile_id: me.id, title: $('jTitle').value.trim(), location: $('jLoc').value.trim() || null,
    job_type: $('jType').value, job_url: $('jUrl').value.trim() || null, description: $('jDesc').value.trim() || null });
  if (error) { m.textContent = error.message.replace(/^.*?exception:?\s*/i, ''); return; }
  $('jobForm').reset(); $('jobModal').classList.remove('open'); loadJobs();
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
