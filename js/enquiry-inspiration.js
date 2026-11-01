const cakes = [
  {
    file: 'peach-bloom.jpg',
    name: 'Peach Bloom',
    style: 'Vintage florals',
    alt: 'Two-tier peach cake with piped roses, bows and pearls'
  },
  {
    file: 'blue-belle.jpg',
    name: 'Blue Belle',
    style: 'Vintage piping',
    alt: 'Blue and ivory cake with piped swirls and blue bows'
  },
  {
    file: 'be-mine.jpg',
    name: 'Be Mine',
    style: 'Romantic ribbons',
    alt: 'Red heart-shaped cake with berries and ribbon bows'
  },
  {
    file: 'cherry-mocha.jpg',
    name: 'Cherry Mocha',
    style: 'Rich chocolate',
    alt: 'Chocolate cake with mocha piping and cherries'
  },
  {
    file: 'sun-kissed.jpg',
    name: 'Sun Kissed',
    style: 'Colourful celebrations',
    alt: 'Orange celebration cake with citrus-coloured decorations'
  },
  {
    file: 'sweetheart.jpg',
    name: 'Sweetheart',
    style: 'Love notes',
    alt: 'Pink heart cake with strawberries and ivory piping'
  }
];

export function initialiseInspiration(form) {
  const gallery = document.getElementById('inspiration-gallery');
  const toggle = document.querySelector('.inspiration-toggle');
  if (!gallery || !toggle || !form) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = cakes[0];
  let remaining = [];
  let paused = motion.matches;
  let timer;
  let revision = 0;
  let incoming;
  let animation;

  function schedule() {
    clearTimeout(timer);
    if (paused || document.hidden) return;

    timer = setTimeout(() => {
      if (!remaining.length) {
        remaining = cakes.filter(cake => cake !== current);
      }

      const index = Math.floor(Math.random() * remaining.length);
      const [cake] = remaining.splice(index, 1);
      show(cake);
    }, 10000 + Math.random() * 5000);
  }

  function cancelPending() {
    revision++;
    clearTimeout(timer);
    animation?.cancel();
    animation = null;
    incoming?.remove();
    incoming = null;
  }

  async function show(cake) {
    cancelPending();
    const request = revision;

    try {
      if (cake === current) return;

      const photo = new Image();
      photo.alt = cake.alt;
      photo.src = `assets/${cake.file}`;
      await photo.decode();
      if (request !== revision) return;

      const slide = gallery.firstElementChild.cloneNode(true);
      slide.querySelector('img').replaceWith(photo);
      slide.querySelector('.studio-image-caption > span').textContent = cake.style;
      slide.querySelector('strong').textContent = cake.name;

      const previous = gallery.firstElementChild;
      incoming = slide;
      gallery.append(slide);

      if (!motion.matches) {
        animation = slide.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 850, easing: 'ease-in-out' }
        );
        await animation.finished;
      }

      if (request !== revision) return;
      previous.remove();
      incoming = null;
      animation = null;
      current = cake;
    } catch (error) {
      if (request === revision) {
        incoming?.remove();
        incoming = null;
        console.warn('Could not show inspiration photo:', cake.file, error);
      }
    } finally {
      if (request === revision) schedule();
    }
  }

  function setPaused(value) {
    paused = value;
    cancelPending();
    toggle.textContent = paused ? 'Play slideshow' : 'Pause slideshow';
    schedule();
  }

  toggle.hidden = false;
  toggle.addEventListener('click', () => setPaused(!paused));

  // A deliberate form choice takes priority over the slideshow.
  function showChosenDesign(event) {
    const input = event.target;
    if (!input.matches('input[name="studio-design"][data-preview]')) return;

    const file = input.dataset.preview.split('/').pop();
    const cake = cakes.find(item => item.file === file);
    if (!cake) return;

    setPaused(true);
    show(cake);
  }

  // Click also catches a visitor choosing the already-checked first option.
  form.addEventListener('click', showChosenDesign);
  form.addEventListener('change', event => {
    if (event.target.matches('input[name="studio-design"]') && !paused) {
      showChosenDesign(event);
    }
  });

  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => setPaused(motion.matches));
  setPaused(paused);
}