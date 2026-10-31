import {
  initial,
  choices,
  colours,
  whatsapp,
  appearanceFields,
  defaultAppearance
} from './config.js';

import { createCakeScene } from './cake-scene.js';
import { createPricePanel } from './cake-pricing.js';
import { downloadDesignPDF } from './design-pdf.js';
import { createAppearanceStudio } from './studio-appearance.js';

import {
  findFlavour,
  saveFlavour,
  savedFlavour
} from './data/flavours.js';

const root = document.querySelector('.cake-customizer');
const $ = selector => root.querySelector(selector);

const STORAGE_KEY = 'bakeology.design.v2';
const LEGACY_KEY = 'bakeology.design.v1';

const TOPPINGS = ['Cherries', 'Candles', 'Sprinkles', 'Pearls'];
const history = [];

let state = loadState();

const requestedFlavour = findFlavour(
  new URLSearchParams(location.search).get('flavour')
);

if (requestedFlavour) {
  state.flavour = requestedFlavour.id;
} else if (
  !state.flavour &&
  !new URLSearchParams(location.hash.slice(1)).has('design') &&
  !new URLSearchParams(location.search).has('shape')
) {
  state.flavour = savedFlavour()?.id || '';
}

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

const sideButton = document.createElement('button');
sideButton.type = 'button';
sideButton.dataset.view = 'side';
sideButton.setAttribute('aria-pressed', 'false');
sideButton.textContent = 'Decorate sides';

toolbar.querySelector('[data-view="write"]').before(sideButton);

function addChoiceButtons(key) {
  const example = root.querySelector(`[data-key="${key}"]`);
  if (!example) return;

  const container = example.parentElement;

  choices[key].forEach(value => {
    const exists = [...container.querySelectorAll('[data-key]')]
      .some(button => button.dataset.value === value);

    if (exists) return;

    const button = document.createElement('button');

    button.type = 'button';
    button.dataset.key = key;
    button.dataset.value = value;
    button.setAttribute('aria-pressed', 'false');
    if (key === 'colour') {
      const swatch = document.createElement('i');
      swatch.style.setProperty('--swatch', colours[value]);
      swatch.setAttribute('aria-hidden', 'true');

      button.append(swatch, document.createTextNode(value));
    } else {
      button.textContent = value;
    }

    container.append(button);
  });
}

addChoiceButtons('colour');
addChoiceButtons('finish');
addChoiceButtons('topping');

const updatePrice = createPricePanel($('.preview'));

const appearanceStudio = createAppearanceStudio(
  $('.controls'),
  () => state,
  patch => {
    snapshot();

    state = validate({
      ...state,
      ...patch
    });

    if (state.flavour) saveFlavour(state.flavour);

    render();
  }
);

const pdfButton = document.createElement('button');
pdfButton.type = 'button';
pdfButton.textContent = 'Download design PDF';
toolbar.append(pdfButton);

pdfButton.addEventListener('click', async () => {
  if (!scene) {
    hint.textContent = 'Wait for the cake preview to load first.';
    return;
  }

  pdfButton.disabled = true;
  pdfButton.textContent = 'Preparing PDF…';

  try {
    // Snapshot both together before awaiting the PDF library.
    const exportState = JSON.parse(JSON.stringify(state));
    const preview = scene.capture();

    await downloadDesignPDF({
      state: exportState,
      preview
    });

    hint.textContent = 'Your design PDF is ready.';
  } catch (error) {
    console.error(error);
    hint.textContent =
      'The PDF could not be created. Check your internet connection and try again.';
  } finally {
    pdfButton.disabled = false;
    pdfButton.textContent = 'Download design PDF';
  }
});

try {
  scene = createCakeScene(
  $('.art'),
  placeTopping,
  moveTopping,
  message => {
    hint.textContent = message;
  }
);
  render();
  setView('rotate');
} catch (error) {
  hint.textContent =
    'The 3D preview could not start. Try refreshing in a browser with WebGL enabled.';
  console.error('Cake studio:', error);
}

function validate(value) {
  const safe = {
  ...initial,
  flavour: '',
  appearance: { ...defaultAppearance },
  placements: []
};

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
      Math.abs(item.x) <= 1.1 &&
      Math.abs(item.z) <= 1.1 &&
      (
        item.surface !== 'side' ||
        (
          ['Pearls', 'Sprinkles'].includes(item.type) &&
          Number.isFinite(item.y) &&
          item.y > 0 &&
          item.y < 1 &&
          Number.isFinite(item.nx) &&
          Number.isFinite(item.nz) &&
          Math.hypot(item.nx, item.nz) > 0.5
        )
      )
    )
    .slice(0, 60)
    .map(item => ({
      type: item.type,
      x: item.x,
      z: item.z,
      tier: safe.tiers === 'Two'
        ? (item.tier === 0 ? 0 : 1)
        : 0,
      surface: item.surface === 'side' ? 'side' : 'top',
      y: item.surface === 'side' ? item.y : 1,
      nx: item.surface === 'side' ? item.nx : 0,
      nz: item.surface === 'side' ? item.nz : 0
    }));
}
  if (
  value.appearance &&
  typeof value.appearance === 'object' &&
  !Array.isArray(value.appearance)
) {
  appearanceFields.forEach(({ key }) => {
    const colour = value.appearance[key];

    if (
      typeof colour === 'string' &&
      /^#[0-9a-f]{6}$/i.test(colour)
    ) {
      safe.appearance[key] = colour.toLowerCase();
    }
  });
}
  safe.flavour = findFlavour(value.flavour)?.id || '';
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
function icingDescription() {
  const hex = state.appearance?.icingColour;

  if (!hex) return state.colour;

  const named = Object.entries(colours).find(
    ([, value]) => value.toLowerCase() === hex.toLowerCase()
  );

  return named?.[0] || `Custom ${hex.toUpperCase()}`;
}

function appearanceSummary() {
  const active = {
    icingColour: true,
    pipingColour: state.finish === 'Piping',
    dripColour: state.finish.toLowerCase().includes('drip'),
    messageColour: Boolean(state.message.trim()),
    cherryColour: state.placements.some(item => item.type === 'Cherries'),
    candleColour: state.placements.some(item => item.type === 'Candles'),
    pearlColour: state.placements.some(item => item.type === 'Pearls'),
    sprinkleColour: state.placements.some(item => item.type === 'Sprinkles')
  };

  const details = appearanceFields
    .filter(({ key }) => active[key] && state.appearance?.[key])
    .map(({ key, label }) =>
      `${label}: ${state.appearance[key].toUpperCase()}`
    );

  return details.length
    ? details.join('; ')
    : 'Automatic colours';
}

function summary() {
  return [
    `${state.tiers === 'Two' ? 'Two-tier' : 'Single-tier'} ${
      state.shape.toLowerCase()
    } cake`,
    `${icingDescription()} icing`,
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
  appearanceStudio.update(state);

  updatePrice(state);
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
  $('#design-name').textContent =
  `${icingDescription()} / ${state.shape}`;
  $('#enquire').href = whatsapp([
    "Hello Bakeology by Anjali! I'd like to enquire about this cake:",
    summary(),
    `Flavour: ${findFlavour(state.flavour)?.name || 'To be confirmed'}`,
    `Writing: ${state.message || 'None'}`,
    `Colours: ${appearanceSummary()}`,
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
    write: 'Edit your message below. Choose “View finished cake” when you’re ready.',
    side: 'Use pearls or sprinkles on the sides. Rotate first to choose a different side, then return here.'
  };

  hint.textContent = hints[mode];
}

function placeTopping(x, z, placement) {
  if (!TOPPINGS.includes(state.topping)) {
    hint.textContent = 'Choose a topping first.';
    return;
  }

  if (state.placements.length >= 60) {
    hint.textContent = 'You have reached 60 decorations. Undo or clear some first.';
    return;
  }

  snapshot();

  state.placements.push({
    ...placement,
    type: state.topping,
    x,
    z
  });

  render();

  hint.textContent = `${state.topping} added. Your estimate has updated.`;
}

function moveTopping(index, x, z, placement) {
  if (!state.placements[index]) return;

  snapshot();

  const existing = state.placements[index];

    state.placements[index] = {
      ...existing,
      ...placement,
      type: existing.type,
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
    state.appearance = { ...defaultAppearance };


    render();
    setView('rotate');
    return;
  }

  const key = button.dataset.key;
  const value = button.dataset.value;

  if (!key || !choices[key]?.includes(value)) return;

  // An icing swatch can also replace a custom icing colour.
  const replacesCustomIcing =
    key === 'colour' && Boolean(state.appearance?.icingColour);

  if (state[key] === value && !replacesCustomIcing) {
    if (key === 'topping' && value !== 'None') {
      setView(mode === 'side' ? 'side' : 'decorate');
    }

    return;
  }

  // Save the complete previous design before changing anything.
  snapshot();

  state[key] = value;

  if (key === 'colour') {
    state.appearance.icingColour = '';
  }

  const changesSurface = ['shape', 'tiers', 'finish'].includes(key);
  const removedDecorations =
    changesSurface && state.placements.length > 0;

  if (changesSurface) {
    state.placements = [];
  }

  render();

  if (key === 'topping') {
    setView(
      value === 'None'
        ? 'rotate'
        : mode === 'side'
          ? 'side'
          : 'decorate'
    );
  } else if (changesSurface) {
    setView('rotate');

    if (removedDecorations) {
      hint.textContent =
        'The cake surface changed, so decorations were cleared. Undo restores the previous design.';
    }
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