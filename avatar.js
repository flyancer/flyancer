/* Flyancer — animated avatars (male / female). Pure SVG + CSS, no images, no GIFs.
   Usage: flyAvatar('female', 'sonig', 92) -> HTML string */
(function () {
  var n = 0;
  var SKIN = ['#F3D0B0', '#E8BC93', '#CF9A70', '#A9714A'];
  var HAIR = ['#1B1B1F', '#2A1A12', '#3B2416', '#15151A'];
  var SHIRT = [['#2563FF', '#7C3AED'], ['#22D3A5', '#2563FF'], ['#F59E0B', '#EF4444'], ['#7C3AED', '#EC4899'], ['#0EA5E9', '#22D3A5']];
  function hash(s) { var h = 0; s = String(s || 'x'); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

  window.flyAvatar = function (gender, seed, size) {
    var h = hash(seed), id = 'fa' + (++n);
    var skin = SKIN[h % 4], hair = HAIR[(h >>> 3) % 4], sh = SHIRT[(h >>> 5) % 5];
    var female = gender === 'female';
    var backHair = female
      ? '<path d="M28 48C26 20 74 20 72 48L75 80C67 85 62 78 62 72L38 72C38 78 33 85 25 80Z" fill="' + hair + '"/>' : '';
    var frontHair = female
      ? '<path d="M30 46C32 27 68 27 70 46C62 39 53 34 45 35C38 37 33 41 30 46Z" fill="' + hair + '"/>'
      : '<path d="M30 45C28 22 72 22 70 45C67 36 60 32 51 32C42 32 34 35 30 45Z" fill="' + hair + '"/><path d="M30 45C29 40 30 37 33 35L33 46Z" fill="' + hair + '"/>';
    var ears = '<circle cx="31" cy="49" r="3.4" fill="' + skin + '"/><circle cx="69" cy="49" r="3.4" fill="' + skin + '"/>';
    var ring = female ? '<circle cx="31" cy="54" r="1.5" fill="#FBBF24"/><circle cx="69" cy="54" r="1.5" fill="#FBBF24"/>' : '';
    return '<svg class="fa-svg" width="' + size + '" height="' + size + '" viewBox="0 0 100 100" role="img" aria-label="' + (female ? 'Female' : 'Male') + ' avatar" style="display:block;border-radius:50%;flex:none">' +
      '<style>.fa-head{animation:faBob 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}' +
      '.fa-eye{animation:faBlink 4.2s infinite;transform-box:fill-box;transform-origin:center}' +
      '.fa-body{animation:faBreath 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}' +
      '@keyframes faBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-1.6px) rotate(1.2deg)}}' +
      '@keyframes faBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}' +
      '@keyframes faBreath{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.025)}}' +
      '@media (prefers-reduced-motion:reduce){.fa-head,.fa-eye,.fa-body{animation:none}}</style>' +
      '<defs><linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16233f"/><stop offset="1" stop-color="#0b1426"/></linearGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + sh[0] + '"/><stop offset="1" stop-color="' + sh[1] + '"/></linearGradient>' +
      '<clipPath id="' + id + 'c"><circle cx="50" cy="50" r="50"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + 'c)"><rect width="100" height="100" fill="url(#' + id + 'b)"/>' +
      '<circle cx="50" cy="48" r="36" fill="' + sh[0] + '" opacity=".16"/>' +
      '<g class="fa-body"><path d="M12 104C12 82 28 74 50 74C72 74 88 82 88 104Z" fill="url(#' + id + 's)"/></g>' +
      '<rect x="44" y="62" width="12" height="16" rx="5" fill="' + skin + '"/><rect x="44" y="70" width="12" height="6" fill="#000" opacity=".12"/>' +
      '<g class="fa-head">' + backHair + ears + ring +
      '<ellipse cx="50" cy="47" rx="19" ry="21.5" fill="' + skin + '"/>' + frontHair +
      '<ellipse class="fa-eye" cx="43" cy="48" rx="2.2" ry="2.9" fill="#1b1b1f"/><ellipse class="fa-eye" cx="57" cy="48" rx="2.2" ry="2.9" fill="#1b1b1f"/>' +
      '<circle cx="39" cy="55" r="3.2" fill="#F87171" opacity=".28"/><circle cx="61" cy="55" r="3.2" fill="#F87171" opacity=".28"/>' +
      '<path d="M44.5 56.5Q50 61.5 55.5 56.5" fill="none" stroke="#6b2d1f" stroke-width="1.8" stroke-linecap="round"/></g></g></svg>';
  };
})();
