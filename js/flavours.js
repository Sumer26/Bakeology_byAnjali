import { menus } from './data/menu.js';

const list = document.getElementById('menu-list');

function render(type) {
  list.innerHTML = menus[type].map(([name, price], i) => `
    <div class="menu-row">
      <span class="menu-count">
        ${String(i + 1).padStart(2, '0')}
      </span>
      <span class="menu-name">${name}</span>
      <span class="menu-price">₹${price}</span>
    </div>
  `).join('');
}

document.querySelectorAll('[data-menu]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-menu]').forEach(node => {
      node.classList.toggle('selected', node === button);

      node.setAttribute(
        'aria-pressed',
        String(node === button)
      );
    });

    render(button.dataset.menu);
  });
});

render('cream');
