/* Flyancer — "Roles" section: tabs -> role cards -> live openings + verified experts.
   EDIT THE ROLES BELOW to change what shows. kw = words matched against job titles and expert titles. */
(function () {
  var TABS = [
    { id: 'popular', label: 'Popular' }, { id: 'software', label: 'Software' }, { id: 'product', label: 'Product' },
    { id: 'data', label: 'Data' }, { id: 'ai', label: 'AI & ML' }, { id: 'design', label: 'Design' },
    { id: 'hr', label: 'HR & Recruiting' }, { id: 'growth', label: 'Sales & Marketing' }, { id: 'finance', label: 'Finance' }
  ];
  var C = { g1: ['#2563FF', '#7C3AED'], g2: ['#7C3AED', '#C026D3'], g3: ['#0EA5E9', '#2563FF'], g4: ['#22D3A5', '#2563FF'], g5: ['#F59E0B', '#EF4444'], g6: ['#6366F1', '#22D3A5'] };
  var ROLES = [
    { n: 'Software Engineer', t: 'software', tag: 'Hot', pop: 1, g: 'g1', kw: ['software', 'sde', 'developer'], co: ['Google', 'Microsoft', 'Amazon', 'Atlassian'] },
    { n: 'Backend Engineer', t: 'software', g: 'g3', kw: ['backend', 'back-end', 'java', 'node'], co: ['Amazon', 'Uber', 'Flipkart', 'Oracle'] },
    { n: 'Frontend Engineer', t: 'software', g: 'g2', kw: ['frontend', 'front-end', 'react', 'ui engineer'], co: ['Meta', 'Adobe', 'Airbnb', 'Spotify'] },
    { n: 'Full-Stack Developer', t: 'software', tag: 'Trending', g: 'g6', kw: ['full stack', 'full-stack', 'fullstack'], co: ['Swiggy', 'Zomato', 'Paytm', 'Stripe'] },
    { n: 'DevOps / Cloud Engineer', t: 'software', g: 'g4', kw: ['devops', 'cloud', 'sre', 'platform'], co: ['Amazon', 'Microsoft', 'IBM', 'Cisco'] },
    { n: 'QA / SDET', t: 'software', g: 'g3', kw: ['qa', 'sdet', 'test'], co: ['Infosys', 'TCS', 'Accenture', 'Dell'] },
    { n: 'Product Manager', t: 'product', tag: 'Hot', pop: 1, g: 'g2', kw: ['product manager', 'pm'], co: ['Google', 'Flipkart', 'PhonePe', 'Uber'] },
    { n: 'Associate PM', t: 'product', tag: 'Trending', g: 'g1', kw: ['associate product', 'apm'], co: ['Meta', 'Microsoft', 'Swiggy', 'Paytm'] },
    { n: 'Business Analyst', t: 'product', g: 'g6', kw: ['business analyst'], co: ['Accenture', 'Infosys', 'TCS', 'IBM'] },
    { n: 'Program Manager', t: 'product', g: 'g4', kw: ['program manager', 'project manager', 'delivery'], co: ['Amazon', 'Microsoft', 'Dell', 'Cisco'] },
    { n: 'Data Analyst', t: 'data', tag: 'Trending', pop: 1, g: 'g4', kw: ['data analyst', 'analytics', 'bi '], co: ['Zomato', 'Swiggy', 'Flipkart', 'Salesforce'] },
    { n: 'Data Scientist', t: 'data', tag: 'Hot', g: 'g1', kw: ['data scien'], co: ['Google', 'Amazon', 'Netflix', 'Uber'] },
    { n: 'Data Engineer', t: 'data', g: 'g3', kw: ['data engineer', 'etl', 'big data'], co: ['Microsoft', 'Oracle', 'Spotify', 'Airbnb'] },
    { n: 'ML Engineer', t: 'ai', tag: 'Hot', pop: 1, g: 'g2', kw: ['machine learning', 'ml engineer', 'ml '], co: ['NVIDIA', 'Google', 'Meta', 'Tesla'] },
    { n: 'AI / GenAI Engineer', t: 'ai', tag: 'Hot', g: 'g1', kw: ['ai engineer', 'genai', 'llm', 'ai '], co: ['Microsoft', 'NVIDIA', 'Adobe', 'Salesforce'] },
    { n: 'MLOps Engineer', t: 'ai', g: 'g6', kw: ['mlops', 'ml platform'], co: ['Amazon', 'Uber', 'Spotify', 'Intel'] },
    { n: 'UX Designer', t: 'design', tag: 'Trending', pop: 1, g: 'g2', kw: ['ux', 'user experience', 'ui/ux'], co: ['Adobe', 'Airbnb', 'Google', 'Swiggy'] },
    { n: 'Product Designer', t: 'design', tag: 'Hot', g: 'g1', kw: ['product designer', 'designer'], co: ['Meta', 'Spotify', 'Stripe', 'PhonePe'] },
    { n: 'UX Researcher', t: 'design', g: 'g4', kw: ['researcher', 'research'], co: ['Microsoft', 'Google', 'Apple', 'Atlassian'] },
    { n: 'Talent Acquisition', t: 'hr', tag: 'Hot', pop: 1, g: 'g5', kw: ['talent acquisition', 'recruit', 'ta '], co: ['Accenture', 'Infosys', 'TCS', 'LinkedIn'] },
    { n: 'HR Business Partner', t: 'hr', g: 'g2', kw: ['hrbp', 'hr business', 'human resources', 'hr '], co: ['Amazon', 'Microsoft', 'Dell', 'IBM'] },
    { n: 'HR Generalist', t: 'hr', tag: 'Trending', g: 'g6', kw: ['hr generalist', 'hr executive', 'people ops', 'hr '], co: ['Paytm', 'Flipkart', 'Zomato', 'Swiggy'] },
    { n: 'Sales / BDE', t: 'growth', tag: 'Trending', g: 'g5', kw: ['sales', 'business development', 'bde'], co: ['Salesforce', 'Oracle', 'Zomato', 'Paytm'] },
    { n: 'Digital Marketer', t: 'growth', g: 'g3', kw: ['marketing', 'digital marketing', 'seo'], co: ['Adobe', 'LinkedIn', 'Flipkart', 'Swiggy'] },
    { n: 'Content Marketer', t: 'growth', g: 'g2', kw: ['content', 'copywriter'], co: ['Spotify', 'Netflix', 'Airbnb', 'Stripe'] },
    { n: 'Customer Success', t: 'growth', g: 'g4', kw: ['customer success', 'support'], co: ['Salesforce', 'Atlassian', 'Zoom', 'Cisco'] },
    { n: 'Financial Analyst', t: 'finance', tag: 'Trending', g: 'g1', kw: ['financial analyst', 'finance'], co: ['Amazon', 'Microsoft', 'Accenture', 'Oracle'] },
    { n: 'Investment Banking', t: 'finance', tag: 'Hot', g: 'g5', kw: ['investment bank', 'ibd'], co: ['PayPal', 'Stripe', 'Paytm', 'PhonePe'] },
    { n: 'Risk & Compliance', t: 'finance', g: 'g6', kw: ['risk', 'compliance', 'audit'], co: ['Accenture', 'IBM', 'Infosys', 'TCS'] }
  ];
  var AV = ['m1', 'f1', 'm2', 'f2', 'm3', 'f3', 'm4', 'f4'];
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var rail = $('rlRail'), tabsEl = $('rlTabs'), panel = $('rlPanel'); if (!rail || !tabsEl) return;
  var JT = { full_time: 'Full-time', internship: 'Internship', contract: 'Contract' };
  var tab = 'popular', open = null, JOBS = [], EXP = [], loaded = false;

  function hit(kw, text) { text = String(text || '').toLowerCase(); return kw.some(function (k) { k = k.trim(); return k.length <= 4 ? new RegExp('(^|[^a-z0-9])' + k.replace(/[^a-z0-9]/g, '') + '([^a-z0-9]|$)').test(text) : text.indexOf(k) > -1; }); }
  function jobsFor(r) { return JOBS.filter(function (j) { return hit(r.kw, j.title); }); }
  function expFor(r) {
    var seen = {}, out = [];
    EXP.forEach(function (s) { var p = s.profiles; if (!p || seen[p.username]) return;
      if (hit(r.kw, [p.job_title, s.title].join(' '))) { seen[p.username] = 1; out.push(p); } });
    return out;
  }
  function logo(n) { var p = window.FLY_LOGO && window.FLY_LOGO[n]; return p ? '<span class="rl-co" title="' + esc(n) + '"><svg viewBox="0 0 24 24" aria-label="' + esc(n) + '"><path d="' + p + '"/></svg></span>' : ''; }

  function drawTabs() {
    tabsEl.innerHTML = TABS.map(function (t) { return '<button type="button" role="tab" class="rl-tab' + (t.id === tab ? ' on' : '') + '" data-t="' + t.id + '">' + esc(t.label) + '</button>'; }).join('');
  }
  function drawRail() {
    var list = ROLES.filter(function (r) { return tab === 'popular' ? r.pop : r.t === tab; });
    rail.innerHTML = list.map(function (r, i) {
      var idx = ROLES.indexOf(r), g = C[r.g], jn = loaded ? jobsFor(r).length : null, en = loaded ? expFor(r).length : null;
      var meta = loaded ? '<span>' + jn + ' opening' + (jn === 1 ? '' : 's') + '</span><i></i><span>' + en + ' expert' + (en === 1 ? '' : 's') + '</span>' : '';
      return '<button type="button" class="rl-card' + (open === idx ? ' on' : '') + '" data-i="' + idx + '" style="--a:' + g[0] + ';--b:' + g[1] + '">' +
        (r.tag ? '<span class="rl-tag">' + (r.tag === 'Hot' ? '🔥' : '↗') + ' ' + r.tag + '</span>' : '') +
        '<span class="rl-av">' + (window.flyAvatar ? window.flyAvatar(AV[(idx * 3) % 8], 'rl' + idx, 150) : '') + '</span>' +
        '<span class="rl-info"><span class="rl-name">' + esc(r.n) + '</span><span class="rl-cos">' + r.co.map(logo).join('') + '</span>' +
        (meta ? '<span class="rl-meta">' + meta + '</span>' : '') + '</span></button>';
    }).join('');
    rail.scrollLeft = 0;
    var more = rail.scrollWidth > rail.clientWidth + 4; $('rlPrev').hidden = $('rlNext').hidden = !more;
  }
  function drawPanel() {
    if (open === null) { panel.innerHTML = ''; panel.classList.remove('on'); return; }
    var r = ROLES[open], js = jobsFor(r), ex = expFor(r), q = encodeURIComponent(r.kw[0]);
    var jhtml = !loaded ? '<p class="rl-empty">Loading…</p>' : js.length ? js.slice(0, 4).map(function (j) {
      var p = j.profiles || {}; return '<a class="rl-row" href="profile.html?u=' + esc(p.username) + '&job=' + j.id + '"><span><strong>' + esc(j.title) + '</strong><small>' + esc([j.company, j.location, JT[j.job_type]].filter(Boolean).join(' · ')) + '</small></span><em>Ask for referral →</em></a>';
    }).join('') : '<p class="rl-empty">No openings yet for this role. Verified employees will post here soon.</p>';
    var ehtml = !loaded ? '<p class="rl-empty">Loading…</p>' : ex.length ? ex.slice(0, 4).map(function (p) {
      return '<a class="rl-row" href="profile.html?u=' + esc(p.username) + '"><span class="rl-erow">' + (window.flyAvatar ? window.flyAvatar(p.avatar || p.gender || 'm1', p.username, 38, p.gender) : '') +
        '<span><strong>' + esc(p.full_name) + (p.is_verified ? ' <i class="rl-tick">✓</i>' : '') + '</strong><small>' + esc([p.job_title, p.company].filter(Boolean).join(' · ')) + '</small></span></span><em>View →</em></a>';
    }).join('') : '<p class="rl-empty">No experts for this role yet. <a href="#" onclick="if(window.openLoginPopup){openLoginPopup(event)}else{return true}">Be the first →</a></p>';
    panel.innerHTML = '<div class="rl-ph"><h3>' + esc(r.n) + '</h3><button type="button" class="rl-x" aria-label="Close">✕</button></div>' +
      '<div class="rl-cols"><div><div class="rl-ch"><span>💼 Open roles</span><a href="jobs.html?q=' + q + '">See all</a></div>' + jhtml + '</div>' +
      '<div><div class="rl-ch"><span>🎯 Verified experts</span><a href="explore.html?q=' + q + '">See all</a></div>' + ehtml + '</div></div>';
    panel.classList.add('on');
  }
  tabsEl.addEventListener('click', function (e) { var b = e.target.closest('.rl-tab'); if (!b) return; tab = b.dataset.t; open = null; drawTabs(); drawRail(); drawPanel(); });
  rail.addEventListener('click', function (e) { var c = e.target.closest('.rl-card'); if (!c) return; var i = +c.dataset.i; open = (open === i) ? null : i; drawRail(); drawPanel(); if (open !== null) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  panel.addEventListener('click', function (e) { if (e.target.closest('.rl-x')) { open = null; drawRail(); drawPanel(); } });
  $('rlPrev').onclick = function () { rail.scrollBy({ left: -rail.clientWidth * .8, behavior: 'smooth' }); };
  $('rlNext').onclick = function () { rail.scrollBy({ left: rail.clientWidth * .8, behavior: 'smooth' }); };
  drawTabs(); drawRail();

  // live counts from the database (fails quietly -> cards still work)
  try {
    if (window.supabase && window.FLYANCER_SUPABASE_URL) {
      var sb = window.supabase.createClient(window.FLYANCER_SUPABASE_URL, window.FLYANCER_SUPABASE_ANON_KEY);
      Promise.all([
        sb.from('jobs').select('id,title,company,location,job_type,profiles(username,is_verified)').gt('expires_at', new Date().toISOString()).limit(300),
        sb.from('services').select('title,profiles(full_name,username,company,job_title,gender,avatar,is_verified,role)').limit(300)
      ]).then(function (res) {
        if (res[0].error || res[1].error) return;
        JOBS = (res[0].data || []).filter(function (j) { return j.profiles && j.profiles.is_verified; });
        EXP = (res[1].data || []).filter(function (s) { return s.profiles && s.profiles.role === 'expert'; });
        loaded = true; drawRail(); drawPanel();
      }).catch(function () {});
    }
  } catch (e) {}
})();
