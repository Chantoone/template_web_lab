(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#main-nav');
  const mobile = window.matchMedia('(max-width: 1000px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setMenu(open, restoreFocus = false) {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? toggle.dataset.closeLabel : toggle.dataset.openLabel);
    if (restoreFocus) toggle.focus();
  }

  header.classList.add('menu-ready');
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    setMenu(false);
    // Keep keyboard focus in visible content after closing the mobile menu.
    if (mobile.matches && link.hash && link.pathname === location.pathname) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) setMenu(false, true);
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  header.addEventListener('focusout', (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => ({ link, section: document.querySelector(link.hash) })).filter(item => item.section);
  let ticking = false;
  function updateNavigation() {
    const point = window.scrollY + header.offsetHeight + 100;
    let current = sections[0];
    sections.forEach(item => { if (item.section.offsetTop <= point) current = item; });
    sections.forEach(({ link }) => {
      const active = link === current?.link;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateNavigation); }
  }, { passive: true });
  window.addEventListener('resize', updateNavigation, { passive: true });
  window.addEventListener('load', updateNavigation);
  updateNavigation();

  if (!('IntersectionObserver' in window)) return;
  const revealElements = [...document.querySelectorAll('.reveal')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-pending');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

  if (!reducedMotion.matches) {
    revealElements.forEach(element => {
      if (element.getBoundingClientRect().top > innerHeight) {
        element.classList.add('is-pending');
        if (element.matches('.bento-card, .card, .role, .publication-list > li')) {
          element.style.setProperty('--reveal-delay', `${Math.min([...element.parentElement.children].indexOf(element), 3) * 45}ms`);
        }
        observer.observe(element);
      }
    });
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      revealElements.forEach(element => element.classList.remove('is-pending'));
      observer.disconnect();
    }
  });
  // Pause ambient movement whenever the decorative diagram is off screen.
  const art = document.querySelector('.hero-art');
  const artObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
  });
  if (art) artObserver.observe(art);
})();

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const labels = {
    query: 'Receiving user query',
    scan: 'Analyzing visual features',
    result: 'Reasoning complete'
  };
  const steps = ['query', 'scan', 'result'];

  document.querySelectorAll('[data-vision-demo]').forEach(demo => {
    const wrap = demo.closest('.vision-demo-wrap');
    const status = demo.querySelector('[data-demo-status]');
    let index = 0;
    let timer;

    function render(step) {
      index = steps.indexOf(step);
      demo.dataset.step = step;
      wrap.classList.toggle('result-visible', step === 'result');
      if (status) status.textContent = labels[step];
    }

    function schedule(delay = 1400) {
      clearTimeout(timer);
      if (reducedMotion.matches || document.hidden) return;
      timer = setTimeout(() => {
        render(steps[(index + 1) % steps.length]);
        schedule(index === 2 ? 2800 : 1500);
      }, delay);
    }

    function syncMotionPreference() {
      if (reducedMotion.matches) render('result');
      else {
        render('query');
        schedule();
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimeout(timer);
      else schedule(500);
    });
    reducedMotion.addEventListener('change', syncMotionPreference);
    syncMotionPreference();
  });
})();
