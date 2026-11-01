import { cakes, labels } from './data/catalog.js';
import { initialiseCakeDialog } from './cake-dialog.js';

export function initialiseInspiration(form) {
  const gallery = document.getElementById('inspiration-gallery');
  const dialog = document.getElementById('cake-dialog');
  const button = gallery?.querySelector('.inspiration-open');
  let slide = gallery?.querySelector('.inspiration-slide');

  if (!form || !dialog || !button || !slide || !cakes.length) return;

  const openCake = initialiseCakeDialog(dialog);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = cakes.find(cake => cake[1] === 'peach-bloom') || cakes[0];
  let remaining = [];
  let timer;
  let revision = 0;
  let fade;
  let outgoing;

  function updateCaption(element, cake) {
    const [name, , category] = cake;
    element.querySelector('.studio-image-caption > span').textContent =
      labels[category];
    element.querySelector('strong').textContent = name;
  }

  function settle() {
    clearTimeout(timer);
    revision++;
    fade?.cancel();
    fade = null;
    outgoing?.remove();
    outgoing = null;
  }

  function schedule() {
    clearTimeout(timer);
    if (dialog.open || document.hidden || motion.matches || cakes.length < 2) {
      return;
    }

    timer = setTimeout(() => {
      if (!remaining.length) {
        remaining = cakes.filter(cake => cake !== current);
      }

      const index = Math.floor(Math.random() * remaining.length);
      const [next] = remaining.splice(index, 1);
      show(next);
    }, 7000);
  }

  async function show(cake) {
    settle();
    const request = revision;

    if (cake === current) {
      schedule();
      return;
    }

    const [name, file] = cake;
    const photo = new Image();
    photo.alt = `${name} cake`;
    photo.src = `assets/${file}.jpg`;

    try {
      await photo.decode();
    } catch {
      if (request === revision) schedule();
      return;
    }

    // The visitor may have opened the dialog while the photo was loading.
    if (request !== revision || dialog.open || document.hidden) return;

    const next = slide.cloneNode(true);
    next.querySelector('img').replaceWith(photo);
    updateCaption(next, cake);

    outgoing = slide;
    gallery.insertBefore(next, button);
    slide = next;
    current = cake;
    button.setAttribute('aria-label', `View ${name} cake details`);

    if (motion.matches) {
      outgoing.remove();
      outgoing = null;
    } else {
      fade = next.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 850, easing: 'ease-in-out' }
      );

      fade.onfinish = () => {
        if (request !== revision) return;
        outgoing?.remove();
        outgoing = null;
        fade = null;
      };
    }

    schedule();
  }

  button.addEventListener('click', () => {
    // Finish any crossfade so the photo and open dialog agree.
    settle();
    openCake(current, button);
  });

  dialog.addEventListener('close', schedule);

  // A form selection immediately shows that design. Automatic slides
  // never change the visitor's actual choice in the enquiry form.
  form.addEventListener('change', event => {
    const input = event.target;
    if (!input.matches('input[name="studio-design"][data-preview]')) return;

    const file = input.dataset.preview.split('/').pop();
    const cake = cakes.find(item => `${item[1]}.jpg` === file);
    if (cake) show(cake);
  });

  function resetTimer() {
    settle();
    schedule();
  }

  document.addEventListener('visibilitychange', resetTimer);
  motion.addEventListener('change', resetTimer);

  updateCaption(slide, current);
  button.setAttribute('aria-label', `View ${current[0]} cake details`);
  schedule();
}