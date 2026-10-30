import { initial, choices, colours, whatsapp } from './config.js';
import { createCakeScene } from './cake-scene.js';

const root = document.querySelector('.cake-customizer');
const $ = selector => root.querySelector(selector);

const STORAGE_KEY = 'bakeology.design.v2';
const LEGACY_KEY = 'bakeology.design.v1';

const TOPPINGS = ['Cherries', 'Candles', 'Sprinkles'];
const history = [];

let state = loadState();
let scene;
let mode = 'rotate';

const toolbar = document.createElement('div');
toolbar.className = 'studio-tools';
toolbar.setAttribute('aria-label', 'Cake preview controls');

toolbar.innerHTML = `
  <button type="button" data-view="rotate" aria-pressed="true">
    Rotate
  </button>
  <button type="button" data-view="decorate" aria-pressed="false">
    Decorate
  </button>
  <button type="button" data-view="write" aria-pressed="false">
    Top view
  </button>
  <button type="button" data-action="undo" disabled>
    Undo
  </button>
  <button type="button" data-action="clear">
    Clear toppings
  </button>
  <button type="button" class="studio-finish" data-action="finish">
    View finished cake ↗
  </button>
`;

const hint = document.createElement('p');
hint.className = 'studio-hint';
hint.setAttribute('role', 'status');
hint.setAttribute('aria-live', 'polite');

$('.art').after(toolbar, hint);

try {
  scene = createCakeScene($('.art'), placeTopping, moveTopping);
  render();
  setView('rotate');
} catch (error) {
  hint.textContent =
    'The 3D preview could not start. Try refreshing in a browser with WebGL enabled.';
  console.error('Cake studio:', error);
}

function validate(value) {
  const safe = { ...initial, placements: [] };

  if (!value || typeof value !== 'object') return safe;

  Object.entries(choices).forEach(([key, options]) => {
    if (options.includes(value[key])) safe[key] = value[key];
  });

  if (typeof value.message === 'string') {
    safe.message = value.message.slice(0, 28);
  }

  if (Array.isArray(value.placements)) {
    safe.placements = value.placements
      .filter(item =>
        item &&
        TOPPINGS.includes(item.type) &&
        Number.isFinite(item.x) &&
        Number.isFinite(item.z) &&
        Math.abs(item.x) <= 1 &&
        Math.abs(item.z) <= 1
      )
      .slice(0, 60)
      .map(({ type, x, z }) => ({ type, x, z }));
  }

  return safe;
}

function loadState() {
  // New shared designs use a URL fragment.
  const fragment = new URLSearchParams(location.hash.slice(1));

  if (fragment.has('design')) {
    try {
      return validate(JSON.parse(fragment.get('design')));
    } catch {
      // Continue to local storage if a shared link is malformed.
    }
  }

  // Keep support for the previous customizer's shared links.
  const query = new URLSearchParams(location.search);

  if (query.has('shape')) {
    return validate(Object.fromEntries(query));
  }

  try {
    return validate(JSON.parse(
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_KEY)
    ));
  } catch {
    return validate(null);
  }
}

function snapshot() {
  history.push(JSON.stringify(state));
  if (history.length > 30) history.shift();
}

function decorationSummary() {
  const counts = new Map();

  state.placements.forEach(item => {
    counts.set(item.type, (counts.get(item.type) || 0) + 1);
  });

  return counts.size
    ? [...counts].map(([type, count]) =>
        `${count} ${type === 'Sprinkles' ? 'sprinkle clusters' : type.toLowerCase()}`
      ).join(', ')
    : 'No placed toppings';
}

function summary() {
  return [
    `${state.tiers === 'Two' ? 'Two-tier' : 'Single-tier'} ${
      state.shape.toLowerCase()
    } cake`,
    `${state.colour.toLowerCase()} icing`,
    state.finish.toLowerCase(),
    decorationSummary()
  ].join(', ') + '.';
}

function designURL() {
  const url = new URL(location.href);
  url.search = '';
  url.hash = new URLSearchParams({
    design: JSON.stringify(state)
  }).toString();

  return url.href;
}

function render() {
  scene?.update(state, colours[state.colour]);

  root.querySelectorAll('[data-key]').forEach(button => {
    button.setAttribute(
      'aria-pressed',
      String(state[button.dataset.key] === button.dataset.value)
    );
  });

  if ($('#cake-message').value !== state.message) {
    $('#cake-message').value = state.message;
  }

  $('#count').textContent = `${state.message.length} / 28`;
  $('#design-name').textContent = `${state.colour} / ${state.shape}`;

  $('#enquire').href = whatsapp([
    "Hello Bakeology by Anjali! I'd like to enquire about this cake:",
    summary(),
    `Writing: ${state.message || 'None'}`,
    '',
    `View my design: ${designURL()}`,
    '',
    'Could you confirm flavour, size, date, availability and pricing?'
  ].join('\n'));

  toolbar.querySelector('[data-action="undo"]').disabled =
    history.length === 0;

  toolbar.querySelector('[data-action="clear"]').disabled =
    state.placements.length === 0;

  $('#share-url').hidden = true;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Preserve compatibility with the enquiry form's existing reader.
    localStorage.setItem(LEGACY_KEY, JSON.stringify(state));

    $('#save-status').textContent =
      'Your cake and decoration positions are saved in this browser.';
  } catch {
    $('#save-status').textContent =
      'Your design is available for this visit. Copy its link to keep it.';
  }
}

function setView(nextMode) {
  mode = nextMode;
  scene?.view(mode);

  toolbar.querySelectorAll('[data-view]').forEach(button => {
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.view === mode)
    );
  });

  const hints = {
    rotate: 'Drag to rotate your cake. On a phone, swipe with one finger.',
    decorate: state.topping === 'None'
      ? 'Choose cherries, candles or sprinkles, then tap the cake top.'
      : `Tap the cake top to add ${state.topping.toLowerCase()}. Drag a decoration to move it.`,
    write: 'Edit your message below. Choose “View finished cake” when you’re ready.'
  };

  hint.textContent = hints[mode];
}

function placeTopping(x, z) {
  if (!TOPPINGS.includes(state.topping)) {
    hint.textContent = 'Choose a topping first.';
    return;
  }

  if (state.placements.length >= 60) {
    hint.textContent = 'You have reached 60 decorations. Undo or clear some to add more.';
    return;
  }

  snapshot();

  state.placements.push({
    type: state.topping,
    x,
    z
  });

  render();
}

function moveTopping(index, x, z) {
  if (!state.placements[index]) return;

  snapshot();

  state.placements[index] = {
    ...state.placements[index],
    x,
    z
  };

  render();
}

root.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.view) {
    setView(button.dataset.view);
    return;
  }

  if (button.dataset.action === 'finish') {
    setView('rotate');
    return;
  }

  if (button.dataset.action === 'undo') {
    if (!history.length) return;

    state = validate(JSON.parse(history.pop()));
    render();
    setView(mode);
    return;
  }

  if (button.dataset.action === 'clear') {
    snapshot();
    state.placements = [];
    render();
    return;
  }

  if (button.id === 'share-design') {
    const url = designURL();
    const field = $('#share-url');

    field.value = url;
    field.hidden = false;

    try {
      await navigator.clipboard.writeText(url);
      $('#announcement').textContent = 'Design link copied.';
    } catch {
      field.focus();
      field.select();
      $('#announcement').textContent = 'Copy the selected design link.';
    }

    return;
  }

  if (button.id === 'reset') {
    snapshot();
    state = validate(null);
    render();
    setView('rotate');
    return;
  }

  if (button.id === 'surprise') {
    snapshot();

    Object.entries(choices).forEach(([key, options]) => {
      state[key] = options[Math.floor(Math.random() * options.length)];
    });

    state.placements = [];

    if (TOPPINGS.includes(state.topping)) {
      for (let i = 0; i < 7; i++) {
        const angle = i / 7 * Math.PI * 2;

        state.placements.push({
          type: state.topping,
          x: Math.cos(angle) * 0.52,
          z: Math.sin(angle) * 0.52
        });
      }
    }

    render();
    setView('rotate');
    return;
  }

  const key = button.dataset.key;
  const value = button.dataset.value;

  if (!key || !choices[key]?.includes(value)) return;

  snapshot();
  state[key] = value;

  // Different outlines need fresh placement to avoid floating decorations.
  if (key === 'shape') {
    state.placements = [];
  }

  render();

  if (key === 'topping') {
    setView('decorate');
  } else if (key === 'shape' || key === 'tiers') {
    setView('rotate');
  }
});

$('#cake-message').addEventListener('focus', () => {
  snapshot();
  setView('write');
});

$('#cake-message').addEventListener('input', event => {
  state.message = event.target.value.slice(0, 28);
  render();
});