(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = matchMedia('(min-width: 1001px)');
  const nav = document.querySelector('#main-nav');
  
  if (nav) {
    const indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    nav.append(indicator);

    function updateIndicator() {
      const current = nav.querySelector('a.active');
      if (!current || !desktop.matches) {
        indicator.style.opacity = '0';
        return;
      }
      indicator.style.transform = `translate(${current.offsetLeft}px, ${current.offsetTop}px) scale(${current.offsetWidth / 100}, ${current.offsetHeight / 44})`;
      indicator.style.opacity = '1';
      nav.classList.add('indicator-ready');
    }
    const mutation = new MutationObserver(updateIndicator);
    nav.querySelectorAll('a').forEach(link => mutation.observe(link, { attributes: true, attributeFilter: ['class'] }));
    new ResizeObserver(updateIndicator).observe(nav);
    document.fonts.ready.then(updateIndicator);
    updateIndicator();
  }

  // Global Dynamic Cursor Spotlight & Interactive Following Animation
  const spotlight = document.getElementById('cursor-spotlight');
  let cursorDot = document.getElementById('cursor-dot');
  
  if (!cursorDot && pointer.matches) {
    cursorDot = document.createElement('div');
    cursorDot.id = 'cursor-dot';
    cursorDot.className = 'cursor-dot';
    cursorDot.setAttribute('aria-hidden', 'true');
    document.body.prepend(cursorDot);
  }

  if (pointer.matches && !reduced.matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isMoving = false;
    let isHovering = false;

    window.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!isMoving) {
        isMoving = true;
        if (spotlight) spotlight.style.opacity = '1';
        if (cursorDot) cursorDot.style.opacity = '1';
      }

      if (cursorDot) {
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) ${isHovering ? 'scale(2.2)' : 'scale(1)'}`;
      }
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      isMoving = false;
      if (spotlight) spotlight.style.opacity = '0';
      if (cursorDot) cursorDot.style.opacity = '0';
    });

    // Smooth physics loop for ambient spotlight
    function animateSpotlight() {
      if (isMoving && spotlight) {
        currentX += (mouseX - currentX) * 0.12;
        currentY += (mouseY - currentY) * 0.12;
        spotlight.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(animateSpotlight);
    }
    requestAnimationFrame(animateSpotlight);

    // Hover detection for dynamic cursor expansion
    const interactiveTargets = 'a, button, .bento-card, .matrix-card, .nexus-badge, .kpi-block, .publication-row, .news-card, .news-lead-spread, .dispatch-card, .chronicle-item, .orbit-tag, .orbit-chip, .director-profile, .news-circle-arrow, .editorial-arrow-btn, .lead-action-link';
    document.querySelectorAll(interactiveTargets).forEach(el => {
      el.addEventListener('pointerenter', () => {
        isHovering = true;
        if (cursorDot) {
          cursorDot.classList.add('is-hovered');
          cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(2.2)`;
        }
      });
      el.addEventListener('pointerleave', () => {
        isHovering = false;
        if (cursorDot) {
          cursorDot.classList.remove('is-hovered');
          cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(1)`;
        }
      });
    });
  }

  // Interactive Card-Level Mouse Spotlight & 3D Tilt Physics
  const targetCards = document.querySelectorAll('.bento-card, .matrix-card, .publication-row, .news-card, .news-lead-spread, .dispatch-card, .director-profile, .residency-copy');
  targetCards.forEach(card => {
    card.classList.add('interactive-card');
    
    card.addEventListener('pointermove', event => {
      if (reduced.matches || !pointer.matches || event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // High-precision smooth 3D tilt
      const normX = (x / rect.width - 0.5);
      const normY = (y / rect.height - 0.5);
      const maxTilt = (card.classList.contains('bento-card') || card.classList.contains('matrix-card')) ? 6 : 4;
      card.style.transform = `perspective(1000px) translateY(-6px) rotateX(${-normY * maxTilt}deg) rotateY(${normX * maxTilt}deg)`;
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('transform');
      card.style.setProperty('--mouse-x', '-500px');
      card.style.setProperty('--mouse-y', '-500px');
    });
  });

  // Research Matrix & Central Nexus Resonance
  const nexusBadges = document.querySelectorAll('.nexus-badge');
  const matrixCards = document.querySelectorAll('.matrix-card');
  const nexusOrb = document.querySelector('.nexus-core-orb');

  if (nexusBadges.length && matrixCards.length) {
    matrixCards.forEach(card => {
      const targetId = card.id;
      const matchingBadge = document.querySelector(`.nexus-badge[data-target="${targetId}"]`);
      
      card.addEventListener('pointerenter', () => {
        if (matchingBadge) matchingBadge.classList.add('is-active');
        if (nexusOrb) nexusOrb.style.transform = 'scale(1.1) rotate(6deg)';
      });
      card.addEventListener('pointerleave', () => {
        if (matchingBadge) matchingBadge.classList.remove('is-active');
        if (nexusOrb) nexusOrb.style.removeProperty('transform');
      });
    });

    nexusBadges.forEach(badge => {
      const targetId = badge.dataset.target;
      const matchingCard = document.getElementById(targetId);

      badge.addEventListener('pointerenter', () => {
        if (matchingCard) {
          matchingCard.style.borderColor = 'var(--mint-400)';
          matchingCard.style.boxShadow = '0 24px 56px -12px rgba(9, 42, 38, 0.2), 0 0 24px rgba(134, 231, 196, 0.4)';
        }
        if (nexusOrb) nexusOrb.style.transform = 'scale(1.12)';
      });
      badge.addEventListener('pointerleave', () => {
        if (matchingCard) {
          matchingCard.style.removeProperty('border-color');
          matchingCard.style.removeProperty('box-shadow');
        }
        if (nexusOrb) nexusOrb.style.removeProperty('transform');
      });
      badge.addEventListener('click', () => {
        if (matchingCard) {
          matchingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          matchingCard.focus({ preventScroll: true });
        }
      });
    });
  }
  // Hero Orbital Interactive System
  const art = document.querySelector('.interactive-orbit');
  if (art) {
    const diagram = art.querySelector('.orbital');
    const controls = document.querySelector('.orbit-controls');
    const en = document.documentElement.lang === 'en';
    let angle = 0;
    let drag = null;
    let frame = 0;
    let lastPointer = null;

    function setRotation(value) {
      angle = Math.max(-180, Math.min(180, Math.round(value)));
      art.style.setProperty('--orbit-angle', `${angle}deg`);
      if (controls) {
        const slider = controls.querySelector('input');
        const output = controls.querySelector('output');
        if (slider) {
          slider.value = String(angle);
          slider.setAttribute('aria-valuetext', `${angle} ${en ? 'degrees' : 'độ'}`);
        }
        if (output) output.value = `${angle}°`;
      }
    }

    if (controls) {
      controls.hidden = false;
      const slider = controls.querySelector('input');
      if (slider) slider.addEventListener('input', () => setRotation(Number(slider.value)));
      const resetBtn = controls.querySelector('button');
      if (resetBtn) resetBtn.addEventListener('click', () => setRotation(0));
    }
    art.classList.add('orbit-ready');
    setRotation(0);

    if (diagram) {
      diagram.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.button !== 0) return;
        drag = { id: event.pointerId, x: event.clientX, angle, width: diagram.getBoundingClientRect().width };
        diagram.setPointerCapture(event.pointerId);
        art.classList.add('is-dragging');
      });

      function updatePointer() {
        frame = 0;
        if (!lastPointer) return;
        if (drag) setRotation(drag.angle + (lastPointer.x - drag.x) / drag.width * 240);
        if (!reduced.matches && pointer.matches && lastPointer.type !== 'touch') {
          const box = diagram.getBoundingClientRect();
          const x = (lastPointer.x - box.left) / box.width - .5;
          const y = (lastPointer.y - box.top) / box.height - .5;
          diagram.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`;
        }
      }

      diagram.addEventListener('pointermove', event => {
        if (!event.isPrimary || (drag && event.pointerId !== drag.id)) return;
        lastPointer = { x: event.clientX, y: event.clientY, type: event.pointerType };
        if (!frame) frame = requestAnimationFrame(updatePointer);
      }, { passive: true });

      function stopDrag() {
        if (frame) { cancelAnimationFrame(frame); updatePointer(); }
        drag = null;
        art.classList.remove('is-dragging');
      }

      diagram.addEventListener('pointerup', stopDrag);
      diagram.addEventListener('pointercancel', stopDrag);
      diagram.addEventListener('lostpointercapture', stopDrag);
      diagram.addEventListener('pointerleave', () => {
        if (!drag) {
          cancelAnimationFrame(frame);
          frame = 0;
          diagram.style.removeProperty('transform');
        }
      });
    }

    reduced.addEventListener('change', () => {
      if (diagram) diagram.style.removeProperty('transform');
    });

    art.querySelectorAll('[data-orbit-focus]').forEach(link => {
      const highlight = () => { art.dataset.focus = link.dataset.orbitFocus; };
      const clear = () => { delete art.dataset.focus; };
      link.addEventListener('pointerenter', highlight);
      link.addEventListener('pointerleave', clear);
      link.addEventListener('focus', highlight);
      link.addEventListener('blur', clear);
      link.addEventListener('click', () => {
        const target = document.getElementById(link.hash.slice(1));
        if (target) {
          target.classList.remove('is-pending');
          target.focus({ preventScroll: true });
        }
      });
    });

    const heroLayout = document.querySelector('.hero-layout');
    if (heroLayout) {
      heroLayout.addEventListener('pointermove', event => {
        if (reduced.matches || !pointer.matches || event.pointerType === 'touch' || art.classList.contains('is-dragging')) return;
        const rect = art.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        if (Math.abs(x) < 1.2 && Math.abs(y) < 1.2) {
          art.style.transform = `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-4px)`;
        }
      });
      heroLayout.addEventListener('pointerleave', () => {
        art.style.removeProperty('transform');
      });
    }
  }

  // Scroll Spy for Residency navigation
  const localLinks = [...document.querySelectorAll('.residency-nav a')];
  if (localLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        localLinks.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    localLinks.forEach(link => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) observer.observe(section);
    });
  }

  // Editorial News & Milestones Scroll Trigger (Heading Glow & Underline Draw)
  const newsEditorial = document.querySelector('.news-editorial-section');
  if (newsEditorial && 'IntersectionObserver' in window) {
    const newsHeader = newsEditorial.querySelector('.news-editorial-header');
    const newsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          newsEditorial.classList.add('is-in-view');
          if (newsHeader) newsHeader.classList.add('is-in-view');
          newsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    newsObserver.observe(newsEditorial);
  }
})();
