import {
  flavours,
  findFlavour,
  saveFlavour,
  savedFlavour,
  categoryLabel
} from './data/flavours.js';

const list = document.getElementById('menu-list');

if (list) {
  const switches = [...document.querySelectorAll('[data-menu]')];
  let selected = savedFlavour()?.id || '';

  let category =
    switches.find(button => button.classList.contains('selected'))
      ?.dataset.menu || 'cream';

  const selection = document.createElement('div');
  selection.className = 'flavour-selection';

  selection.innerHTML = `
    <p class="flavour-selection__label">YOUR CHOICE</p>
    <p class="flavour-selection__name" role="status"></p>
    <p class="flavour-selection__note"></p>
    <a class="flavour-selection__link" hidden>
      Design a cake with this flavour ↗
    </a>
  `;

  list.after(selection);

  function updateSelection() {
    const flavour = findFlavour(selected);
    const name = selection.querySelector('.flavour-selection__name');
    const note = selection.querySelector('.flavour-selection__note');
    const link = selection.querySelector('a');

    name.textContent = flavour
      ? flavour.name
      : 'Select a flavour above.';

    note.textContent = flavour
      ? `${categoryLabel(flavour.category)} · Listed menu price ₹${flavour.price}. Custom cake size and decoration are quoted separately.`
      : 'Tap a flavour to choose it, then take it into the cake studio.';

    link.hidden = !flavour;

    if (flavour) {
      link.href = `design.html?flavour=${encodeURIComponent(flavour.id)}`;
    } else {
      link.removeAttribute('href');
    }
  }

  function render() {
    const matches = flavours.filter(item => item.category === category);

    list.replaceChildren();

    matches.forEach((flavour, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu-row flavour-choice';
      button.setAttribute('aria-pressed', String(selected === flavour.id));

      const number = document.createElement('span');
      number.className = 'menu-count';
      number.textContent = String(index + 1).padStart(2, '0');

      const name = document.createElement('span');
      name.className = 'menu-name';
      name.textContent = flavour.name;

      const price = document.createElement('span');
      price.className = 'menu-price';
      price.textContent = `₹${flavour.price}`;

      const mark = document.createElement('span');
      mark.className = 'flavour-choice__mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = selected === flavour.id ? '✓' : '+';

      button.append(number, name, price, mark);

      button.addEventListener('click', () => {
        selected = flavour.id;
        saveFlavour(selected);

        // Update in place so keyboard focus stays on the selected row.
        [...list.children].forEach((row, rowIndex) => {
          const active = matches[rowIndex].id === selected;

          row.setAttribute('aria-pressed', String(active));
          row.querySelector('.flavour-choice__mark').textContent =
            active ? '✓' : '+';
        });

        updateSelection();
      });

      list.append(button);
          if (
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      button.animate(
        [
          {
            opacity: 0,
            transform: 'translateY(12px)'
          },
          {
            opacity: 1,
            transform: 'translateY(0)'
          }
        ],
        {
          duration: 420,
          delay: Math.min(index, 7) * 35,
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'backwards'
        }
      );
    }
    });

    switches.forEach(button => {
      const active = button.dataset.menu === category;

      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });

    updateSelection();
  }

  switches.forEach(button => {
    button.addEventListener('click', () => {
      category = button.dataset.menu;
      render();
    });
  });

  render();
}