const visual = document.querySelector('.hero-visual');
const original = visual?.querySelector(':scope > img');
const hero = visual?.closest('.hero');

if (hero && visual && original) {
  initialiseHeroMotion(hero, visual, original);
}

function initialiseHeroMotion(hero, visual, original) {
  if (visual.querySelector('.hero-parallax-layer')) return;

  const reducedMotion = matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  const mobile = matchMedia('(max-width: 760px)');

  const layer = document.createElement('div');
  layer.className = 'hero-parallax-layer';
  layer.setAttribute('aria-hidden', 'true');

  const photograph = original.cloneNode(true);

  photograph.removeAttribute('id');
  photograph.removeAttribute('style');
  photograph.removeAttribute('class');
  photograph.alt = '';
  photograph.loading = 'eager';

  layer.append(photograph);
  visual.prepend(layer);

  let frame = 0;
  let ready = false;
  let visible = true;

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  function update() {
    frame = 0;

    if (!ready || reducedMotion.matches || !visible) return;

    const imageRect = visual.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();

    const imageHeight = Math.max(imageRect.height, 1);
    const heroHeight = Math.max(heroRect.height, 1);

    /*
     * Entrance: -1 to 0
     * Exit:      0 to 1
     *
     * The photograph moves down inside its frame as the
     * frame scrolls upward, creating visible depth.
     */
    const imageProgress = clamp(
      -imageRect.top / imageHeight,
      -1,
      1
    );

    const exitProgress = clamp(imageProgress, 0, 1);
    const entranceProgress = clamp(-imageProgress, 0, 1);

    const movement = mobile.matches ? 0.23 : 0.32;

    const imageY = imageProgress * imageHeight * movement;

    // Stronger opening crop, gradually revealing more of the photo.
    const scale =
      1.16 -
      exitProgress * 0.15 +
      entranceProgress * 0.035;

    // Small lateral movement adds depth without tilting the cake.
    const imageX = mobile.matches ? 0 : exitProgress * -24;

    layer.style.transform = [
      `translate3d(${imageX.toFixed(2)}px, ${imageY.toFixed(2)}px, 0)`,
      `scale(${scale.toFixed(4)})`
    ].join(' ');

    const heroProgress = clamp(
      -heroRect.top / heroHeight,
      0,
      1
    );

    // Keep mobile text still: its photo sits beneath the copy.
    const titleOffset = mobile.matches
      ? 0
      : heroProgress * 100;

    const copyOffset = mobile.matches
      ? 0
      : heroProgress * 45;

    hero.style.setProperty(
      '--hero-title-offset',
      `${titleOffset.toFixed(2)}px`
    );

    hero.style.setProperty(
      '--hero-copy-offset',
      `${copyOffset.toFixed(2)}px`
    );
  }

  function schedule() {
    if (frame || !ready || !visible || reducedMotion.matches) return;
    frame = requestAnimationFrame(update);
  }

  function applyPreference() {
    const enabled = ready && !reducedMotion.matches;

    visual.classList.toggle('has-parallax', enabled);
    hero.classList.toggle('has-scroll-motion', enabled);

    if (!enabled) {
      cancelAnimationFrame(frame);
      frame = 0;

      layer.style.transform = '';
      hero.style.removeProperty('--hero-title-offset');
      hero.style.removeProperty('--hero-copy-offset');
    } else {
      schedule();
    }
  }

  function activate() {
    if (ready || !photograph.naturalWidth) return;

    ready = true;
    applyPreference();
  }

  photograph.addEventListener('load', activate, { once: true });

  photograph.addEventListener('error', () => {
    ready = false;
    applyPreference();
    layer.remove();
  }, { once: true });

  if (photograph.complete) activate();

  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;

    if (visible) schedule();
  }, {
    rootMargin: '150px'
  });

  observer.observe(hero);

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);

  reducedMotion.addEventListener('change', applyPreference);
  mobile.addEventListener('change', schedule);
}