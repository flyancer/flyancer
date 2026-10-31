/* Flyancer — "Connect" section: floating topic pills -> sub-topics.
   EDIT THE LIST BELOW to change categories. Each sub-topic links to the Explore page. */
(function () {
  var I = {
    career: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    code:   '<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
    product:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>',
    data:   '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    ai:     '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    design: '<path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 2-2c0-1.2-.9-1.7-.9-2.7 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 7 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    startup:'<path d="M12 15l-3-3a22 22 0 0 1 2-4 12 12 0 0 1 11-5c0 3-1 8-5 11a22 22 0 0 1-5 1z"/><path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2M9 12H4s.6-3 2-4M12 15v5s3-.6 4-2"/>',
    money:  '<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16.5" cy="14" r="1.2"/>',
    globe:  '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    mega:   '<path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
    health: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/><path d="M3 12h4l2-3 3 6 2-3h7"/>',
    moon:   '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>'
  };

  var TOPICS = [
    { id: 'careers',  label: 'Careers & job search', icon: 'career', subs: ['Review my resume for a product role', 'Fix my LinkedIn profile for recruiters', 'Get a referral at a product company', 'Practice salary negotiation for an offer', 'Switch from IT services to product firms', 'Plan my next step after a layoff'] },
    { id: 'software', label: 'Software engineering', icon: 'code',   subs: ['Mock system design interview', 'DSA prep plan for coding interviews', 'Review my GitHub projects before I apply', 'React and JavaScript interview practice', 'Code review of my backend project', 'Grow from developer to tech lead'] },
    { id: 'product',  label: 'Product management',   icon: 'product',subs: ['Mock product sense interview', 'Move from engineering into product', 'Review my PM case study', 'Help me write a PRD for a new feature', 'Mock PM interview for a fintech role', 'Prep for a product metrics interview'] },
    { id: 'data',     label: 'Data science',         icon: 'data',   subs: ['Mock interview for a data scientist role', 'SQL and Python practice for analyst roles', 'Review my data science portfolio', 'Switch from data analyst to data scientist', 'A/B testing and statistics interview prep', 'Learning plan for data engineering'] },
    { id: 'ai',       label: 'AI & ML',              icon: 'ai',     subs: ['Mock interview for an ML engineer role', 'Help me build my first RAG app', 'Review my ML project before I apply', 'Path from software engineer to ML engineer', 'Automate my small business with AI tools', 'Fine-tune an LLM on my own data'] },
    { id: 'design',   label: 'Design',               icon: 'design', subs: ['Review my UX portfolio before I apply', 'Mock whiteboard challenge for UX roles', "Feedback on my app's onboarding flow", 'Move from graphic design to UX design', 'Set up a design system in Figma', 'Review my case study for senior roles'] },
    { id: 'startups', label: 'Startups',             icon: 'startup',subs: ['Review my pitch deck before a seed round', 'Validate my startup idea before I build', 'Go-to-market plan for a D2C brand', 'Help me price my SaaS product', 'Find product-market fit for B2B SaaS', 'Advice on hiring my first engineers'] },
    { id: 'finance',  label: 'Finance & investments',icon: 'money',  subs: ['Review my mutual fund portfolio', 'Tax and investment plan for my salary', 'Prepare for CFA Level 1', 'Mock interview for investment banking', 'Make a retirement plan', "Learn to read a company's financials"] },
    { id: 'abroad',   label: 'Study abroad',         icon: 'globe',  subs: ['Shortlist US universities for an MS in CS', "Review my SOP for a master's application", 'Plan my MBA applications', 'GRE and IELTS preparation plan', 'Practice my US student visa interview', 'Study in Germany: universities and costs'] },
    { id: 'content',  label: 'Content marketing',    icon: 'mega',   subs: ['Grow my Instagram as a new creator', 'Plan a YouTube channel for my niche', 'Write LinkedIn posts that bring clients', "SEO plan for my startup's blog", 'Set up email marketing for my business', 'Run my first Meta ads campaign'] },
    { id: 'health',   label: 'Health & wellness',    icon: 'health', subs: ['Indian diet plan for weight loss', 'Home workout plan for a busy schedule', 'Yoga routine for lower back pain', 'PCOS diet and lifestyle advice', 'Sleep better and manage stress', 'Training plan for my first half marathon'] },
  ];

  window.FLY_TOPICS = TOPICS;

  var main = document.getElementById('tpMain'), panel = document.getElementById('tpPanel');
  if (!main || !panel) return;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var slug = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };

  main.innerHTML = TOPICS.map(function (t, i) {
    return '<button type="button" class="tp-pill" role="tab" data-id="' + t.id + '" style="--d:' + (i * 0.55).toFixed(2) + 's">' +
      '<span class="tp-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + I[t.icon] + '</svg></span>' +
      '<span class="tp-label">' + esc(t.label) + '</span></button>';
  }).join('');

  function show(id, first) {
    var t = TOPICS.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    main.querySelectorAll('.tp-pill').forEach(function (b) { b.classList.toggle('on', b.dataset.id === id); b.setAttribute('aria-selected', b.dataset.id === id); });
    panel.classList.remove('in'); void panel.offsetWidth;
    panel.innerHTML = '<div class="tp-head"><h3>' + esc(t.label) + '</h3><a class="tp-all" href="explore.html?topic=' + t.id + '">See all experts →</a></div>' +
      '<div class="tp-subs">' + t.subs.map(function (s, i) {
        return '<a class="tp-chip" style="--i:' + i + '" href="explore.html?topic=' + t.id + '&sub=' + slug(s) + '">' + esc(s) + '</a>';
      }).join('') + '</div>';
    panel.classList.add('in');
  }
  main.addEventListener('click', function (e) { var b = e.target.closest('.tp-pill'); if (b) show(b.dataset.id); });
  show(TOPICS[0].id, true);
})();
