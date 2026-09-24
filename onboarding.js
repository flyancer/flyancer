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

const el = (id) => document.getElementById(id);
const states = ['obLoading', 'obInvalid', 'obExisting', 'obForm', 'obSuccess'];
function showState(id) {
  states.forEach(s => {
    const node = el(s);
    if (!node) return;
    node.style.display = (s === id) ? (s === 'obForm' ? 'block' : 'flex') : 'none';
  });
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

  await populateForm();
  showState('obForm');
}

async function populateForm() {
  el('obEmailLine').textContent = `Signed in as ${currentUser.email}`;
  el('obFullName').value = currentUser.user_metadata?.full_name || '';

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

el('obForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = el('obFormError');
  errorEl.textContent = '';

  const username = el('obUsername').value.trim().toLowerCase();
  const fullName = el('obFullName').value.trim();
  const bio = el('obBio').value.trim();
  const company = currentRole === 'expert' ? el('obCompany').value.trim() : null;
  const jobTitle = currentRole === 'expert' ? el('obJobTitle').value.trim() : null;

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    errorEl.textContent = 'Username must be 3–20 characters: lowercase letters, numbers, underscores only.';
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
    errorEl.textContent = 'That username is already taken — try another.';
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
