(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncToggle() {
    if (!btn) return;
    var dark = currentTheme() === 'dark';
    var label = dark ? 'Switch to light theme' : 'Switch to dark theme';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  }
  if (btn) {
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncToggle();
    });
    syncToggle();
  }

  // Reveal on scroll (respects prefers-reduced-motion)
  var targets = document.querySelectorAll('[data-reveal], .rcard, .pub, .pcard, .tl-item');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  // Nav: scrolled state + active section
  var nav = document.querySelector('.topnav');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  function update() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
    var current = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top - 120 <= 0) current = sections[i].id;
    }
    links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(function () { update(); ticking = false; }); ticking = true; }
  }, { passive: true });
  update();

  // Print: expand all abstracts
  window.addEventListener('beforeprint', function () {
    Array.prototype.forEach.call(document.querySelectorAll('details'), function (d) { d.setAttribute('open', ''); });
  });
})();
