import { cakes, labels } from './data/catalog.js';
import { initialiseCakeDialog } from './cake-dialog.js';

const gallery = document.getElementById('gallery');
const dialog = document.getElementById('cake-dialog');
const status = document.createElement('p');

status.className = 'gallery-status';
status.setAttribute('role', 'status');
gallery.after(status);

const openCake = initialiseCakeDialog(dialog);


function render(filter = 'all') {
  const matches = cakes.filter(
    cake => filter === 'all' || cake[2] === filter
  );

  gallery.replaceChildren(...matches.map(cake => {
    const [name, file, category] = cake;
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'cake-card';
    button.setAttribute('aria-label', `View ${name} cake`);

    button.innerHTML = `
      <span class="cake-image">
        <img
          src="assets/${file}.jpg"
          loading="lazy"
          alt="${name} cake"
        >
      </span>
      <span class="cake-meta">
        <span>
          <small>${labels[category]}</small>
          <strong>${name}</strong>
        </span>
        <span class="round-arrow" aria-hidden="true">↗</span>
      </span>
    `;

    button.addEventListener(
      'click',
      () => openCake(cake, button)
    );

    return button;
  }));

  status.textContent = `${matches.length} designs`;
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(node => {
      node.classList.toggle('active', node === button);

      node.setAttribute(
        'aria-pressed',
        String(node === button)
      );
    });

    render(button.dataset.filter);
  });
});


dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;

  const rect = dialog.getBoundingClientRect();

  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  ) {
    dialog.close();
  }
});

dialog.addEventListener('close', () => opener?.focus());

render();
