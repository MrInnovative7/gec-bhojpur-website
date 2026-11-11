/* GEC Bhojpur - shared behaviour (no build step, no dependencies) */

(function () {

  "use strict";

  var D = window.GEC;

  var $ = function (s, e) { return (e || document).querySelector(s); };

  var $$ = function (s, e) { return Array.prototype.slice.call((e || document).querySelectorAll(s)); };

  var page = document.body.getAttribute("data-page") || "home";

  var store = {

    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },

    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  };



  /* ---------- theme + text size (light is the default) ---------- */

  var root = document.documentElement;

  if (store.get("gec-theme") === "dark") root.setAttribute("data-theme", "dark");

  var sizes = [100, 112, 125], sizeIdx = parseInt(store.get("gec-size") || "0", 10) || 0;

  root.style.fontSize = sizes[sizeIdx] + "%";



  /* ---------- helpers ---------- */

  function fmt(d) { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }

  function isNew(d) { return (Date.now() - new Date(d).getTime()) / 864e5 <= 14 && Date.now() >= new Date(d).getTime(); }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function sortedNotices() { return D.notices.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }); }



function noticeItem(n) {

  var moreLink = n.pdf

    ? '<a class="notice-more" href="' + esc(n.pdf) +

      '" target="_blank" rel="noopener">Learn More ↗</a>'

    : '<a class="notice-more" href="notices.html">Learn More ↗</a>';



  return '<li><time datetime="' + n.date + '">' + fmt(n.date) + '</time><div>' +

    '<span class="chip">' + esc(n.category) + '</span>' +

    (isNew(n.date) ? '<span class="chip new">New</span>' : '') +

    '<strong>' + esc(n.title) + '</strong>' +

    moreLink +

    (n.pdf

      ? '<a class="pdf" href="' + esc(n.pdf) +

        '" target="_blank" rel="noopener">Download PDF</a>'

      : '') +

    (n.docs || []).filter(function (d) { return d && d.url && safeUrl(d.url); }).map(function (d) {

      return '<a class="pdf" href="' + esc(d.url) + '" target="_blank" rel="noopener">' + esc(d.label || "Download") + '</a>';

    }).join("") +

    [["website", "Click Here for Website"], ["brochure", "Click Here for Brochure"], ["registration", "Event Registration"], ["readMore", "View Event Details"]].map(function (k) {

      return safeUrl(n[k[0]]) ? '<a class="pdf" href="' + esc(n[k[0]]) + '" target="_blank" rel="noopener">' + k[1] + '</a>' : "";

    }).join("") +

    '</div></li>';

}



/* ---------- Notice board (homepage: Notice | Events | Academic Notices) ---------- */

function safeUrl(u) { return typeof u === "string" && u.trim() !== "" && !/^\s*(javascript|data|vbscript):/i.test(u); }

/* "NEW" badge: only for notices published within the last 7 days. */

function nbIsNew(d) { var age = (Date.now() - new Date(d).getTime()) / 864e5; return age >= 0 && age <= 7; }



function noticeActions(n) {

  var DL = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var EXT = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var out = [];

  /* Real URL -> working link. No URL yet -> visible but disabled (no href, not focusable). */

  function add(url, label, icon) {

    if (safeUrl(url)) out.push('<li><a class="nb-link" href="' + esc(url) + '" target="_blank" rel="noopener">' + icon + '<span>' + esc(label) + '</span></a></li>');

    else out.push('<li><span class="nb-link is-disabled" aria-disabled="true" title="Document not yet available">' + icon + '<span>' + esc(label) + '</span><span class="nb-sr"> (not yet available)</span></span></li>');

  }

  (n.docs || []).forEach(function (d) { if (d && d.label) add(d.url, d.label, DL); });

  if (safeUrl(n.pdf)) add(n.pdf, n.pdfLabel || "Download Notice", DL);

  if (n.column === "events") {

    if (safeUrl(n.website)) add(n.website, "Click Here for Website", DL);

    if (safeUrl(n.brochure)) add(n.brochure, "Click Here for Brochure", DL);

    if (safeUrl(n.registration)) add(n.registration, "Event Registration", EXT);

    if (safeUrl(n.readMore)) add(n.readMore, "View Event Details", EXT);

  }

  return out.length ? '<ul class="nb-links">' + out.join("") + '</ul>' : "";

}



function noticeBoardItem(n) {

  var extra = "";

  if (n.eventDate) extra += '<span class="nb-meta">Event date: ' + esc(n.eventDate) + '</span>';

  if (n.venue) extra += '<span class="nb-meta">Venue: ' + esc(n.venue) + '</span>';

  return '<article class="nb-item">' +

    (nbIsNew(n.date) ? '<span class="nb-new">New</span>' : '') +

    '<p class="nb-title">' + esc(n.title) + '</p>' +

    '<span class="nb-date"><time datetime="' + esc(n.date) + '">' + fmt(n.date) + '</time></span>' +

    extra + noticeActions(n) + '</article>';

}



/* Seamless endless vertical scroller. One list + one aria-hidden clone; the

   track moves up by exactly the measured height of one list, then wraps. */

function initNoticeScroll(list) {

  var card = list.closest(".nb-card") || list;

  var track = list.querySelector(".nb-track"), seq = list.querySelector(".nb-seq");

  if (!track || !seq) return;

  var SPEED = 25;                                   /* pixels per second */

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var clone = null, H = 0, pos = 0, last = 0, raf = 0, visible = true, touchTimer = 0;

  var holds = { hover: false, focus: false, touch: false };



  function apply() { track.style.transform = "translate3d(0," + (-pos) + "px,0)"; }

  function held() { return holds.hover || holds.focus || holds.touch; }

  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  function start() { if (!raf && clone && visible && !held()) { last = 0; raf = requestAnimationFrame(tick); } }

  function sync() { if (held()) stop(); else start(); }

  function tick(t) {

    if (!last) last = t;

    var dt = Math.min((t - last) / 1000, 0.1); last = t;

    pos += SPEED * dt; if (pos >= H) pos -= H;

    apply();

    raf = requestAnimationFrame(tick);

  }

  function build() {

    stop();

    if (clone) { clone.remove(); clone = null; }

    track.style.transform = "";

    list.classList.remove("is-scrolling");

    list.removeAttribute("tabindex"); list.removeAttribute("role"); list.removeAttribute("aria-label");

    list.scrollTop = 0;

    if (reduce.matches) {                           /* no animation: native, keyboard-reachable scrolling */

      pos = 0;

      list.setAttribute("tabindex", "0"); list.setAttribute("role", "region");

      list.setAttribute("aria-label", (card.querySelector("h2") || {}).textContent || "Notices");

      return;

    }

    H = seq.getBoundingClientRect().height;

    if (H <= list.clientHeight + 1) { pos = 0; return; }   /* too short to loop seamlessly: stay static */

    clone = seq.cloneNode(true);

    clone.classList.add("nb-clone");

    clone.setAttribute("aria-hidden", "true"); clone.setAttribute("inert", "");

    clone.querySelectorAll("[id]").forEach(function (e) { e.removeAttribute("id"); });

    clone.querySelectorAll("a,button,[tabindex]").forEach(function (e) { e.setAttribute("tabindex", "-1"); });

    track.appendChild(clone);

    pos = pos % H;

    list.classList.add("is-scrolling");

    apply(); sync();

  }



  /* pause while the pointer is over the column, focus is inside it, or a finger is down */

  card.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { holds.hover = true; sync(); } });

  card.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { holds.hover = false; sync(); } });

  card.addEventListener("focusin", function (e) {

    holds.focus = true; sync();

    var it = e.target.closest && e.target.closest(".nb-item");

    if (clone && it && !clone.contains(it)) {       /* keep the focused item on screen */

      var top = it.offsetTop;

      if (top < pos || top + it.offsetHeight > pos + list.clientHeight) { pos = top; apply(); }

      list.scrollTop = 0;

    }

  });

  card.addEventListener("focusout", function (e) { if (!card.contains(e.relatedTarget)) { holds.focus = false; sync(); } });

  card.addEventListener("touchstart", function () { holds.touch = true; clearTimeout(touchTimer); sync(); }, { passive: true });

  function touchDone() { clearTimeout(touchTimer); touchTimer = setTimeout(function () { holds.touch = false; sync(); }, 2500); }

  card.addEventListener("touchend", touchDone, { passive: true });

  card.addEventListener("touchcancel", touchDone, { passive: true });



  if ("IntersectionObserver" in window) {

    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) sync(); else stop(); }).observe(card);

  }

  if ("ResizeObserver" in window) {

    var pending = 0, ro = new ResizeObserver(function () { cancelAnimationFrame(pending); pending = requestAnimationFrame(build); });

    ro.observe(list); ro.observe(seq);

  } else { window.addEventListener("resize", build); }

  if (reduce.addEventListener) reduce.addEventListener("change", build);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);

  build();

}



/* ---------- header + footer ---------- */

  var NAV = [

    ["about.html", "About Us", "about"],

    ["about.html", "Administration", "administration"],

    ["admissions.html", "Academics", "academics"],

    ["departments.html", "Department", "departments"],

    ["about.html", "Facilities & Services", "facilities"],

    ["contact.html", "Training & Placement", "training"],

    /* Approvals / Gallery: no dedicated pages exist yet, so these keep "#" until real URLs are supplied. */

    ["#", "Approvals", "approvals"],

    ["#", "Gallery", "gallery"]

  ];



  /* Utility strip links: only destinations that already exist (see data.js "quick"). */

  var ICON = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; };

  /* "#" = no destination page exists yet (Jobs & Careers, Calendar, Tenders). Replace with the real URL when available. */

  var UTIL = [

    ["#", "Jobs &amp; Careers", ICON("M3 8h18v11H3zM9 8V5h6v3M3 13h18")],

    ["#", "Calendar", ICON("M4 6h16v14H4zM4 10h16M8 3v4M16 3v4")],

    ["#", "Tenders", ICON("M6 3h8l4 4v14H6zM14 3v5h4M9 13h6M9 17h4")],

    ["portal.html", "Payment Gateway", ICON("M3 7h18v12H3zM3 11h18M7 15h3")],

    ["contact.html", "Grievance &amp; Contact", ICON("M4 6h16v12H4zM4 7l8 6 8-6")]

  ];

  /* Official social profile URLs were not found in the project (footer says "to be added").

     Fill in the "url" values; icons without a URL render as inactive (no href). */

  var SOCIAL = [

    { name: "Facebook", url: "", path: "M14 8.5V7c0-.8.3-1.2 1.3-1.2H17V3h-2.6C11.6 3 10.5 4.7 10.5 6.9v1.6H8V11.5h2.5V21H14v-9.5h2.6l.4-3Z", filled: true },

    { name: "Instagram", url: "", path: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 6.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6ZM17.2 6.8h.01", filled: false },

    { name: "X (Twitter)", url: "", path: "M18.2 2.25h3.3l-7.2 8.26 8.5 11.24h-6.65l-5.2-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.7 6.23 5.42-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.92 15.64Z", filled: true },

    { name: "LinkedIn", url: "", path: "M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 8.5H3V21h4V8.5Zm6.3 0H9.3V21h4v-6.6c0-3.7 4.7-4 4.7 0V21h4v-8c0-6.2-7-6-8.7-2.9V8.5Z", filled: true }

  ];

  var SOCIAL_HTML = '<span class="header-social">' + SOCIAL.map(function (x) {

    var svg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + x.path + '" ' +

      (x.filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"') + '/></svg>';

    return x.url

      ? '<a href="' + esc(x.url) + '" target="_blank" rel="noopener" aria-label="' + x.name + '" title="' + x.name + '">' + svg + '</a>'

      : '<a class="is-inactive" aria-label="' + x.name + ' (link not yet added)" title="' + x.name + '" aria-disabled="true">' + svg + '</a>';

  }).join("") + '</span>';

  /* No translation system exists yet: English is the current language and Hindi is shown but inactive. */

  var LANG_HTML = '<span class="header-lang" role="group" aria-label="Language">' +

    '<button type="button" lang="hi" aria-disabled="true" title="Hindi translation is not available yet">हिन्दी</button>' +

    '<span aria-hidden="true">/</span>' +

    '<span class="is-current" lang="en" aria-current="true">English</span></span>';



  var PIN = '<img class="header-bihar-logo" src="assets/images/bihar-govt.png" alt="Government of Bihar Logo">';

  var HEADER_ADDRESS = "South East Ramna Road, near Maharaja College, Arrah, Bihar";



  /* ---------- Mobile header (<=760px only; hidden by CSS on larger screens) ----------

     Reuses SOCIAL, UTIL and NAV above. The desktop header markup below is untouched. */

  var M_SVG = function (inner) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>'; };

  var M_GLOBE = M_SVG('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z"/>');

  var M_SEARCH = M_SVG('<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>');

  var M_USER = M_SVG('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.4-7 8-7s8 2.8 8 7"/>');
  var M_MOON = M_SVG('<path d="M20.4 15.1A8.5 8.5 0 0 1 8.9 3.6 8.5 8.5 0 1 0 20.4 15.1Z"/>');
  var M_SUN = M_SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>');

  function mLi(href, label, current, cls) {

    return '<li' + (cls ? ' class="' + cls + '"' : '') + '><a href="' + href + '"' + (current ? ' aria-current="page"' : '') + '>' + label + '</a></li>';

  }

  var M_MENU =

    mLi("index.html", "Home", page === "home") +

    NAV.map(function (n) { return mLi(n[0], n[2] === "departments" ? "Departments" : esc(n[1]), n[2] === page); }).join("") +

    UTIL.map(function (u) { return mLi(u[0], u[1], false); }).join("") +

    mLi("portal.html", M_USER + "<span>Login</span>", page === "portal", "m-nav-login");

  var M_HEADER_HTML =

    '<div class="m-header">' +

    '<div class="m-bar">' + SOCIAL_HTML.replace("header-social", "m-social") +

    '<button class="m-lang" type="button" lang="hi" aria-disabled="true" aria-label="Language: Hindi (translation not available yet)" title="Hindi translation is not available yet">' + M_GLOBE + '<span>हिंदी</span></button>' +

    '<span class="m-fs" role="group" aria-label="Text size"><button id="fs-dec" type="button" aria-label="Decrease text size">A−</button>' +
    '<button id="fs-inc" type="button" aria-label="Increase text size">A+</button></span>' +
    '<button class="m-theme" id="m-th" type="button" aria-label="Switch to dark mode" title="Dark mode">' + M_MOON + '</button></div>' +

    '<div class="m-main">' +

    '<button class="m-search-btn" id="m-search-toggle" type="button" aria-label="Open search" aria-expanded="false" aria-controls="m-sf">' + M_SEARCH + '</button>' +

    '<a class="m-logos" href="index.html" aria-label="Government Engineering College, Bhojpur - Home">' +

    '<img class="m-logo-bihar" src="assets/images/bihar-govt.png" alt="Government of Bihar Logo">' +

    '<img class="m-logo-gec" src="assets/images/Transparent_logo.png" alt="Government Engineering College, Bhojpur Logo"></a>' +

    '<button class="m-burger" id="m-bg" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="m-nav"><span></span><span></span><span></span></button>' +

    '</div>' +

    '<p class=\"m-name\" aria-live=\"polite\"><strong class=\"m-name-hi\" lang=\"hi\">राजकीय अभियंत्रण महाविद्यालय, भोजपुर</strong><span class=\"m-name-en\" lang=\"en\" hidden>' + esc(D.info.name) + '</span></p>' +

    '<form class="m-search" id="m-sf" role="search" action="notices.html"><input id="m-q" name="q" placeholder="Search notices" aria-label="Search notices"><button type="submit" aria-label="Search">' + M_SEARCH + '</button></form>' +

    '<nav class="m-nav" id="m-nav" aria-label="Main menu"><ul>' + M_MENU + '</ul></nav>' +

    '</div>';



  var headerHTML =

    '<a class="skip" href="#main">Skip to content</a>' +

    '<header class="site-header">' +

    M_HEADER_HTML +

    '<div class="header-top-info"><div class="utility-inner">' +

    '<nav class="utility-links" aria-label="Quick links">' + UTIL.map(function (u) {

      return '<a href="' + u[0] + '">' + u[2] + '<span>' + u[1] + '</span></a>';

    }).join("") + '</nav>' +

    SOCIAL_HTML + LANG_HTML +

    '<span class="header-tools">' +

    '<button id="fs" type="button" aria-label="Change text size">A+</button>' +

    '<button id="th" type="button" aria-label="Toggle dark mode">Dark mode</button>' +

    '</span></div></div>' +

    '<div class="container bar"><div class="header-main">' +

    '<a class="brand" href="index.html" style="display:flex;align-items:center;gap:14px;font-family:Arial,sans-serif;min-width:max-content;">' +

    '<picture class="header-logo">' +

    '<img class="logo-transparent" src="assets/images/Transparent_logo.png" alt="Government Engineering College, Bhojpur Logo">' +

    '<img class="logo-yellow" src="assets/images/Transparent_logo.png" alt="Government Engineering College, Bhojpur Logo">' +

    '</picture>' +

    '<span class="brand-name" style="display:flex;flex-direction:column;gap:5px;font-family:Arial,sans-serif;">' +

    '<strong style="display:block;font-family:Arial,sans-serif;font-size:14px;font-weight:700;line-height:1.3;">राजकीय अभियंत्रण महाविद्यालय, भोजपुर</strong>' +

    '<small style="display:block;font-family:Arial,sans-serif;font-size:15px;font-weight:600;line-height:1.3;">' + esc(D.info.name) + '</small>' +

    '</span></a>' +

    '<p class="header-info"><span>' + esc(D.info.dept) + '</span><span>' + esc(HEADER_ADDRESS) + '</span>' + PIN + '</p>' +

    '<a class="home-icon" href="index.html" aria-label="Home" title="Home"' + (page === "home" ? ' aria-current="page"' : '') + ' style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex:0 0 28px;color:#fff;text-decoration:none;">' +

    '<svg viewBox="0 0 24 24" aria-hidden="true" style="display:block;width:20px;height:20px;"><path d="M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9.5 20v-6h5v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +

    '</a>' +

    '<nav class="nav" id="nav" aria-label="Main"><ul>' + NAV.map(function (n) {

      return '<li><a href="' + n[0] + '"' + (n[2] === page ? ' aria-current="page"' : '') + '>' + n[1] + '</a></li>';

    }).join("") + '</ul></nav>' +

    '<div class="header-actions" style="display:flex;align-items:center;justify-content:center;gap:10px;flex-shrink:0;">' +

    '<button class="search-toggle" id="search-toggle" type="button" aria-label="Open search" aria-expanded="false" title="Search" style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;flex:0 0 38px;padding:0;border:0;border-radius:50%;background:transparent;color:#fff;cursor:pointer;">' +

    '<svg viewBox="0 0 24 24" aria-hidden="true" style="display:block;width:21px;height:21px;"><circle cx="10.8" cy="10.8" r="6.8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +

    '</button>' +

    '<a class="portal-icon" href="portal.html" aria-label="Login" title="Login" style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;flex:0 0 38px;color:#fff;text-decoration:none;">' +

    '<svg viewBox="0 0 24 24" aria-hidden="true" style="display:block;width:23px;height:23px;"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 21c0-4.2 3.4-7 8-7s8 2.8 8 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +

    '</a>' +

    '<form class="search" id="sf" role="search" action="notices.html"><input id="q" name="q" placeholder="Search notices" aria-label="Search notices"></form>' +

    '</div>' +

    '<button class="burger" id="bg" type="button" aria-expanded="false" aria-controls="nav">Menu</button>' +

    '</div></div></header>';



  /* Footer. Icons reuse the inline-SVG ICON helper above (no extra library).

     Link rules: project pages where they exist; the URLs supplied for NSS,

     Accounts, Committee and AICTE otherwise. Social URLs: none exist yet, so

     the icons render inactive (see SOCIAL above). */

  /* Keep Quick Links short; student-facing resources belong under Information. */

  var FQ = [

    ["NSS", "https://www.gecbhojpur.org/wp-content/themes/theme-college/#", "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"],

    ["Accounts", "https://www.gecbhojpur.org/wp-content/themes/theme-college/#", "M3 7h18v12H3zM3 7l3-3h12l3 3M16 13h2"],

    ["Anti-ragging", "contact.html", "M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z"],

    ["Skill Development Mission", "https://www.gpp7.org.in/academics/skill-development/", "M12 3l2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5 12 3ZM18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"],

    ["AICTE BODY", "https://www.aicte-india.org/", "M12 3 3 8v2h18V8l-9-5ZM5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"]

  ];

  var FI = [

    ["Students Activity", "about.html#student-activities", "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16.5 5.5a3 3 0 0 1 0 5.5M18 14.8c1.8.7 3 2.3 3 5.2"],

    ["Grievance", "contact.html", "M4 5h16v11H9l-5 4V5Z"],

    ["Committee", "https://www.gecbhojpur.org/committee/", "M9 4h6v3H9zM6 5h3M15 5h3v15H6V5M9 11h6M9 15h4"],

    ["Research Innovation", "https://www.gpp7.org.in/academics/research-innovation/", "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M8 15h8"],

    ["RTI", "contact.html", "M6 3h8l4 4v14H6zM14 3v5h4M9 13h6M9 17h4"],

    ["Privacy policy", "contact.html", "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3"]

  ];

  function fList(list) {

    return '<ul class="f-links">' + list.map(function (l) {

      var ext = /^https?:/.test(l[1]);

      return '<li><a href="' + esc(l[1]) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + ICON(l[2]) + '<span>' + l[0] + '</span></a></li>';

    }).join("") + '</ul>';

  }

  var fSocial = '<div class="f-social" role="group" aria-label="Social media">' + SOCIAL.map(function (x) {

    var svg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + x.path + '" ' +

      (x.filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"') + '/></svg>';

    return x.url

      ? '<a href="' + esc(x.url) + '" target="_blank" rel="noopener" aria-label="' + x.name + '" title="' + x.name + '">' + svg + '</a>'

      : '<a class="is-inactive" aria-label="' + x.name + ' (link not yet added)" title="' + x.name + ' (link not yet added)" aria-disabled="true">' + svg + '</a>';

  }).join("") + '</div>';

  var fPhone = String(D.info.phone || "").replace(/[^0-9+]/g, "");

  var footerHTML =

    '<footer><div class="container"><div class="fg">' +

    '<div class="f-id"><img class="f-logo" src="assets/images/Transparent_logo.png" alt="Government Engineering College, Bhojpur logo">' +

    '<span class="f-id-divider" aria-hidden="true"></span><div class="f-details">' +

    '<h3 class="f-name">' + esc(D.info.name) + '</h3><ul class="f-contact">' +

    '<li>' + ICON("M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11ZM12 12.2a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z") + '<span>' + esc(D.info.address) + '</span></li>' +

    '<li>' + ICON("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z") + '<a href="tel:' + fPhone + '">' + esc(D.info.phone) + '</a></li>' +

    '<li>' + ICON("M4 6h16v12H4zM4 7l8 6 8-6") + '<a href="mailto:' + esc(D.info.email) + '">' + esc(D.info.email) + '</a></li>' +

    '<li>' + ICON("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z") + '<a href="https://www.gecbhojpur.org" target="_blank" rel="noopener">www.gecbhojpur.org</a></li>' +

    '</ul>' + fSocial + '</div></div>' +

    '<div class="f-column f-quick"><h3>Quick links</h3>' + fList(FQ) + '</div>' +

    '<div class="f-column f-information"><h3>Information</h3>' + fList(FI) + '</div>' +

    '<div class="f-column f-connect"><h3>Reach Us</h3>' +

    '<div class="f-map"><a class="f-map-link" href="https://maps.app.goo.gl/oXzDYShpRM3MG3qs6" target="_blank" rel="noopener" aria-label="Open Government Engineering College Bhojpur location in Google Maps">' +

    '<iframe title="Map showing Government Engineering College, Bhojpur" src="https://www.google.com/maps?q=Government%20Engineering%20College%20Bhojpur%2C%20Arrah%2C%20Bihar&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" tabindex="-1"></iframe>' +

    '<span class="f-map-caption">' + ICON("M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11ZM12 12.2a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z") + '<span>View campus location on Google Maps</span></span></a></div></div>' +

    '</div><div class="copy"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(D.info.name) + '. Government of Bihar.</span>' +

    '<span class="f-credit">Developed with <svg viewBox="0 0 24 24" aria-label="love" role="img"><path d="M20.8 8.8c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div></div></footer>';

  var h = $("#site-header"), f = $("#site-footer");

  if (h) h.innerHTML = headerHTML;

  if (f) f.innerHTML = footerHTML;

  var brandNameElement = h ? $(".brand-name", h) : null;





  /* Home page scroll header */

  function updateHeaderOnScroll() {

    var header = $(".site-header");

    if (!header || page !== "home") return;



    var scrolled = window.scrollY > 20;

    header.classList.toggle("is-scrolled", scrolled);

    header.classList.toggle("scrolled", scrolled);

    /* Remove the bilingual college name from the scrolled header itself.

       Restore the same element when the transparent header returns. */

    var brand = $(".brand", header);

    if (brandNameElement && brand) {

      if (scrolled && brandNameElement.parentNode) {

        brandNameElement.parentNode.removeChild(brandNameElement);

      } else if (!scrolled && !brandNameElement.parentNode) {

        brand.appendChild(brandNameElement);

      }

    }



    /* Keep the home icon visible and readable in both header states. */

    var homeIcon = $(".home-icon", header);

    if (homeIcon) homeIcon.style.color = scrolled ? "#172235" : "#FFFFFF";



    /* The login icon follows the header text colour; its SVG uses currentColor. */

    var portalIcon = $(".portal-icon", header);

    if (portalIcon) portalIcon.style.color = scrolled ? "#172235" : "#FFFFFF";

  }



  window.addEventListener("scroll", updateHeaderOnScroll, {

    passive: true

  });

  window.addEventListener("resize", updateHeaderOnScroll);



  updateHeaderOnScroll();





  var th = $("#th"), mTh = $("#m-th");

  function syncTheme() {
    var isDark = root.getAttribute("data-theme") === "dark";
    if (th) th.textContent = isDark ? "Light mode" : "Dark mode";
    if (mTh) {
      mTh.innerHTML = isDark ? M_SUN : M_MOON;
      mTh.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      mTh.setAttribute("title", isDark ? "Light mode" : "Dark mode");
    }
  }

  function toggleTheme() {
    var dark = root.getAttribute("data-theme") === "dark";
    if (dark) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", "dark");
    store.set("gec-theme", dark ? "light" : "dark");
    syncTheme();
  }

  syncTheme();
  if (th) th.onclick = toggleTheme;
  if (mTh) mTh.onclick = toggleTheme;

  var fs = $("#fs");

  if (fs) fs.onclick = function () { sizeIdx = (sizeIdx + 1) % 3; root.style.fontSize = sizes[sizeIdx] + "%"; store.set("gec-size", sizeIdx); };

  var bg = $("#bg");

  if (bg) bg.onclick = function () { var o = $("#nav").classList.toggle("open"); bg.setAttribute("aria-expanded", o); };

  var searchToggle = $("#search-toggle");

  var searchForm = $("#sf");

  if (searchToggle && searchForm) {

    searchToggle.onclick = function () {

      var isOpen = searchForm.classList.toggle("is-open");

      searchToggle.setAttribute("aria-expanded", String(isOpen));

      if (isOpen) {

        var searchInput = $("#q");

        if (searchInput) searchInput.focus();

      }

    };

  }

  if (searchForm) {

    document.addEventListener("click", function (e) {

      if (!searchForm.contains(e.target) && searchToggle && !searchToggle.contains(e.target)) {

        searchForm.classList.remove("is-open");

        if (searchToggle) searchToggle.setAttribute("aria-expanded", "false");

      }

    });

    searchForm.onsubmit = function (e) {

      var searchInput = $("#q");

      if (searchInput && searchInput.value.trim()) {

        searchForm.action = "notices.html";

      } else {

        e.preventDefault();

        if (searchInput) searchInput.focus();

      }

    };

  }



  /* ---------- Mobile header behaviour (elements always exist; CSS shows them <=760px) ---------- */

  (function () {

    var hdr = $(".site-header"), mBg = $("#m-bg"), mNav = $("#m-nav"),

        mSBtn = $("#m-search-toggle"), mSf = $("#m-sf"), mQ = $("#m-q"),

        dec = $("#fs-dec"), inc = $("#fs-inc"),
        nameHi = $(".m-name-hi", hdr), nameEn = $(".m-name-en", hdr);

    if (!hdr || !mBg || !mNav) return;

    function setMenu(open) {

      mNav.classList.toggle("open", open);

      mBg.setAttribute("aria-expanded", String(open));

      mBg.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    }

    function setSearch(open) {

      mSf.classList.toggle("is-open", open);

      mSBtn.setAttribute("aria-expanded", String(open));

      if (open && mQ) mQ.focus();

    }

    mBg.onclick = function () { var open = !mNav.classList.contains("open"); setMenu(open); if (open) setSearch(false); };

    mSBtn.onclick = function () { var open = !mSf.classList.contains("is-open"); setSearch(open); if (open) setMenu(false); };

    mSf.onsubmit = function (e) { if (!mQ.value.trim()) { e.preventDefault(); mQ.focus(); } };

    mNav.addEventListener("click", function (e) {

      var a = e.target.closest && e.target.closest("a");

      if (a && a.getAttribute("href") === "#") { e.preventDefault(); setMenu(false); }

    });

    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMenu(false); setSearch(false); } });

    window.addEventListener("resize", function () { if (window.innerWidth > 760) { setMenu(false); setSearch(false); } });



    /* A- / A+ share the existing text-size state (sizes, sizeIdx, "gec-size") */

    function applySize(i) {

      sizeIdx = Math.max(0, Math.min(sizes.length - 1, i));

      root.style.fontSize = sizes[sizeIdx] + "%"; store.set("gec-size", sizeIdx);

      dec.setAttribute("aria-disabled", String(sizeIdx === 0));

      inc.setAttribute("aria-disabled", String(sizeIdx === sizes.length - 1));

    }

    dec.onclick = function () { applySize(sizeIdx - 1); };

    inc.onclick = function () { applySize(sizeIdx + 1); };

    dec.setAttribute("aria-disabled", String(sizeIdx === 0));

    inc.setAttribute("aria-disabled", String(sizeIdx === sizes.length - 1));



    /* Rotate the mobile institution name between Hindi and English. */
    if (nameHi && nameEn) {
      window.setInterval(function () {
        var showEnglish = nameHi.hidden === false;
        var nextName = showEnglish ? nameEn : nameHi;
        var currentName = showEnglish ? nameHi : nameEn;
        currentName.hidden = true;
        nextName.hidden = false;
        nextName.classList.remove("is-flipping");
        void nextName.offsetWidth;
        nextName.classList.add("is-flipping");
      }, 3800);
    }

    /* Home page only (its header turns fixed on scroll): compact mobile header hides the slim bar and names.

       Inner-page headers scroll away with the page, exactly as before. */

    if (page === "home") {

      var onScroll = function () { hdr.classList.toggle("m-compact", (window.pageYOffset || 0) > 20); };

      window.addEventListener("scroll", onScroll, { passive: true });

      onScroll();

    }

  })();



  /* ---------- renderers ---------- */

  var R = {

    notices: function (el) {

      var lim = parseInt(el.getAttribute("data-limit") || "99", 10);

      el.innerHTML = sortedNotices().slice(0, lim).map(noticeItem).join("");

    },

    noticecol: function (el) {

      var col = el.getAttribute("data-col");

      var items = sortedNotices().filter(function (n) { return n.column === col && n.home !== false; });

      el.innerHTML = items.length

        ? '<div class="nb-track"><div class="nb-seq">' + items.map(noticeBoardItem).join("") + '</div></div>'

        : '<p class="nb-empty">No entries have been published yet.</p>';

      if (items.length) initNoticeScroll(el);

    },

    events: function (el) { el.innerHTML = D.events.map(function (e) { return '<div class="ev"><h3>' + esc(e.title) + '</h3><p>' + esc(e.text) + '</p></div>'; }).join(""); },

    news: function (el) {

      /* Dynamic Campus News renderer (variable-size masonry).

         Reads D.news.featured + D.news.list and renders every valid item.

         Supported fields (all optional except that an item needs a title,

         text or image): title, text, image | img | src, tag, meta, date,

         href | link | url. */

      var n = D.news || {};

      var list = Array.isArray(n.list) ? n.list : [];

      var fallbackImage = "assets/images/campus.jpg";

      var defaultHref = "notices.html";



      function isoDate(d) {

        return typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d) && !isNaN(new Date(d).getTime());

      }



      /* Normalise one data entry into a card model, or null if empty. */

      function toModel(item, featured) {

        if (!item || typeof item !== "object") return null;

        var title = item.title ? String(item.title).trim() : "";

        var text = item.text ? String(item.text).trim() : "";

        var image = item.image || item.img || item.src || "";

        if (!title && !text && !image) return null;



        var tag = item.tag ? String(item.tag).trim() : "";

        var parts = item.meta ? String(item.meta).split(/\s*·\s*/) : [];

        var rest = parts;

        if (!tag && parts.length) { tag = parts[0]; rest = parts.slice(1); }

        else if (tag && parts.length && parts[0].toLowerCase() === tag.toLowerCase()) { rest = parts.slice(1); }



        var dateIso = isoDate(item.date) ? String(item.date) : "";

        var dateText = dateIso ? fmt(dateIso) : (item.date ? String(item.date) : rest.join(" · "));



        return {

          featured: featured,

          title: title || "More campus updates",

          text: text,

          image: image || fallbackImage,

          tag: tag || "News",

          dateIso: dateIso,

          dateText: dateText,

          imageOnly: item.imageOnly === true,

          href: item.href || item.link || item.url || defaultHref

        };

      }



      function cardHTML(m) {

        var external = /^https?:\/\//i.test(m.href);



        /* Blood donation poster card: retain the complete poster and render its

           category, title, short description and View All link like the other cards. */

        if (m.imageOnly) {

          var imageDate = m.dateText

            ? '<span class="news-date">' + esc(m.dateText) + '</span>'

            : "";



          return '<a class="news-card is-image-only" href="' + esc(m.href) + '"' +

            (external ? ' target="_blank" rel="noopener"' : '') + '>' +

            '<div class="news-card-media">' +

            '<img class="news-card-blur" src="' + esc(m.image) + '" alt="" aria-hidden="true" loading="lazy" decoding="async">' +

            '<img class="news-card-main-image" src="' + esc(m.image) + '" alt="Blood donation camp poster" loading="lazy" decoding="async">' +

            '</div>' +

            '<div class="news-card-body">' +

            '<div class="news-card-meta"><span class="news-label">' + esc(m.tag) + '</span>' + imageDate + '</div>' +

            '<div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:10px;">' +

'<h3 style="margin:0;">' + esc(m.title) + '</h3>' +

'<span class="news-card-more" style="margin:0; padding:6px 0; white-space:nowrap;">Read more</span>' +

'</div>' +

'</div></a>';

        }

        var date = m.dateText

          ? (m.dateIso

              ? '<time class="news-date" datetime="' + esc(m.dateIso) + '">' + esc(m.dateText) + '</time>'

              : '<span class="news-date">' + esc(m.dateText) + '</span>')

          : "";

        return '<a class="news-card' + (m.featured ? ' is-featured' : '') + '" href="' + esc(m.href) + '"' +

          (external ? ' target="_blank" rel="noopener"' : '') + '>' +

          '<div class="news-card-media"><img src="' + esc(m.image) + '" alt="" loading="lazy" decoding="async"></div>' +

          '<div class="news-card-body">' +

          '<div class="news-card-meta"><span class="news-label">' + esc(m.tag) + '</span>' + date + '</div>' +

          '<h3>' + esc(m.title) + '</h3>' +

          (m.text ? '<p class="news-card-text">' + esc(m.text) + '</p>' : '') +

          '<span class="news-card-more">Read more</span>' +

          '</div></a>';

      }



      var models = [toModel(n.featured, true)];

      list.forEach(function (item) { models.push(toModel(item, false)); });

      /* Show only the first three news cards (the existing top row).

         Remaining news entries are intentionally not rendered in this section. */

      models = models.filter(Boolean).slice(0, 3);



      el.classList.add("news-mosaic");

      if (!models.length) {

        el.innerHTML = '<p class="news-empty">No campus news has been published yet.</p>';

        return;

      }

      el.innerHTML = models.map(cardHTML).join("");



      /* ---- masonry: true shortest-column placement on a 1px-row grid ----

         Every card is measured, then explicitly placed (grid-column +

         grid-row) in the currently shortest column. DOM order stays the

         reading/keyboard order; no card is ever stretched or cropped.



         Row-span maths. A card spanning n implicit rows occupies

           n * unit + (n - 1) * rowGap   pixels,

         where unit = grid-auto-rows (1px) and rowGap = the real vertical

         grid gap (0 in masonry mode). The visual space between cards is the

         --news-gap custom property, so we need

           n * unit + (n - 1) * rowGap >= height + spacing

         =>  n = ceil((height + spacing + rowGap) / (unit + rowGap)).

         The horizontal column-gap is deliberately NOT used here. */

      if (typeof el.__newsCleanup === "function") el.__newsCleanup();



      var cards = $$(".news-card", el);

      var queued = false;

      var frame = 0;

      var ro = null;



      function px(v, fallback) { var n = parseFloat(v); return isNaN(n) ? fallback : n; }



      function layout() {

        queued = false;

        if (!cards.length) return;



        /* Drop the previous placement first. A stale grid-column (e.g. 3

           after the grid shrank to 2 columns) would create phantom implicit

           columns and corrupt the column count read below. */

        cards.forEach(function (c) { c.style.gridColumn = ""; c.style.gridRow = ""; });



        /* read phase (no writes between reads, so no layout thrashing) */

        var cs = window.getComputedStyle(el);

        var cols = cs.gridTemplateColumns.split(/\s+/).filter(Boolean).length || 1;

        var unit = px(cs.gridAutoRows, 1) || 1;

        var rowGap = px(cs.rowGap, 0);

        var spacing = px(cs.getPropertyValue("--news-gap"), 20);

        var heights = cards.map(function (c) { return c.getBoundingClientRect().height; });



        /* write phase */

        var ends = [];

        for (var k = 0; k < cols; k++) ends.push(0);

        cards.forEach(function (c, i) {

          var col = 0;

          for (var j = 1; j < cols; j++) { if (ends[j] + 8 < ends[col]) col = j; }  /* 8px tolerance keeps near-ties in reading order */

          var span = Math.max(1, Math.ceil((heights[i] + spacing + rowGap) / (unit + rowGap)));

          c.style.gridColumn = String(col + 1);

          c.style.gridRow = (ends[col] + 1) + " / span " + span;

          ends[col] += span;

        });

      }



      function schedule() {

        if (queued) return;

        queued = true;

        frame = (window.requestAnimationFrame || window.setTimeout)(layout);

      }

      el.classList.add("is-masonry");



      $$("img", el).forEach(function (img) {

        var media = img.parentNode;

        function loaded() { media.classList.add("is-loaded"); schedule(); }

        function failed() {

          if (!img.getAttribute("data-fallback")) {

            img.setAttribute("data-fallback", "1");

            img.src = fallbackImage;

          } else {

            media.classList.add("is-broken");

            schedule();

          }

        }

        img.addEventListener("load", loaded);

        img.addEventListener("error", failed);

        if (img.complete) { if (img.naturalWidth) loaded(); else if (img.getAttribute("src")) failed(); }

      });



      /* One observer for all cards: catches image loads, font swaps, text

         reflow and column-width changes. layout() only writes grid

         placement, which never changes a card's own size, so no loop. */

      if (window.ResizeObserver) {

        ro = new ResizeObserver(schedule);

        cards.forEach(function (c) { ro.observe(c); });

      }

      window.addEventListener("resize", schedule);

      window.addEventListener("load", schedule);

      if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);



      el.__newsCleanup = function () {

        if (ro) ro.disconnect();

        window.removeEventListener("resize", schedule);

        window.removeEventListener("load", schedule);

        if (frame && window.cancelAnimationFrame) window.cancelAnimationFrame(frame);

        el.__newsCleanup = null;

      };

      schedule();

    },

    depts: function (el) { el.innerHTML = D.depts.map(function (d) { return '<a href="departments.html#' + d.slug + '"><h3>' + esc(d.name) + '</h3><span>B.Tech · 4 years</span></a>'; }).join(""); },

    deptsFull: function (el) {

      el.innerHTML = D.depts.map(function (d) {

        return '<article class="box" id="' + d.slug + '"><h3>' + esc(d.name) + '</h3><p class="muted">Four-year B.Tech programme.</p><dl class="dl">' +

          '<dt>Seat intake</dt><dd class="todo">To be confirmed</dd><dt>Head of department</dt><dd class="todo">To be added</dd>' +

          '<dt>Faculty</dt><dd class="todo">To be added</dd><dt>Laboratories</dt><dd class="todo">To be added</dd></dl></article>';

      }).join("");

    },

    activities: function (el) { el.innerHTML = D.activities.map(function (a) { return '<a href="contact.html">' + esc(a) + '</a>'; }).join(""); },

    stats: function (el) {

      el.innerHTML = D.stats.map(function (s) {

        return '<div><b>' + (s.value === null ? "—" : esc(s.value)) + '</b><span>' + esc(s.label) + (s.value === null ? " (to be published)" : "") + '</span></div>';

      }).join("");

    },

    quick: function (el) { el.innerHTML = D.quick.map(function (q) { return '<a href="' + q.href + '">' + esc(q.label) + '<span aria-hidden="true">›</span></a>'; }).join(""); },

    gallery: function (el) {

      el.innerHTML = D.gallery.map(function (g, i) {

        var tileVideo = g.video

          ? '<video src="' + esc(g.video) + '" autoplay muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none"></video>'

          : '';

        return '<button type="button" data-i="' + i + '"' + (i > 4 ? ' class="gal-extra"' : '') + ' style="--img:url(\'' + esc(g.src) + '\');--fallback:linear-gradient(135deg,#861C1C,#3B1010)">' + tileVideo + '<span style="position:relative;z-index:1">' + esc(g.caption) + '</span></button>';

      }).join("");

      var gi = 0;

      var lb = document.createElement("div");

      lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Gallery viewer");

      lb.innerHTML = '<button type="button" id="lx" style="top:16px;right:16px" aria-label="Close">×</button><button type="button" id="lp" style="left:16px" aria-label="Previous">‹</button><div class="pic" id="lc"></div><button type="button" id="ln" style="right:16px" aria-label="Next">›</button>';

      document.body.appendChild(lb);

      function show(i) {

        gi = (i + D.gallery.length) % D.gallery.length; var g = D.gallery[gi];

        var pic = $("#lc", lb);

        pic.textContent = g.caption;                    /* also removes any video left from the previous item */

        pic.classList.toggle("is-video", !!g.video);

        if (g.video) {

          var vid = document.createElement("video");

          vid.src = g.video; vid.controls = true; vid.autoplay = true; vid.playsInline = true; vid.preload = "auto";

          vid.setAttribute("aria-label", g.caption);

          pic.style.backgroundImage = "";

          pic.insertBefore(vid, pic.firstChild);

          var started = vid.play(); if (started && started.catch) started.catch(function () {});   /* browser may block autoplay; controls remain */

        } else {

          pic.style.backgroundImage = "linear-gradient(0deg,rgba(59,16,16,.75),transparent 50%), url('" + g.src + "'), linear-gradient(135deg,#861C1C,#3B1010)";

        }

        lb.classList.add("on"); $("#lx", lb).focus();

      }

      function hide() { var vid = $("video", lb); if (vid) vid.pause(); lb.classList.remove("on"); }

      $$("button", el).forEach(function (b) { b.onclick = function () { show(parseInt(b.getAttribute("data-i"), 10)); }; });

      $("#lx", lb).onclick = hide;

      $("#lp", lb).onclick = function () { show(gi - 1); };

      $("#ln", lb).onclick = function () { show(gi + 1); };

      lb.addEventListener("click", function (e) { if (e.target === lb) hide(); });

      document.addEventListener("keydown", function (e) {

        if (!lb.classList.contains("on")) return;

        if (e.key === "Escape") hide();

        if (e.key === "ArrowLeft") show(gi - 1);

        if (e.key === "ArrowRight") show(gi + 1);

      });

    }

  };

  $$("[data-render]").forEach(function (el) { var fn = R[el.getAttribute("data-render")]; if (fn) fn(el); });



 $$("main h2, main h3, main h4").forEach(function (heading) {

  if (heading.closest(".campus-overlay, .news-card")) return;



  var text = heading.textContent.trim();

  var firstSpace = text.indexOf(" ");



  if (firstSpace === -1 || heading.querySelector(".heading-accent")) return;



  var firstWord = text.slice(0, firstSpace);

  var remainingText = text.slice(firstSpace + 1);



  heading.innerHTML =

    '<span class="heading-accent">' + esc(firstWord) + '</span> ' +

    '<span class="heading-rest">' + esc(remainingText) + '</span>';

});

  /* ---------- hero video: falls back silently if the file is missing ---------- */

  var v = $(".hero video");

  if (v) {

    var src = v.querySelector("source");

    var conn = navigator.connection || {};

    if (matchMedia("(prefers-reduced-motion: reduce)").matches || conn.saveData) v.remove();

    else if (src) src.addEventListener("error", function () { v.remove(); });

  }

  var campus = $(".campus");

  if (campus) campus.style.setProperty("--img", "url('assets/images/campus.jpg')");



  /* Campus statistics parallax. The photo layer (.campus-background) is taller

     than the section; while the section crosses the screen it is translated by

     up to the available spare height, so it moves slower than the page.

     Scroll-linked via requestAnimationFrame; listeners run only while visible.

     Reduced-motion and phones keep a static photo. */

  var campusImg = campus && campus.querySelector(".campus-background");

  if (campusImg && !matchMedia("(prefers-reduced-motion: reduce)").matches) {

    var cQueued = false, cListening = false;

    var cUpdate = function () {

      cQueued = false;

      if (matchMedia("(max-width: 760px)").matches) {

        campusImg.style.transform = "";

        return;

      }

      var r = campus.getBoundingClientRect(), vh = window.innerHeight;

      var room = (campusImg.offsetHeight - campus.offsetHeight) / 2;

      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));

      var y = (p - 0.5) * 2 * Math.max(0, room - 1);

      campusImg.style.transform = "translate3d(0, calc(-50% + " + y.toFixed(1) + "px), 0)";

    };

    var cRequest = function () { if (!cQueued) { cQueued = true; requestAnimationFrame(cUpdate); } };

    var cStart = function () {

      if (!cListening) { cListening = true; addEventListener("scroll", cRequest, { passive: true }); addEventListener("resize", cRequest, { passive: true }); }

      cRequest();

    };

    var cStop = function () {

      if (cListening) { cListening = false; removeEventListener("scroll", cRequest); removeEventListener("resize", cRequest); }

    };

    if ("IntersectionObserver" in window) {

      new IntersectionObserver(function (en) { if (en[0].isIntersecting) cStart(); else cStop(); }, { rootMargin: "120px" }).observe(campus);

    } else cStart();

  }



  /* ---------- Notices page ---------- */

  if (page === "notices") {

    var params = new URLSearchParams(location.search), cat = params.get("c") || "All";

    var nq = $("#nq"), list = $("#nlist"), colFilter = params.get("col") || "";

    nq.value = params.get("q") || "";

    var draw = function () {

      var q = nq.value.toLowerCase();

      var r = sortedNotices().filter(function (n) { return (cat === "All" || n.category === cat) && (!colFilter || n.column === colFilter) && n.title.toLowerCase().indexOf(q) > -1; });

      list.innerHTML = r.length ? r.map(noticeItem).join("") : '<li><div>No notices match. Clear the search or choose another category.</div></li>';

    };

    nq.oninput = draw;

    $$("[data-c]").forEach(function (b) {

      b.classList.toggle("on", b.getAttribute("data-c") === cat);

      b.onclick = function () { cat = b.getAttribute("data-c"); $$("[data-c]").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); };

    });

    draw();

  }



  /* ---------- Portal page (UI only, no backend yet) ---------- */

  if (page === "portal") {

    var role = "Student", labels = { Student: "Registration number", Faculty: "Employee ID", Admin: "Admin ID" };

    $$("#roles button").forEach(function (b) {

      b.onclick = function () {

        role = b.textContent; $$("#roles button").forEach(function (x) { x.classList.toggle("on", x === b); });

        $("#ul").textContent = labels[role]; $("#lm").hidden = true;

      };

    });

    $("#lf").onsubmit = function (e) {

      e.preventDefault(); var m = $("#lm"); m.hidden = false;

      m.textContent = role + " sign-in is not available yet. The portal backend has not been connected, and nothing you typed was sent anywhere.";

    };

  }



  /* ---------- Contact page: opens the visitor's email app ---------- */

  if (page === "contact") {

    $("#cf").onsubmit = function (e) {

      e.preventDefault();

      var body = "Name: " + $("#cn").value + "\nEmail: " + $("#ce").value + "\n\n" + $("#cm").value;

      location.href = "mailto:" + D.info.email + "?subject=" + encodeURIComponent("Enquiry from website") + "&body=" + encodeURIComponent(body);

    };

  }

})();





/* ---------- Startup section image rotation ---------- */

/* Uses images already rendered in Campus News; no extra library required. */

(function () {

  "use strict";

  var section = document.querySelector(".startups-section");

  if (!section) return;



  var cards = Array.prototype.slice.call(section.querySelectorAll(".startup-card"));

  var imagePool = [];

  var newsImages = document.querySelectorAll(".news-card, .news-card-image, .gal button");



  function addImage(url) {

    if (!url || url.indexOf("data:") === 0) return;

    if (imagePool.indexOf(url) === -1) imagePool.push(url);

  }



  Array.prototype.forEach.call(newsImages, function (item) {

    var bg = window.getComputedStyle(item).backgroundImage || "";

    var match;

    var pattern = /url\(\s*(['"]?)(.*?)\1\s*\)/g;

    while ((match = pattern.exec(bg)) !== null) addImage(match[2]);

    var img = item.querySelector && item.querySelector("img");

    if (img && img.src) addImage(img.src);

  });



  cards.forEach(function (card) {

    var img = card.querySelector(".startup-image");

    if (img && img.src) addImage(img.src);

  });



  if (imagePool.length < 2 || cards.length === 0) return;



  var offsets = cards.map(function (_, i) { return i % imagePool.length; });

  window.setInterval(function () {

    cards.forEach(function (card, index) {

      var img = card.querySelector(".startup-image");

      if (!img) return;

      offsets[index] = (offsets[index] + 1) % imagePool.length;

      var nextSrc = imagePool[offsets[index]];

      if (img.src === nextSrc) return;

      img.classList.add("is-changing");

      window.setTimeout(function () {

        img.src = nextSrc;

        img.onload = function () { img.classList.remove("is-changing"); };

        window.setTimeout(function () { img.classList.remove("is-changing"); }, 450);

      }, 180);

    });

  }, 4000);

})();
