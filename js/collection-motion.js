const gallery = document.getElementById('gallery');

if (gallery) initialiseSequence(gallery);

function initialiseSequence(gallery) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');

  const wrapper = document.createElement('div');
  wrapper.className = 'collection-sequence';

  const stage = document.createElement('div');
  stage.className = 'collection-sequence__stage';

  const navigation = document.createElement('nav');
  navigation.className = 'collection-sequence__navigation';
  navigation.setAttribute('aria-label', 'Cake collection groups');

  navigation.innerHTML = `
    <button type="button" data-previous>← Previous</button>
    <span role="status" aria-live="polite"></span>
    <button type="button" data-next>Next →</button>
  `;

  gallery.before(wrapper);
  wrapper.append(stage);
  stage.append(gallery, navigation);

  gallery.classList.remove('collection-motion');
  gallery.classList.add('collection-sequence__gallery');

  const previous = navigation.querySelector('[data-previous]');
  const next = navigation.querySelector('[data-next]');
  const counter = navigation.querySelector('span');

  let cards = [];
  let columns = 3;
  let groups = 0;
  let activeGroup = 0;
  let manualGroup = 0;
  let manual = false;
  let top = 80;
  let height = 650;
  let distance = 700;
  let frame = 0;
  let previousCounter = '';

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  function configure() {
    const oldRect = wrapper.getBoundingClientRect();
    const wasPinned = oldRect.top <= top && oldRect.bottom > top + height;

    cards = [...gallery.querySelectorAll('.cake-card')]
      .filter(card => !card.hidden);

    columns = mobile.matches ? 1 : 3;
    groups = Math.ceil(cards.length / columns);

    top = Math.ceil(
      document.querySelector('.header')?.getBoundingClientRect().height || 76
    ) + 12;

    height = Math.max(340, innerHeight - top - 18);
    distance = Math.max(500, innerHeight * 0.85);

    manual = reducedMotion.matches || innerHeight < 560;

    wrapper.classList.toggle('is-manual', manual);
    wrapper.style.setProperty('--sequence-top', `${top}px`);
    wrapper.style.setProperty('--sequence-height', `${height}px`);

    wrapper.hidden = groups === 0;

    wrapper.style.height = `${
      height + (manual ? 0 : Math.max(0, groups - 1) * distance)
    }px`;

    gallery.querySelectorAll('.cake-card').forEach(card => {
      card.style.removeProperty('--card-drift');
      card.style.removeProperty('--photo-drift');
      card.style.removeProperty('--photo-scale');
      card.style.removeProperty('will-change');

      card.inert = true;
      card.setAttribute('aria-hidden', 'true');
    });

    cards.forEach((card, index) => {
      const column = index % columns;
      const gap = columns === 1 ? 0 : 22;
      const width = `(100% - ${(columns - 1) * gap}px) / ${columns}`;

      card.style.setProperty('--tile-width', `calc(${width})`);
      card.style.setProperty(
        '--tile-left',
        `calc((${width} + ${gap}px) * ${column})`
      );
    });

    manualGroup = 0;
    activeGroup = 0;

    // A changed filter starts its new sequence from the first group.
    if (wasPinned && !manual && groups) {
      window.scrollTo({
        top: scrollY + wrapper.getBoundingClientRect().top - top,
        behavior: 'instant'
      });
    }

    schedule();
  }

  function draw() {
    frame = 0;
    if (!groups) return;

    const rect = wrapper.getBoundingClientRect();

    const position = manual
      ? manualGroup
      : clamp((top - rect.top) / distance, 0, groups - 1);

    const base = Math.floor(position);
    const fraction = position - base;

    // Hold each group, then transition during the last 40%.
    const transition = clamp((fraction - 0.6) / 0.4, 0, 1);
    const eased = transition * transition * (3 - 2 * transition);

    activeGroup = Math.min(
      groups - 1,
      base + (eased >= 0.5 ? 1 : 0)
    );

    cards.forEach((card, index) => {
      const group = Math.floor(index / columns);
      const column = index % columns;

      let opacity = 0;
      let offset = 0;
      let scale = 1;

      if (group === base) {
        opacity = 1 - eased;
        offset = -eased * (100 + column * 30);
        scale = 1 + eased * 0.035;
      } else if (group === base + 1 && eased > 0) {
        opacity = eased;
        offset = (1 - eased) * (130 + column * 30);
        scale = 1.06 - eased * 0.06;
      }

      const interactive = group === activeGroup;

      card.style.visibility = opacity > 0 ? 'visible' : 'hidden';
      card.style.opacity = String(opacity);
      card.style.pointerEvents = interactive ? 'auto' : 'none';
      card.style.setProperty('--tile-y', `${offset}px`);
      card.style.setProperty('--tile-scale', String(scale));

      card.inert = !interactive;
      card.setAttribute('aria-hidden', String(!interactive));
    });

    const text =
      `${String(activeGroup + 1).padStart(2, '0')} / ` +
      `${String(groups).padStart(2, '0')} · ` +
      (manual ? 'Use the arrows to explore' : 'Scroll to explore');

    if (text !== previousCounter) {
      counter.textContent = text;
      previousCounter = text;
    }

    previous.disabled = activeGroup === 0;
    next.disabled = activeGroup === groups - 1;
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function goTo(index) {
    const target = clamp(index, 0, groups - 1);

    if (manual) {
      manualGroup = target;
      schedule();
      return;
    }

    window.scrollTo({
      top:
        scrollY +
        wrapper.getBoundingClientRect().top -
        top +
        target * distance,
      behavior: 'smooth'
    });
  }

  previous.addEventListener('click', () => goTo(activeGroup - 1));
  next.addEventListener('click', () => goTo(activeGroup + 1));

  let rebuildFrame = 0;

  const observer = new MutationObserver(() => {
    cancelAnimationFrame(rebuildFrame);
    rebuildFrame = requestAnimationFrame(configure);
  });

  observer.observe(gallery, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden']
  });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', configure, { passive: true });
  window.addEventListener('pageshow', schedule);

  reducedMotion.addEventListener('change', configure);
  mobile.addEventListener('change', configure);

  configure();
}