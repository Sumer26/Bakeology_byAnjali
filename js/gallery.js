import { cakes, labels } from './data/catalog.js';
import { whatsapp } from './config.js';

const gallery = document.getElementById('gallery');
const dialog = document.getElementById('cake-dialog');
const status = document.createElement('p');

status.className = 'gallery-status';
status.setAttribute('role', 'status');
gallery.after(status);

let opener;

function openCake(cake, button) {
  const [name, file, category, description] = cake;
  opener = button;

  const image = document.getElementById('dialog-image');
  image.src = `assets/${file}.jpg`;
  image.alt = `${name} cake`;

  document.getElementById('dialog-title').textContent = name;
  document.getElementById('dialog-category').textContent =
    labels[category];
  document.getElementById('dialog-desc').textContent =
    description;

  document.getElementById('dialog-link').href = whatsapp(
    `Hello Bakeology by Anjali! I'm interested in the ${name} cake. Could you share availability and customisation details?`
  );

  dialog.showModal();
}

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

document.querySelector('.dialog-close').addEventListener(
  'click',
  () => dialog.close()
);

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
