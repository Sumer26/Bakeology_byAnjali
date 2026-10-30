const visual = document.querySelector('.hero-visual');
const original = visual?.querySelector(':scope > img');

if (visual && original) {
  initialiseHeroMotion(visual, original);
}

function initialiseHeroMotion(visual, original) {
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
  let inView = true;
  let ready = false;

  function update() {
    frame = 0;

    if (!ready || reducedMotion.matches || !inView) return;

    const rect = visual.getBoundingClientRect();
    const height = Math.max(rect.height, 1);

    // Negative before the image reaches the top; positive afterward.
    const progress = Math.max(
      -1,
      Math.min(1, -rect.top / height)
    );

    const strength = mobile.matches ? 0.055 : 0.12;
    const shift = progress * height * strength;

    // A restrained zoom that settles as the photograph scrolls away.
    const exitProgress = Math.max(0, progress);
    const scale = 1.055 - exitProgress * 0.035;

    layer.style.transform =
      `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
  }

  function schedule() {
    if (frame || reducedMotion.matches || !inView || !ready) return;
    frame = requestAnimationFrame(update);
  }

  function applyPreference() {
    visual.classList.toggle(
      'has-parallax',
      ready && !reducedMotion.matches
    );

    if (reducedMotion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      layer.style.transform = '';
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
    visual.classList.remove('has-parallax');
    layer.remove();
  }, { once: true });

  if (photograph.complete) activate();

  const observer = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;

    if (inView) schedule();
  }, {
    rootMargin: '100px'
  });

  observer.observe(visual);

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);

  reducedMotion.addEventListener('change', applyPreference);
  mobile.addEventListener('change', schedule);
}