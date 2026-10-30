/* Flyancer — animated "smart professional" avatars. 8 original characters (m1-m4, f1-f4).
   Pure SVG + CSS: blinking, eyes that look around, raised eyebrows, head sway, breathing.
   flyAvatar('f3', seed, 64) -> HTML string.  Legacy 'male' / 'female' still work. */
(function () {
  var n = 0;
  var SPEC = {
    m1: { skin: '#F1C8A2', shade: '#D9A982', hair: '#2B1D16', hi: '#5A4030', style: 'sidepart', outfit: 'blazerTie', coat: '#1F3A6E', shirt: '#F4F6FB', tie: '#C2410C' },
    m2: { skin: '#E3B48A', shade: '#C79570', hair: '#161316', hi: '#4a4350', style: 'quiff', glasses: 1, outfit: 'blazer', coat: '#374151', shirt: '#DCE8FF' },
    m3: { skin: '#C48A5E', shade: '#A5714A', hair: '#0f0e12', hi: '#3a3744', style: 'curly', outfit: 'blazer', coat: '#1E40AF', shirt: '#F4F6FB' },
    m4: { skin: '#9A6440', shade: '#7F4F31', hair: '#141116', hi: '#3a3340', style: 'buzz', beard: 1, outfit: 'blazerTie', coat: '#3B1F5E', shirt: '#F4F6FB', tie: '#F59E0B' },
    f1: { skin: '#F1C8A2', shade: '#D9A982', hair: '#2A1710', hi: '#6A4630', style: 'long', outfit: 'blazerV', coat: '#0F766E', shirt: '#FDE7E0' },
    f2: { skin: '#E3B48A', shade: '#C79570', hair: '#17131a', hi: '#4b4458', style: 'bob', earrings: 1, outfit: 'blazerV', coat: '#9D174D', shirt: '#F4F6FB' },
    f3: { skin: '#C48A5E', shade: '#A5714A', hair: '#3A2214', hi: '#7a4d2e', style: 'pony', glasses: 1, outfit: 'blazer', coat: '#4C1D95', shirt: '#EDE9FE' },
    f4: { skin: '#9A6440', shade: '#7F4F31', hair: '#120f14', hi: '#3a3340', style: 'bun', earrings: 1, outfit: 'blazerV', coat: '#1D4ED8', shirt: '#F4F6FB' }
  };
  window.FLY_AVATARS = ['m1', 'm2', 'm3', 'm4', 'f1', 'f2', 'f3', 'f4'];
  function hash(s) { var h = 0; s = String(s || 'x'); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  window.flyAvatarId = function (avatar, gender, seed) {
    if (SPEC[avatar]) return avatar;
    return (gender === 'female' ? 'f' : 'm') + (hash(seed) % 4 + 1);
  };

  var C = function (x, y, r, f) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"/>'; };
  var P = function (d, f, extra) { return '<path d="' + d + '" fill="' + f + '"' + (extra || '') + '/>'; };
  var S = function (d, c, w, o) { return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" opacity="' + (o || 1) + '"/>'; };

  var HAIR = {
    sidepart: function (h, hi) { return { back: '', front: P('M30 47C25 22 37 10 53 10C70 10 77 24 70 47C69 38 66 32 60 29C52 34 41 33 36 28C33 33 31 39 30 47Z', h) + S('M40 16C48 12 58 13 65 19', hi, 2, .55) + S('M36 22C40 20 44 20 47 21', hi, 1.5, .4) }; },
    quiff:    function (h, hi) { return { back: '', front: P('M29 47C23 25 33 9 54 10C72 11 79 27 71 47C70 39 67 33 61 30C53 27 42 28 36 33C32 37 30 41 29 47Z', h) + S('M40 17C48 12 60 13 67 20', hi, 2.2, .55) }; },
    curly:    function (h, hi) { var cs = [[33, 33, 7], [40, 24, 8], [50, 20, 9], [60, 24, 8], [67, 33, 7], [30, 42, 5], [70, 42, 5], [45, 30, 6], [55, 30, 6]]; return { back: '', front: cs.map(function (c) { return C(c[0], c[1], c[2], h); }).join('') + S('M42 20C47 17 54 17 58 20', hi, 1.8, .5) }; },
    buzz:     function (h, hi) { return { back: '', front: P('M31 45C28 24 38 15 50 15C63 15 72 24 69 45C67 37 64 32 58 30C52 32 46 32 42 30C36 32 33 38 31 45Z', h, ' opacity=".96"') }; },
    long:     function (h, hi) { return { back: P('M27 50C19 12 81 12 73 50L79 88C70 95 61 86 61 77L39 77C39 86 30 95 21 88Z', h), front: P('M30 49C26 22 44 9 51 25C45 29 37 37 34 49Z', h) + P('M70 49C74 22 56 9 49 25C55 29 63 37 66 49Z', h) }; },
    bob:      function (h, hi) { return { back: P('M26 53C18 12 82 12 74 53L74 68C70 74 63 72 62 65L38 65C37 72 30 74 26 68Z', h), front: P('M28 47C27 17 62 6 73 40C66 32 55 28 45 33C38 36 31 40 28 47Z', h)  }; },
    pony:     function (h, hi) { return { back: P('M64 30C88 26 95 58 80 80C80 64 74 53 66 46Z', h) + C(66, 31, 3, '#F59E0B'), front: P('M29 47C25 20 45 8 62 12C76 18 76 34 71 47C64 36 52 29 42 34C36 37 31 41 29 47Z', h) + S('M38 15C46 10 56 10 64 15', hi, 2, .55) }; },
    bun:      function (h, hi) { return { back: C(50, 12, 9.5, h) + S('M44 9C48 6 53 6 56 9', hi, 1.6, .55), front: P('M30 48C26 22 44 11 50 25C44 29 36 37 33 48Z', h) + P('M70 48C74 22 56 11 50 25C56 29 64 37 67 48Z', h) + S('M37 22C41 16 46 15 49 19', hi, 1.6, .5) }; }
  };

  function outfit(sp, uid) {
    var coat = sp.coat, sh = sp.shirt, o = sp.outfit, body = '';
    var shoulders = 'M6 106C6 84 26 76 50 76C74 76 94 84 94 106Z';
    if (o === 'collar') {
      body = P(shoulders, sh) + P('M38 76L50 90L62 76Z', sp.skin) + P('M36 75L48 90L40 96L30 82Z', coat) + P('M64 75L52 90L60 96L70 82Z', coat) + P('M38 76L50 90L44 78Z', '#fff', ' opacity=".9"');
    } else {
      body = P(shoulders, coat) + P('M39 76L50 96L61 76Z', sh);
      if (o === 'blazerV') body = P(shoulders, coat) + P('M40 76L50 94L60 76Z', sp.skin) + P('M40 76L50 94L44 100L34 84Z', coat, ' opacity=".55"') + P('M60 76L50 94L56 100L66 84Z', coat, ' opacity=".55"') + S('M43 79Q50 87 57 79', '#FBBF24', 1.2, .9);
      if (o === 'blazerTie') body += P('M47.5 79L52.5 79L51.5 83L48.5 83Z', sp.tie) + P('M48.5 83L51.5 83L54 98L50 102L46 98Z', sp.tie);
      if (o === 'blazer' || o === 'blazerTie') body += P('M39 76L50 96L42 100L28 86Z', coat, ' opacity=".5"') + P('M61 76L50 96L58 100L72 86Z', coat, ' opacity=".5"') + P('M40 75L50 86L45 76Z', '#fff', ' opacity=".92"') + P('M60 75L50 86L55 76Z', '#fff', ' opacity=".92"');
    }
    return body;
  }

  window.flyAvatar = function (avatar, seed, size, gender) {
    var id = window.flyAvatarId(avatar, gender || (avatar === 'female' ? 'female' : 'male'), seed);
    var sp = SPEC[id], uid = 'fa' + (++n), female = id.charAt(0) === 'f';
    var hr = HAIR[sp.style](sp.hair, sp.hi);
    var ears = C(31.5, 49, 3.6, sp.skin) + C(68.5, 49, 3.6, sp.skin) + C(31.8, 49.2, 1.7, sp.shade) + C(68.2, 49.2, 1.7, sp.shade);
    var ring = sp.earrings ? C(31, 54.5, 1.7, '#FBBF24') + C(69, 54.5, 1.7, '#FBBF24') : '';
    var beard = sp.beard ? P('M31 50C30 67 39 73 50 73C61 73 70 67 69 50C67 59 61 64 50 64C39 64 33 59 31 50Z', sp.hair) + P('M42 58.5Q50 55.5 58 58.5Q50 61 42 58.5Z', sp.hair) : '';
    var glasses = sp.glasses ? '<g fill="rgba(180,210,255,.12)" stroke="#1b1b22" stroke-width="1.5"><rect x="35.5" y="43" width="13" height="10.5" rx="4.5"/><rect x="51.5" y="43" width="13" height="10.5" rx="4.5"/></g><path d="M48.5 47.5h3" stroke="#1b1b22" stroke-width="1.4"/>' : '';
    var brow = sp.hair;
    var eye = function (cx) { return '<g class="fa-blink"><ellipse cx="' + cx + '" cy="48" rx="3.3" ry="3.4" fill="#fff"/><g class="fa-look">' + C(cx, 48.2, 2, '#2a1a12') + C(cx + .7, 47.4, .6, '#fff') + '</g></g>'; };
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">' +
      '<style>.fa-head{animation:faSway 5.5s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 90%}' +
      '.fa-blink{animation:faBlink 4.6s infinite;transform-box:fill-box;transform-origin:center}' +
      '.fa-look{animation:faLook 7s ease-in-out infinite}' +
      '.fa-brow{animation:faBrow 6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}' +
      '.fa-mouth{animation:faSmile 6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}' +
      '.fa-body{animation:faBreath 4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}' +
      '@keyframes faSway{0%,100%{transform:translateY(0) rotate(-1.4deg)}50%{transform:translateY(-1.3px) rotate(1.4deg)}}' +
      '@keyframes faBlink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.08)}}' +
      '@keyframes faLook{0%,18%,100%{transform:translateX(0)}30%,45%{transform:translateX(-1px)}58%,72%{transform:translateX(1px)}}' +
      '@keyframes faBrow{0%,60%,100%{transform:translateY(0)}68%,78%{transform:translateY(-1.3px)}}' +
      '@keyframes faSmile{0%,55%,100%{transform:scale(1)}66%,80%{transform:scale(1.14,1.25)}}' +
      '@keyframes faBreath{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.03)}}' +
      '@media (prefers-reduced-motion:reduce){.fa-head,.fa-blink,.fa-look,.fa-brow,.fa-mouth,.fa-body{animation:none}}</style>' +
      '<defs><radialGradient id="' + uid + 'b" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#27406f"/><stop offset="1" stop-color="#0c1630"/></radialGradient>' +
      '<clipPath id="' + uid + 'c"><circle cx="50" cy="50" r="50"/></clipPath></defs>' +
      '<g clip-path="url(#' + uid + 'c)"><rect width="100" height="100" fill="url(#' + uid + 'b)"/>' +
      '<g class="fa-body">' + outfit(sp, uid) + '</g>' +
      '<rect x="43.5" y="60" width="13" height="19" rx="5" fill="' + sp.skin + '"/><path d="M43.5 66Q50 74 56.5 66L56.5 72Q50 80 43.5 72Z" fill="#000" opacity=".16"/>' +
      '<g class="fa-head">' + hr.back + ears + ring +
      '<ellipse cx="50" cy="46.5" rx="18.8" ry="21.3" fill="' + sp.skin + '"/>' +
      '<ellipse cx="50" cy="62" rx="12" ry="4" fill="' + sp.shade + '" opacity=".22"/>' +
      '<circle cx="38.5" cy="55" r="3.6" fill="#F87171" opacity=".22"/><circle cx="61.5" cy="55" r="3.6" fill="#F87171" opacity=".22"/>' +
      eye(42.5) + eye(57.5) +
      '<g class="fa-brow"><path d="M37.5 41.2Q42.5 38.2 47.2 40.8" fill="none" stroke="' + brow + '" stroke-width="1.9" stroke-linecap="round"/><path d="M52.8 40.8Q57.5 38.2 62.5 41.2" fill="none" stroke="' + brow + '" stroke-width="1.9" stroke-linecap="round"/></g>' +
      '<path d="M50 49.5Q52.2 53.5 49.4 54.4" fill="none" stroke="' + sp.shade + '" stroke-width="1.3" stroke-linecap="round"/>' +
      beard + hr.front + glasses +
      '<g class="fa-mouth"><path d="M44.5 57.8Q50 63 55.5 57.8" fill="none" stroke="' + (sp.beard ? '#fff' : '#8f3b2c') + '" stroke-width="1.9" stroke-linecap="round"/></g>' +
      '</g></g></svg>';
    return '<img class="fa-svg" alt="' + (female ? 'Female' : 'Male') + ' professional avatar" width="' + size + '" height="' + size + '" style="display:block;border-radius:50%;flex:none" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '">';
  };
})();
