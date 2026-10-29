(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduce-motion');
  root.classList.add('has-js');

  const header = document.getElementById('header');
  const progress = document.getElementById('progress');
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  let scrollQueued = false;

  function updateScrollState() {
    const y = window.scrollY || 0;
    header.classList.toggle('scrolled', y > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;
    scrollQueued = false;
  }

  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateScrollState);
  }, { passive: true });
  updateScrollState();

  function closeMobileNav() {
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.inert = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-open');
  }

  burger.addEventListener('click', () => {
    const opening = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(opening));
    burger.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
    mobileNav.setAttribute('aria-hidden', String(!opening));
    mobileNav.inert = !opening;
    mobileNav.classList.toggle('open', opening);
    document.body.classList.toggle('menu-open', opening);
  });

  mobileNav.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (link) closeMobileNav();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      closeMobileNav();
      burger.focus({ preventScroll: true });
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820 && burger.getAttribute('aria-expanded') === 'true') closeMobileNav();
  }, { passive: true });

  const heroScene = document.getElementById('heroScene');
  if (heroScene && !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const depths = new Map([
      ['.hero-layer--background', -5],
      ['.hero-layer--subject', -12],
      ['.hero-layer--glass', 12],
      ['.hero-layer--stones', -21]
    ]);
    const layers = [...depths.entries()].map(([selector, depth]) => [heroScene.querySelector(selector), depth]).filter(([element]) => element);

    heroScene.addEventListener('pointermove', event => {
      const bounds = heroScene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      layers.forEach(([element, depth]) => {
        element.style.setProperty('--shift-x', `${x * depth}px`);
        element.style.setProperty('--shift-y', `${y * depth * .7}px`);
      });
    });
    heroScene.addEventListener('pointerleave', () => {
      layers.forEach(([element]) => {
        element.style.setProperty('--shift-x', '0px');
        element.style.setProperty('--shift-y', '0px');
      });
    });
  }

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -3% 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  const treatmentSelect = document.getElementById('guestTreatment');
  document.querySelectorAll('[data-treatment]').forEach(link => {
    link.addEventListener('click', () => {
      if (treatmentSelect) treatmentSelect.value = link.dataset.treatment;
    });
  });

  const dateInput = document.getElementById('guestDate');
  if (dateInput) {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = localDate;
  }

  const bookingForm = document.getElementById('bookingForm');
  const formStatus = document.getElementById('formStatus');
  const copyButton = document.getElementById('copyEnquiry');
  const copyStatus = document.getElementById('copyStatus');
  let latestEnquiryText = '';

  if (bookingForm) {
    bookingForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!bookingForm.reportValidity()) return;

      const data = new FormData(bookingForm);
      const value = key => String(data.get(key) || '').trim();
      const recipient = 'sierra@recoverrevenue.company';
      const subject = `ALBA enquiry — ${value('treatment') || 'treatment'}`;
      const message = [
        'ALBA appointment enquiry',
        '',
        `Name: ${value('name')}`,
        `Email: ${value('email')}`,
        `Treatment: ${value('treatment')}`,
        `Preferred date: ${value('date') || 'Flexible / not specified'}`,
        `Preferred time: ${value('time') || 'Flexible / not specified'}`,
        '',
        'Note:',
        value('note') || 'No additional note'
      ].join('\n');

      latestEnquiryText = `To: ${recipient}\nSubject: ${subject}\n\n${message}`;
      formStatus.hidden = false;
      copyStatus.textContent = '';
      copyButton.hidden = false;

      const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      window.location.href = mailto;
    });
  }

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      if (!latestEnquiryText) return;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(latestEnquiryText);
        } else {
          const helper = document.createElement('textarea');
          helper.value = latestEnquiryText;
          helper.setAttribute('readonly', '');
          helper.style.position = 'fixed';
          helper.style.opacity = '0';
          document.body.appendChild(helper);
          helper.select();
          const copied = document.execCommand('copy');
          helper.remove();
          if (!copied) throw new Error('Clipboard unavailable');
        }
        copyStatus.textContent = 'Copied — paste it into your email app.';
      } catch {
        copyStatus.textContent = 'Copy is unavailable here. Email the ALBA team directly.';
      }
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
