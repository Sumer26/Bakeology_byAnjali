import { labels } from './data/catalog.js';
import { whatsapp } from './config.js';

export function initialiseCakeDialog(dialog) {
  let opener;

  dialog.querySelector('.dialog-close').addEventListener('click', () => {
    dialog.close();
  });

  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;

    if (outside) dialog.close();
  });

  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });

  return function openCake(cake, button) {
    const [name, file, category, description] = cake;
    opener = button;

    const image = dialog.querySelector('#dialog-image');
    image.src = `assets/${file}.jpg`;
    image.alt = `${name} cake`;

    dialog.querySelector('#dialog-title').textContent = name;
    dialog.querySelector('#dialog-category').textContent = labels[category];
    dialog.querySelector('#dialog-desc').textContent = description;
    dialog.querySelector('#dialog-link').href = whatsapp(
      `Hello Bakeology by Anjali! I'm interested in the ${name} cake. ` +
      `Could you share availability and customisation details?`
    );

    dialog.showModal();
  };
}