const chapters = [
  ...document.querySelectorAll('[data-scene]')
];

const photos = [
  ...document.querySelectorAll('[data-scene-photo]')
];

const meter = document.getElementById('atelier-meter-fill');
const label = document.getElementById('atelier-photo-index');
const frame = document.getElementById('atelier-image-description');
const hero = document.querySelector('.hero-visual');
const reduced = matchMedia('(prefers-reduced-motion:reduce)');

const descriptions = [
  'Peach-coloured cake with piped roses and ribbons',
  'Chocolate cake with cherries and pink piping',
  'Powder-blue cake with ribbons and pearls'
];

let pending = false;

function update() {
  pending = false;

  const scan = innerHeight * (innerWidth < 761 ? .72 : .54);
  let closest = Infinity;
  let active = 0;

  chapters.forEach((chapter, i) => {
    const rect = chapter.getBoundingClientRect();

    const distance = Math.max(
      rect.top - scan,
      scan - rect.bottom,
      0
    );

    if (distance < closest) {
      closest = distance;
      active = i;
    }
  });

  chapters.forEach((node, i) => {
    node.classList.toggle('is-current', i === active);
  });

  photos.forEach((node, i) => {
    node.classList.toggle('is-current', i === active);
  });

  if (meter) {
    meter.style.transform =
      `scaleX(${(active + 1) / chapters.length})`;
  }

  if (label) {
    label.textContent = `0${active + 1} / 03`;
  }

  frame?.setAttribute('aria-label', descriptions[active]);

  if (hero) {
    const shift = reduced.matches
      ? 0
      : Math.max(
          -45,
          Math.min(45, -hero.getBoundingClientRect().top * .075)
        );

    hero.style.setProperty('--hero-shift', `${shift}px`);
  }
}

function schedule() {
  if (!pending) {
    pending = true;
    requestAnimationFrame(update);
  }
}

addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule, { passive: true });
reduced.addEventListener('change', schedule);

update();
