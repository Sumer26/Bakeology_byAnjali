const gallery = document.getElementById('gallery');

if (gallery) {
  initialiseCollectionMotion(gallery);
}

function initialiseCollectionMotion(gallery) {
  const reducedMotion = matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  const mobile = matchMedia('(max-width: 760px)');

  let entries = [];
  let frame = 0;
  let needsScan = true;

  const clamp = (number, min, max) =>
    Math.max(min, Math.min(max, number));

  function scan() {
    // Preserve offsets so measurements exclude our own movement.
    const previous = new Map(
      entries.map(entry => [entry.card, entry])
    );

    entries = [...gallery.querySelectorAll('.cake-card')]
      .filter(card => !card.hidden)
      .map((card, index) => ({
        card,
        imageFrame: card.querySelector('.cake-image'),
        index,
        shift: previous.get(card)?.shift || 0
      }))
      .filter(entry => entry.imageFrame);

    needsScan = false;
  }

  function update() {
    frame = 0;

    if (reducedMotion.matches) return;
    if (needsScan) scan();

    const viewportHeight = window.innerHeight;

    // Read all geometry first, then apply movement.
    const measurements = entries.map(entry => {
      const rect = entry.card.getBoundingClientRect();
      const imageHeight = entry.imageFrame.clientHeight;

      // Remove the previous translation from the measurement.
      const baseTop = rect.top - entry.shift;
      const baseCentre = baseTop + rect.height / 2;

      const progress = clamp(
        (viewportHeight / 2 - baseCentre) /
          (viewportHeight / 2 + rect.height / 2),
        -1,
        1
      );

      return {
        entry,
        imageHeight,
        progress,
        nearby:
          baseTop < viewportHeight + 250 &&
          baseTop + rect.height > -250
      };
    });

    measurements.forEach(({
      entry,
      imageHeight,
      progress,
      nearby
    }) => {
      if (!nearby) {
        entry.card.style.willChange = 'auto';
        return;
      }

      /*
       * Alternating speeds make neighbouring cards drift apart
       * and come together as they move through the viewport.
       */
      const direction = entry.index % 2 === 0 ? 1 : -1;
      const cardDistance = mobile.matches ? 28 : 52;

      const shift = progress * cardDistance * direction;

      /*
       * The photo travels in the opposite direction to the page.
       * Its oversized frame prevents exposed edges.
       */
      const photoDistance = imageHeight * (
        mobile.matches ? 0.17 : 0.23
      );

      const photoShift = progress * photoDistance;

      // Slightly closer when entering, settling as it leaves.
      const scale = 1.09 - ((progress + 1) / 2) * 0.065;

      entry.shift = shift;

      entry.card.style.willChange = 'transform';

      entry.card.style.setProperty(
        '--card-drift',
        `${shift.toFixed(2)}px`
      );

      entry.card.style.setProperty(
        '--photo-drift',
        `${photoShift.toFixed(2)}px`
      );

      entry.card.style.setProperty(
        '--photo-scale',
        scale.toFixed(4)
      );
    });
  }

  function schedule() {
    if (frame || reducedMotion.matches) return;
    frame = requestAnimationFrame(update);
  }

  function refresh() {
    needsScan = true;
    schedule();
  }

  function applyPreference() {
    cancelAnimationFrame(frame);
    frame = 0;

    gallery.classList.toggle(
      'collection-motion',
      !reducedMotion.matches
    );

    gallery.querySelectorAll('.cake-card').forEach(card => {
      card.style.removeProperty('--card-drift');
      card.style.removeProperty('--photo-drift');
      card.style.removeProperty('--photo-scale');
      card.style.removeProperty('will-change');
    });

    entries = [];
    refresh();
  }

  /*
   * Category filters rebuild the gallery.
   * Search and favourites change the cards' hidden attributes.
   * Both automatically refresh the animation.
   */
  const observer = new MutationObserver(refresh);

  observer.observe(gallery, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden']
  });

  const resizeObserver = new ResizeObserver(refresh);
  resizeObserver.observe(gallery);

  gallery.addEventListener('load', refresh, true);

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('pageshow', refresh);

  reducedMotion.addEventListener('change', applyPreference);
  mobile.addEventListener('change', refresh);

  document.fonts?.ready.then(refresh);

  applyPreference();
}