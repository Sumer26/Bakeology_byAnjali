
/* BAKEOLOGY — EXPERIENCE V2 */

(() => {
  'use strict';

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero-visual');

  const chapters = [
    ...document.querySelectorAll('[data-scene]')
  ];

  const photos = [
    ...document.querySelectorAll('[data-scene-photo]')
  ];

  const imageDescription = document.getElementById(
    'atelier-image-description'
  );

  const photoIndex = document.getElementById(
    'atelier-photo-index'
  );

  const meter = document.getElementById(
    'atelier-meter-fill'
  );

  /* SCROLL PROGRESS INDICATOR */

  const progress = document.createElement('div');

  progress.className = 'site-scrollbar';
  progress.setAttribute('aria-hidden', 'true');

  document.body.prepend(progress);

  let activeScene = 0;
  let scheduled = false;

  const descriptions = [
    'Peach-coloured two-tier cake with piped roses and ribbons',
    'Chocolate cake with cherries and pink piped details',
    'Powder-blue cake with ribbons, pearls and white piping'
  ];

  /* ATELIER IMAGE TRANSITIONS */

  function setScene(index) {
    if (activeScene === index) return;

    activeScene = index;

    chapters.forEach((el, i) => {
      el.classList.toggle('is-current', i === index);
    });

    photos.forEach((el, i) => {
      el.classList.toggle('is-current', i === index);
    });

    if (imageDescription) {
      imageDescription.setAttribute(
        'aria-label',
        descriptions[index]
      );
    }

    if (photoIndex) {
      photoIndex.textContent = `0${index + 1} / 03`;
    }

    if (meter) {
      meter.style.transform =
        `scaleX(${(index + 1) / 3})`;
    }
  }

  /* SCROLL EFFECTS */

  function updateScroll() {
    scheduled = false;

    const scrollable =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const amount = scrollable > 0
      ? Math.min(
          1,
          Math.max(0, window.scrollY / scrollable)
        )
      : 0;

    progress.style.transform = `scaleX(${amount})`;

    header?.classList.toggle(
      'is-scrolled',
      window.scrollY > 18
    );

    // Subtle hero photography parallax.
    if (hero && !reducedMotion) {
      const r = hero.getBoundingClientRect();

      if (r.bottom > 0 && r.top < window.innerHeight) {
        const shift = Math.max(
          -45,
          Math.min(45, -r.top * 0.075)
        );

        hero.style.setProperty(
          '--hero-shift',
          `${shift}px`
        );
      }
    }

    // Determine which chapter is nearest to the
    // reading position in the viewport.
    if (chapters.length) {
      const scanY = window.innerHeight *
        (window.innerWidth < 761 ? 0.72 : 0.54);

      let chosen = 0;
      let closest = Infinity;

      chapters.forEach((chapter, i) => {
        const rect = chapter.getBoundingClientRect();

        const distance = scanY < rect.top
          ? rect.top - scanY
          : scanY > rect.bottom
            ? scanY - rect.bottom
            : 0;

        if (distance < closest) {
          closest = distance;
          chosen = i;
        }
      });

      setScene(chosen);
    }
  }

  function scheduleScroll() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updateScroll);
    }
  }

  window.addEventListener(
    'scroll',
    scheduleScroll,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    scheduleScroll,
    { passive: true }
  );

  chapters[0]?.classList.add('is-current');

  updateScroll();

  /* INTERACTIVE CAKE CONSULTATION */

  const form = document.getElementById('studio-form');

  if (!form) return;

  const steps = [
    ...form.querySelectorAll('[data-studio-step]')
  ];

  const back = document.getElementById('studio-back');
  const next = document.getElementById('studio-next');
  const send = document.getElementById('studio-send');

  const stepIndicator = document.getElementById(
    'studio-step-indicator'
  );

  const stepBar = document.getElementById(
    'studio-progress-bar'
  );

  const summary = document.getElementById(
    'studio-summary'
  );

  const preview = document.getElementById(
    'studio-inspiration'
  );

  const previewName = document.getElementById(
    'studio-image-name'
  );

  const dateInput = document.getElementById(
    'studio-date'
  );

  let currentStep = 0;

  // Restrict dates to today or later, using the
  // visitor's local time rather than UTC.
  if (dateInput) {
    const today = new Date();

    const localDate = new Date(
      today.getTime() -
      today.getTimezoneOffset() * 60_000
    );

    dateInput.min = localDate.toISOString().slice(0, 10);
  }

  function field(name) {
    return form.elements.namedItem(name);
  }

  function selected(name) {
    return form.querySelector(
      `input[name="${name}"]:checked`
    );
  }

  /* LIVE SUMMARY */

  function syncSummary() {
    const occasion =
      selected('studio-occasion')?.value || 'Not selected';

    const design =
      selected('studio-design')?.value || 'Not selected';

    const guests = field('studio-guests').value;
    const flavour = field('studio-flavour').value;

    const guestText = guests === 'Not sure yet'
      ? 'guest count to confirm'
      : `${guests} guests`;

    summary.replaceChildren();

    const heading = document.createElement('strong');
    heading.textContent = 'YOUR CAKE, SO FAR';

    const info = document.createElement('div');
    info.textContent =
      `${occasion} · ${design} · ${guestText} · ${flavour}`;

    summary.append(heading, info);
  }

  /* MULTI-STEP NAVIGATION */

  function showStep(index) {
    currentStep = Math.min(
      steps.length - 1,
      Math.max(0, index)
    );

    steps.forEach((step, i) => {
      step.hidden = i !== currentStep;

      step.classList.toggle(
        'is-current',
        i === currentStep
      );
    });

    back.hidden = currentStep === 0;

    next.hidden = currentStep === steps.length - 1;

    send.hidden = currentStep !== steps.length - 1;

    stepIndicator.textContent =
      `0${currentStep + 1} / 0${steps.length}`;

    stepBar.style.transform =
      `scaleX(${(currentStep + 1) / steps.length})`;

    if (currentStep === steps.length - 1) {
      syncSummary();
    }

    // Keep the form in view on smaller screens.
    if (window.innerWidth < 761 && index > 0) {
      document.querySelector('.studio-panel')
        .scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
    }
  }

  next.addEventListener('click', () => {
    if (
      currentStep === 0 &&
      dateInput.value &&
      !dateInput.checkValidity()
    ) {
      dateInput.reportValidity();
      return;
    }

    showStep(currentStep + 1);
  });

  back.addEventListener('click', () => {
    showStep(currentStep - 1);
  });

  /* INTERACTIVE CAKE PHOTOGRAPH */

  form.querySelectorAll(
    'input[name="studio-design"]'
  ).forEach(input => {
    input.addEventListener('change', () => {
      if (!input.checked) return;

      const newSource = input.dataset.preview;

      previewName.textContent = input.value;

      if (preview.getAttribute('src') === newSource) {
        return;
      }

      preview.classList.add('is-switching');

      preview.onload = () => {
        preview.classList.remove('is-switching');
      };

      preview.onerror = () => {
        preview.classList.remove('is-switching');
      };

      preview.src = newSource;
      preview.alt = `${input.value} inspiration cake`;

      if (preview.complete) {
        preview.classList.remove('is-switching');
      }
    });
  });

  form.addEventListener('change', () => {
    if (currentStep === steps.length - 1) {
      syncSummary();
    }
  });

  /* WHATSAPP ENQUIRY */

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (currentStep !== steps.length - 1) {
      showStep(currentStep + 1);
      return;
    }

    const nameInput = field('studio-name');

    nameInput.setCustomValidity(
      nameInput.value.trim()
        ? ''
        : 'Please enter your name.'
    );

    if (!nameInput.reportValidity()) return;

    const date = field('studio-date').value;

    const message = [
      'Hello Bakeology by Anjali! I would like to enquire about a custom cake.',
      `Name: ${nameInput.value.trim()}`,
      `Occasion: ${selected('studio-occasion').value}`,
      `Date needed: ${date || 'To be confirmed'}`,
      `Guests (estimate): ${field('studio-guests').value}`,
      `Design inspiration: ${selected('studio-design').value}`,
      `Flavour preference: ${field('studio-flavour').value}`,
      `Additional details: ${field('studio-notes').value.trim() || 'None yet'}`,
      'Could you please confirm availability, suitable sizes and a quotation?'
    ].join('\n');

    const url =
      'https://wa.me/918437993098?text=' +
      encodeURIComponent(message);

    // Opens the pre-filled enquiry.
    // The customer must still choose to send it.
    window.location.assign(url);
  });

  showStep(0);
})();
