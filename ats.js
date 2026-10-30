/* Flyancer — Free Resume Match Check. Runs fully in the browser; nothing is uploaded. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  var STOP = ('a about above after again all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its just me more most my no nor not now of off on once only or other our ours out over own same she should so some such than that the their them then there these they this those through to too under until up us very was we were what when where which while who whom why will with would you your yours ' +
    'ability able across amongst along already always among around become best better come day etc every get give good great help include including join looking make may must need new one part per plus preferred required role roles strong take using via well within work working years year experience experienced candidate candidates responsibilities responsibility requirement requirements qualifications qualification job position company team teams people skills skill knowledge understanding ensure support will like highly related relevant excellent proven hands-on opportunity organisation organization define build write large clear hiring hire create develop provide perform maintain drive deliver collaborate collaborate want use used uses based level high low key type types field areas area ideal impact meaningful fast growing seeking looking day-to-day daily full-time part-time').split(' ');
  var STOPSET = {}; STOP.forEach(function (w) { STOPSET[w] = 1; });

  var SYN = { js: 'javascript', ts: 'typescript', ml: 'machine learning', ai: 'artificial intelligence', nlp: 'natural language processing', 'node.js': 'nodejs', 'node js': 'nodejs', 'react.js': 'react', 'reactjs': 'react', 'vue.js': 'vue', 'postgres': 'postgresql', 'k8s': 'kubernetes', 'power bi': 'powerbi', 'ms excel': 'excel', 'microsoft excel': 'excel', 'ci/cd': 'cicd', 'c++': 'cpp', 'c#': 'csharp', '.net': 'dotnet' };

  var SURF = {}, RECORD = false;
  function stem(w) {
    if (w.length <= 4 || /(ss|is|us)$/.test(w) || !/s$/.test(w)) return w;
    var s = /ies$/.test(w) ? w.slice(0, -3) + 'y' : w.slice(0, -1);
    if (RECORD && !SURF[s]) SURF[s] = w;
    return s;
  }
  function surface(term) { return term.split(' ').map(function (x) { return SURF[x] || x; }).join(' '); }
  function norm(t) {
    t = ' ' + String(t).toLowerCase().replace(/[‘’]/g, "'").replace(/[–—]/g, '-') + ' ';
    Object.keys(SYN).forEach(function (k) {
      var re = new RegExp('(^|[^a-z0-9])' + k.replace(/[.+*?^${}()|[\]\\\/]/g, '\\$&') + '(?![a-z0-9])', 'g');
      t = t.replace(re, '$1 ' + SYN[k] + ' ');
    });
    return t.replace(/[^a-z0-9+#\s-]/g, ' ').replace(/\s+/g, ' ').split(' ').map(stem).join(' ');
  }
  function tokens(t) { return norm(t).trim().split(' ').filter(Boolean); }
  function isWord(w) { return w.length > 1 && !STOPSET[w] && !/^\d+$/.test(w); }

  // A small, generic list of well-known skills/tools — boosts their weight when found in the JD.
  var KNOWN = ('python java javascript typescript sql excel powerbi tableau react angular vue nodejs html css aws azure gcp docker kubernetes git linux api rest graphql mongodb postgresql mysql redis kafka spark hadoop airflow pandas numpy tensorflow pytorch scikit-learn "machine learning" "data analysis" "data science" "natural language processing" "artificial intelligence" agile scrum jira figma photoshop seo sem analytics crm salesforce hubspot sap erp tally gst accounting audit taxation finance budgeting forecasting recruitment sourcing onboarding payroll hris "talent acquisition" "stakeholder management" "project management" "product management" roadmap "a/b testing" "user research" wireframing prototyping copywriting "content marketing" "social media" "email marketing" negotiation sales "lead generation" "customer success" operations "supply chain" compliance risk cicd testing selenium automation microservices "system design" cpp csharp dotnet go rust swift kotlin android ios flutter').match(/"[^"]+"|\S+/g).map(function (s) { return s.replace(/"/g, ''); });
  var KNOWNSET = {}; KNOWN.forEach(function (k) { KNOWNSET[k.split(' ').map(stem).join(' ')] = 1; });

  function extractKeywords(jd) {
    var tk = tokens(jd), freq = {};
    var add = function (term, w) { freq[term] = (freq[term] || 0) + w; };
    for (var i = 0; i < tk.length; i++) {
      if (isWord(tk[i])) add(tk[i], 1);
      if (i + 1 < tk.length && isWord(tk[i]) && isWord(tk[i + 1])) add(tk[i] + ' ' + tk[i + 1], 1.2);
    }
    var list = Object.keys(freq).map(function (t) {
      var known = KNOWNSET[t] ? 2.5 : 1;
      var isBi = t.indexOf(' ') > -1;
      return { term: t, w: freq[t] * known, bi: isBi, known: !!KNOWNSET[t] };
    }).filter(function (k) { return k.known || k.w >= 2 || (!k.bi && k.w >= 1 && k.term.length > 3); });
    // drop single words that only appear as part of a kept phrase with equal weight
    list.sort(function (a, b) { return b.w - a.w || b.term.length - a.term.length; });
    var picked = [], seen = {};
    list.forEach(function (k) {
      if (picked.length >= 30) return;
      if (!k.bi && picked.some(function (p) { return p.bi && (' ' + p.term + ' ').indexOf(' ' + k.term + ' ') > -1 && p.w >= k.w * 0.8; })) return;
      if (seen[k.term]) return; seen[k.term] = 1; picked.push(k);
    });
    return picked;
  }

  function has(text, term) {
    var re = new RegExp('(^|[^a-z0-9])' + term.replace(/[.+*?^${}()|[\]\\\/]/g, '\\$&') + '(?![a-z0-9])');
    return re.test(text);
  }

  function analyse(jd, resume) {
    RECORD = true; SURF = {}; var kws = extractKeywords(jd); RECORD = false; var rn = norm(resume), matched = [], missing = [], tw = 0, mw = 0;
    kws.forEach(function (k) { k.label = surface(k.term); tw += k.w; if (has(rn, k.term)) { matched.push(k); mw += k.w; } else missing.push(k); });
    var cov = tw ? mw / tw : 0;

    var raw = String(resume), low = raw.toLowerCase(), words = (raw.match(/\S+/g) || []).length;
    var checks = [];
    var chk = function (ok, good, bad, pts) { checks.push({ ok: ok, text: ok ? good : bad, pts: pts }); };
    chk(/[\w.+-]+@[\w-]+\.[\w.]+/.test(raw), 'Email address found', 'Add a clear email address near the top', 4);
    chk(/(\+?\d[\d\s-]{8,}\d)/.test(raw), 'Phone number found', 'Add a phone number near the top', 3);
    chk(/\b(experience|employment|work history|internship)/.test(low), 'Experience section found', 'Add a clear “Experience” section', 4);
    chk(/\b(education|academic|degree|b\.?tech|b\.?e\b|mba|b\.?com|b\.?sc|m\.?tech|university|college)/.test(low), 'Education section found', 'Add a clear “Education” section', 3);
    chk(/\bskills?\b|technical skills|core competencies/.test(low), 'Skills section found', 'Add a “Skills” section listing tools and technologies', 4);
    chk(/\b(summary|objective|profile|about me)\b/.test(low), 'Short summary found', 'Add a 2–3 line summary at the top tailored to this role', 2);
    var nums = (raw.match(/\d+(\.\d+)?\s?(%|x|k\b|lpa|lakh|crore|cr\b|million|users|clients|customers)|[₹$]\s?\d/gi) || []).length;
    chk(nums >= 4, 'Good use of numbers and results (' + nums + ' found)', 'Add measurable results — e.g. “reduced cost by 18%”, “handled 200+ clients” (found ' + nums + ')', 6);
    var bullets = (raw.match(/^\s*[-•*▪●–]\s+/gm) || []).length;
    chk(bullets >= 5, 'Uses bullet points', 'Use short bullet points for achievements instead of long paragraphs', 3);
    chk(words >= 200 && words <= 1000, 'Length looks right (' + words + ' words)', words < 200 ? 'Resume looks too short (' + words + ' words) — add detail on projects and results' : 'Resume looks long (' + words + ' words) — aim for 1–2 pages', 4);
    var verbs = (low.match(/\b(led|built|created|designed|managed|improved|increased|reduced|launched|developed|delivered|owned|implemented|analy[sz]ed|optimi[sz]ed|automated|negotiated|achieved)\b/g) || []).length;
    chk(verbs >= 5, 'Strong action verbs used', 'Start bullets with action verbs like “Built”, “Led”, “Reduced”, “Launched”', 3);

    var maxPts = checks.reduce(function (a, c) { return a + c.pts; }, 0), got = checks.reduce(function (a, c) { return a + (c.ok ? c.pts : 0); }, 0);
    var structure = maxPts ? got / maxPts : 0;
    var score = Math.round(100 * (0.65 * cov + 0.35 * structure));
    return { score: score, cov: cov, matched: matched, missing: missing, checks: checks, kwCount: kws.length };
  }

  function verdict(s) {
    if (s >= 75) return ['Strong match', 'Your resume covers most of what this job asks for. Polish the few gaps below and you are in a good place.'];
    if (s >= 50) return ['Decent match — room to improve', 'You cover part of the requirements. Add the missing keywords where they are genuinely true for you, and strengthen the checklist items.'];
    return ['Needs work for this role', 'Many key terms from this job are not visible in your resume. If you have the experience, say it using the job’s own words; if not, consider roles that fit better.'];
  }

  function render(r) {
    var v = verdict(r.score), C = 2 * Math.PI * 54, off = C * (1 - r.score / 100);
    var col = r.score >= 75 ? '#22D3A5' : r.score >= 50 ? '#F59E0B' : '#F87171';
    var chips = function (arr, cls) { return arr.length ? arr.map(function (k) { return '<span class="ats-chip ' + cls + '">' + esc(k.label || k.term) + '</span>'; }).join('') : '<span class="ats-dim">None</span>'; };
    var list = r.checks.map(function (c) { return '<li class="' + (c.ok ? 'g' : 'w') + '"><i>' + (c.ok ? '✓' : '!') + '</i><span>' + esc(c.text) + '</span></li>'; }).join('');
    var out = $('result');
    out.innerHTML =
      '<div class="ats-top"><div><div class="ats-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="10"/><circle cx="60" cy="60" r="54" fill="none" stroke="' + col + '" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg><b>' + r.score + '</b></div><small class="ats-dim" style="display:block;text-align:center;margin-top:6px">match score / 100</small></div>' +
      '<div class="ats-verdict"><h2>' + v[0] + '</h2><p>' + v[1] + '</p><p class="ats-dim" style="margin-top:8px">' + r.matched.length + ' of ' + r.kwCount + ' key terms from the job found in your resume.</p></div></div>' +
      '<div class="ats-box"><h3>✓ Keywords you already have</h3><div class="ats-chips">' + chips(r.matched, 'ok') + '</div></div>' +
      '<div class="ats-box"><h3>Missing from your resume</h3><div class="ats-chips">' + chips(r.missing, 'miss') + '</div><p class="ats-dim" style="margin-top:12px;font-size:13px">Only add a keyword if it is truthful for you. Use it naturally in your experience bullets and skills section.</p></div>' +
      '<div class="ats-box"><h3>Resume checklist</h3><ul class="ats-list">' + list + '</ul></div>' +
      '<div class="ats-cta"><div><h3>Want a real person to review it?</h3><p>Get honest, line-by-line feedback from a verified professional who screens resumes for a living.</p></div><a class="pf-btn" href="explore.html?cat=resume_review">Find a resume reviewer →</a></div>';
    out.hidden = false; out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('go').addEventListener('click', function () {
    var jd = $('jd').value.trim(), rs = $('resume').value.trim(), err = $('err');
    err.textContent = '';
    if (jd.length < 60) { err.textContent = 'Please paste the full job description (at least a few lines).'; return; }
    if (rs.length < 150) { err.textContent = 'Please paste your resume text (or upload a file) — it looks too short.'; return; }
    render(analyse(jd, rs));
  });

  /* file upload — read in the browser only */
  $('file').addEventListener('change', async function (e) {
    var f = e.target.files[0]; if (!f) return;
    var err = $('err'); err.textContent = ''; $('fileName').textContent = 'Reading ' + f.name + '…';
    try {
      var name = f.name.toLowerCase(), text = '';
      if (name.endsWith('.txt')) text = await f.text();
      else if (name.endsWith('.docx')) {
        if (!window.mammoth) throw new Error('Word reader did not load');
        text = (await window.mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() })).value;
      } else if (name.endsWith('.pdf')) {
        if (!window.pdfjsLib) throw new Error('PDF reader did not load');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        var pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise, parts = [];
        for (var p = 1; p <= Math.min(pdf.numPages, 6); p++) {
          var pg = await pdf.getPage(p), tc = await pg.getTextContent(), line = '', lastY = null;
          tc.items.forEach(function (it) { var y = it.transform[5]; if (lastY !== null && Math.abs(y - lastY) > 4) line += '\n'; line += it.str + ' '; lastY = y; });
          parts.push(line);
        }
        text = parts.join('\n');
      } else throw new Error('Unsupported file type');
      if (text.trim().length < 50) throw new Error('empty');
      $('resume').value = text.trim(); $('fileName').textContent = '✓ ' + f.name;
    } catch (ex) {
      $('fileName').textContent = '';
      err.textContent = ex.message === 'empty'
        ? 'Could not read text from this file (it may be a scanned image). Please paste your resume text instead.'
        : 'Could not read this file. Please paste your resume text instead.';
    }
    e.target.value = '';
  });

  window.__atsAnalyse = analyse; // for testing
})();
