/* Flyancer — Join / Sign in page (passwordless magic link via Supabase) */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var QS = new URLSearchParams(location.search);
  var FREE = ['gmail.com','yahoo.com','yahoo.co.in','hotmail.com','outlook.com','live.com','icloud.com','me.com','aol.com','protonmail.com','rediffmail.com','zoho.com','gmx.com','mail.com'];
  var role = QS.get('role') === 'expert' ? 'expert' : 'candidate';
  var mode = QS.get('mode') === 'signin' ? 'signin' : 'join';
  var sb = window.supabase ? window.supabase.createClient(window.FLYANCER_SUPABASE_URL, window.FLYANCER_SUPABASE_ANON_KEY) : null;

  if (window.flyAvatar) $('jpAvs').innerHTML = ['m1','f2','m3','f4'].map(function (a, i) { return '<span style="--i:' + i + '">' + window.flyAvatar(a, 'jp' + i, 34) + '</span>'; }).join('');

  function paint() {
    var join = mode === 'join';
    $('jpTitle').textContent = join ? 'Join the network' : 'Welcome back';
    $('jpSub').textContent = join ? 'Free to join. We’ll email you a magic link — no password to remember.' : 'Enter your email and we’ll send you a secure link to sign in.';
    $('jpNameWrap').style.display = join ? '' : 'none';
    $('jpRole').style.display = join ? '' : 'none';
    $('jpBtn').textContent = join ? 'Send my magic link →' : 'Email me a sign-in link →';
    $('jpSwitch').innerHTML = join ? 'Already have an account? <a href="#" id="jpToggle">Sign in</a>' : 'New here? <a href="#" id="jpToggle">Join the network</a>';
    $('jpToggle').onclick = function (e) { e.preventDefault(); mode = join ? 'signin' : 'join'; msg(''); paint(); };
    document.querySelectorAll('#jpRole button').forEach(function (b) { b.classList.toggle('on', b.dataset.role === role); });
    $('jpEmail').placeholder = join && role === 'expert' ? 'you@yourcompany.com' : 'you@email.com';
    $('jpEmailHint').textContent = join && role === 'expert' ? '(company email only)' : '*';
    document.title = (join ? 'Join the network' : 'Sign in') + ' – Flyancer';
  }
  function msg(t, err) { var m = $('jpMsg'); m.textContent = t; m.className = 'jp-msg' + (err ? ' err' : ''); }

  $('jpRole').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; role = b.dataset.role; msg(''); paint(); });
  $('jpAgain').onclick = function (e) { e.preventDefault(); $('jpDone').hidden = true; $('jpForm').hidden = false; $('jpEmail').focus(); };

  $('jpFormEl').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!sb) { msg('Could not connect. Please refresh and try again.', true); return; }
    var email = $('jpEmail').value.trim().toLowerCase(), name = $('jpName').value.trim(), join = mode === 'join';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg('Please enter a valid email address.', true); return; }
    if (join && !name) { msg('Please tell us your name.', true); return; }
    if (join && role === 'expert' && FREE.indexOf(email.split('@')[1]) > -1) {
      msg('Experts must use an official company email — personal addresses (Gmail, Yahoo, etc.) aren’t accepted.', true); return; }
    var btn = $('jpBtn'); btn.disabled = true; msg('Sending your link…');
    var opts = { emailRedirectTo: location.origin + '/onboarding.html' };
    if (join) opts.data = { full_name: name, role: role };
    var r = await sb.auth.signInWithOtp({ email: email, options: opts });
    btn.disabled = false;
    if (r.error) { msg('Something went wrong: ' + r.error.message, true); return; }
    $('jpSent').textContent = email; $('jpForm').hidden = true; $('jpDone').hidden = false;
  });

  paint();
  if (sb) sb.auth.getSession().then(function (r) { if (r.data && r.data.session) location.replace('dashboard.html'); });
})();
