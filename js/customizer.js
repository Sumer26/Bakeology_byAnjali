import { initial, choices, whatsapp } from './config.js';
import { renderCake } from './cake-renderer.js';

const root = document.querySelector('.cake-customizer');
const $ = selector => root.querySelector(selector);
const storageKey = 'bakeology.design.v1';

function validate(value) {
  const safe = { ...initial };

  if (!value || typeof value !== 'object') return safe;

  Object.entries(choices).forEach(([key, options]) => {
    if (options.includes(value[key])) {
      safe[key] = value[key];
    }
  });

  if (typeof value.message === 'string') {
    safe.message = value.message.slice(0, 28);
  }

  return safe;
}

let saved;

try {
  saved = JSON.parse(localStorage.getItem(storageKey));
} catch {
  // Private browsing/storage restrictions must not break the studio.
}

const params = new URLSearchParams(location.search);

let state = validate(
  params.has('shape')
    ? Object.fromEntries(params)
    : saved
);

function summary() {
  return `${state.tiers === 'Two' ? 'Two-tier' : 'Single-tier'} ${state.shape.toLowerCase()} cake, ${state.colour.toLowerCase()} icing, ${state.finish.toLowerCase()}, ${state.topping.toLowerCase()}.`;
}

function render(announce = false) {
  renderCake($('#cake'), state);

  root.querySelectorAll('[data-key]').forEach(button => {
    button.setAttribute(
      'aria-pressed',
      String(
        state[button.dataset.key] === button.dataset.value
      )
    );
  });

  $('#cake-message').value = state.message;
  $('#count').textContent = `${state.message.length} / 28`;
  $('#design-name').textContent =
    `${state.colour} / ${state.shape}`;

  $('#cake-description').textContent =
    summary() + ` Writing: ${state.message || 'None'}.`;

  $('#enquire').href = whatsapp([
    "Hello Bakeology by Anjali! I'd like to enquire about this cake idea:",
    summary(),
    `Writing: ${state.message || 'None'}`,
    'Could we discuss flavour, size, date, availability and pricing?'
  ].join('\n'));

  if (announce) {
    $('#announcement').textContent = summary();
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(state));

    $('#save-status').textContent =
      'Your design is saved in this browser.';
  } catch {
    $('#save-status').textContent =
      'Your design is available for this visit.';
  }
}

root.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.id === 'share-design') {
    const url = new URL(location.href);
    url.search = new URLSearchParams(state).toString();
    url.hash = '';

    const field = $('#share-url');
    field.value = url.href;
    field.hidden = false;

    try {
      await navigator.clipboard.writeText(url.href);

      $('#announcement').textContent =
        'Design link copied.';
    } catch {
      field.focus();
      field.select();

      $('#announcement').textContent =
        'Copy the selected design link.';
    }

    return;
  }

  if (button.dataset.key) {
    state[button.dataset.key] = button.dataset.value;
  } else if (button.id === 'reset') {
    state = { ...initial };
  } else if (button.id === 'surprise') {
    Object.entries(choices).forEach(([key, options]) => {
      state[key] = options[
        Math.floor(Math.random() * options.length)
      ];
    });
  } else {
    return;
  }

  $('#share-url').hidden = true;
  render(true);
});

$('#cake-message').addEventListener('input', event => {
  state.message = event.target.value;
  $('#share-url').hidden = true;
  render();
});

render();
