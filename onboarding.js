/* ═══════════════════════════════════════════
   FLYANCER — onboarding.js
   Handles the post-login "create your profile" flow.
   ═══════════════════════════════════════════ */

const sb = window.supabase.createClient(window.FLYANCER_SUPABASE_URL, window.FLYANCER_SUPABASE_ANON_KEY);

// Same list used in the login popup — kept in sync manually for now.
// TODO: move this check server-side (Postgres trigger) before real launch.
const FREE_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.co.in', 'hotmail.com', 'outlook.com',
  'live.com', 'icloud.com', 'me.com', 'aol.com', 'protonmail.com',
  'rediffmail.com', 'zoho.com', 'gmx.com', 'mail.com'
];

const RESERVED = ['about','admin','login','logout','signup','dashboard','profile','onboarding','expert','experts','candidate','candidates','index','assets','api','support','help','terms','privacy','refund','contact','pricing','blog','flyancer','settings','static','www','mail','robots','sitemap','status','null','undefined','home','search','book','booking'];
let currentAvatar = 'm1';

const el = (id) => document.getElementById(id);
const states = ['obLoading', 'obInvalid', 'obExisting', 'obForm', 'obSuccess'];
function showState(id) {
  states.forEach(s => {
    const node = el(s);
    if (!node) return;
    node.style.display = (s === id) ? (s === 'obForm' ? 'block' : 'flex') : 'none';
  });
}

function slugifyUsername(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 20);
}

function suggestUsernames(base) {
  const clean = slugifyUsername(base) || 'flyancer';
  const suffixes = [
    Math.floor(10 + Math.random() * 89),
    Math.floor(10 + Math.random() * 89),
    '_' + Math.floor(1 + Math.random() * 9)
  ];
  return suffixes.map(s => (clean.slice(0, 17) + s).slice(0, 20));
}

let currentUser = null;
let currentRole = 'candidate';
let currentDomain = '';

async function init() {
  // supabase-js auto-parses the magic link tokens from the URL on load
  const { data: { session } } = await sb.auth.getSession();

  if (!session) {
    showState('obInvalid');
    return;
  }

  currentUser = session.user;
  currentRole = currentUser.user_metadata?.role === 'expert' ? 'expert' : 'candidate';
  currentDomain = (currentUser.email || '').split('@')[1] || '';

  // Already have a profile? Skip straight to "welcome back"
  const { data: existingProfile } = await sb
    .from('profiles')
    .select('username')
    .eq('id', currentUser.id)
    .maybeSingle();

  if (existingProfile) {
    el('obExistingText').textContent = `You're already set up as @${existingProfile.username}.`;
    showState('obExisting');
    return;
  }

  // avatar picker (8 characters)
  el('obAvatars').innerHTML = window.FLY_AVATARS.map(id =>
    '<button type="button" class="ob-av" data-a="' + id + '" aria-label="Avatar ' + id + '">' + window.flyAvatar(id, id, 56) + '</button>').join('');
  const pick = (a) => { currentAvatar = a; el('obAvatars').querySelectorAll('.ob-av').forEach(b => b.classList.toggle('on', b.dataset.a === a)); };
  el('obAvatars').querySelectorAll('.ob-av').forEach(b => b.addEventListener('click', () => pick(b.dataset.a)));
  pick('m1');

  await populateForm();
  showState('obForm');
}

async function populateForm() {
  el('obEmailLine').textContent = `Signed in as ${currentUser.email}`;
  el('obFullName').value = currentUser.user_metadata?.full_name || '';

  // Suggest a starting username from their name — most people won't need to type one at all
  const nameForSlug = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
  el('obUsername').value = slugifyUsername(nameForSlug);

  if (currentRole === 'expert') {
    el('obRoleLabel').textContent = 'Create Your Flyancer Profile';
    el('obCompanyBlock').style.display = 'block';

    // Auto-detect company name from the verified email domain
    const { data: companyRow } = await sb
      .from('companies')
      .select('name')
      .eq('domain', currentDomain)
      .maybeSingle();

    el('obCompany').value = companyRow ? companyRow.name : '';
    el('obVerifiedHint').textContent = `✓ Verified @${currentDomain}`;
  } else {
    el('obRoleLabel').textContent = 'Create Your Candidate Profile';
  }
}

// Sanitize as they type instead of rejecting on submit — invalid characters
// just quietly don't appear, so there's nothing to "get wrong"
el('obUsername').addEventListener('input', () => {
  const cleaned = slugifyUsername(el('obUsername').value);
  if (cleaned !== el('obUsername').value) el('obUsername').value = cleaned;
  el('obSuggestions').style.display = 'none';
});

function showSuggestions(base) {
  const box = el('obSuggestions');
  const options = suggestUsernames(base);
  box.innerHTML = '<span class="onboard-suggest-label">That one\'s taken — try:</span>' +
    options.map(u => `<button type="button" class="onboard-suggest-chip">${u}</button>`).join('');
  box.style.display = 'flex';
  box.querySelectorAll('.onboard-suggest-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      el('obUsername').value = chip.textContent;
      box.style.display = 'none';
      el('obFormError').textContent = '';
    });
  });
}

el('obForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = el('obFormError');
  errorEl.textContent = '';
  el('obSuggestions').style.display = 'none';

  const username = slugifyUsername(el('obUsername').value.trim());
  const fullName = el('obFullName').value.trim();
  const bio = el('obBio').value.trim();
  const company = currentRole === 'expert' ? el('obCompany').value.trim() : null;
  const jobTitle = currentRole === 'expert' ? el('obJobTitle').value.trim() : null;

  if (username.length < 3) {
    errorEl.textContent = 'Just a couple more characters for your username (letters, numbers, or _).';
    return;
  }
  if (RESERVED.includes(username)) {
    errorEl.textContent = 'That name is reserved by Flyancer — please pick another.';
    return;
  }
  if (!fullName) {
    errorEl.textContent = 'Please enter your full name.';
    return;
  }

  const submitBtn = el('obSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Checking username…';

  // Uniqueness check
  const { data: taken } = await sb
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (taken) {
    errorEl.textContent = '';
    showSuggestions(username);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create My Profile →';
    return;
  }

  submitBtn.textContent = 'Creating your profile…';

  const isVerified = currentRole === 'expert' && !FREE_DOMAINS.includes(currentDomain);

  const { error } = await sb.from('profiles').insert({
    id: currentUser.id,
    username,
    role: currentRole,
    full_name: fullName,
    company: company || null,
    job_title: jobTitle || null,
    bio: bio || null,
    avatar: currentAvatar,
    gender: currentAvatar.charAt(0) === 'f' ? 'female' : 'male',
    is_verified: isVerified,
    verified_domain: isVerified ? currentDomain : null,
    verified_at: isVerified ? new Date().toISOString() : null
  });

  if (error) {
    errorEl.textContent = 'Something went wrong: ' + error.message;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create My Profile →';
    return;
  }

  el('obSuccessUsername').textContent = '@' + username;
  showState('obSuccess');
});

init();
