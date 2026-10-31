import { colours, appearanceFields } from './config.js';
import {
  flavours,
  findFlavour,
  categoryLabel
} from './data/flavours.js';
import { getFlavourPalette } from './data/flavour-palettes.js';

const hexPattern = /^#[0-9a-f]{6}$/i;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, className) {
  const node = element('button', className, text);
  node.type = 'button';
  return node;
}

export function createAppearanceStudio(parent, getState, commit) {
  const studio = element('section', 'appearance-studio');
  studio.setAttribute('aria-label', 'Flavour and colour studio');

  studio.innerHTML = `
    <div class="flavour-edit">
      <p class="appearance-eyebrow">THE FLAVOUR INSIDE</p>
      <h2 class="flavour-edit__name"></h2>
      <p class="flavour-edit__price"></p>

      <details class="flavour-browser">
        <summary>Explore the flavour collection</summary>
        <div class="flavour-browser__body">
          <label for="studio-flavour-search">Find your flavour</label>
          <input
            id="studio-flavour-search"
            type="search"
            placeholder="Search the menu…"
            autocomplete="off"
          >
          <div class="flavour-browser__filters"
               role="group" aria-label="Flavour category"></div>
          <div class="flavour-browser__list"></div>
          <p class="flavour-browser__empty" hidden>
            No flavours match. Try another name or category.
          </p>
        </div>
      </details>

      <div class="flavour-palette">
        <p class="appearance-eyebrow">A LITTLE COLOUR INSPIRATION</p>
        <p class="flavour-palette__name"></p>
        <div class="flavour-palette__swatches"></div>
        <button type="button" class="flavour-palette__apply">
          Apply flavour palette ↗
        </button>
        <p class="appearance-note">
          Suggested design colours, inspired by the flavour name.
          Apply them when you want to change your cake’s colours.
        </p>
      </div>
    </div>

    <details class="colour-editor">
      <summary>Make the colours yours</summary>
      <p class="appearance-note">
        Choose a named shade or mix your own. Decoration colours
        apply to all decorations of that type.
      </p>
      <div class="colour-editor__fields"></div>
      <button type="button" class="colour-editor__reset">
        Restore automatic colours
      </button>
    </details>

    <p class="appearance-feedback" role="status"></p>
  `;

  parent.prepend(studio);

  const $ = selector => studio.querySelector(selector);
  const name = $('.flavour-edit__name');
  const price = $('.flavour-edit__price');
  const browser = $('.flavour-browser');
  const search = $('#studio-flavour-search');
  const filters = $('.flavour-browser__filters');
  const list = $('.flavour-browser__list');
  const empty = $('.flavour-browser__empty');
  const paletteName = $('.flavour-palette__name');
  const paletteSwatches = $('.flavour-palette__swatches');
  const apply = $('.flavour-palette__apply');
  const feedback = $('.appearance-feedback');

  const money = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  let category = '';
  const cards = [];
  const filterButtons = [];
  const colourRows = [];

  function filterCards() {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;

    cards.forEach(({ card, flavour }) => {
      const matches =
        (!category || flavour.category === category) &&
        flavour.name.toLocaleLowerCase().includes(query);

      card.hidden = !matches;
      if (matches) visible++;
    });

    empty.hidden = visible !== 0;

    filterButtons.forEach(({ node, value }) => {
      node.setAttribute('aria-pressed', String(category === value));
    });
  }

  const categories = [
    ['', 'All flavours'],
    ...[...new Set(flavours.map(item => item.category))]
      .map(value => [value, categoryLabel(value)])
  ];

  categories.forEach(([value, label]) => {
    const node = button(label);
    node.addEventListener('click', () => {
      category = value;
      filterCards();
    });

    filters.append(node);
    filterButtons.push({ node, value });
  });

  flavours.forEach(flavour => {
    const palette = getFlavourPalette(flavour.id);
    const card = button('', 'flavour-card');
    card.style.setProperty('--flavour-accent', palette.accent);
    card.setAttribute('aria-pressed', 'false');

    const dot = element('span', 'flavour-card__dot');
    dot.setAttribute('aria-hidden', 'true');

    const copy = element('span', 'flavour-card__copy');
    copy.append(
      element('span', 'flavour-card__name', flavour.name),
      element(
        'span',
        'flavour-card__category',
        categoryLabel(flavour.category)
      )
    );

    const amount = element(
      'span',
      'flavour-card__price',
      money.format(flavour.price)
    );

    const mark = element('span', 'flavour-card__mark', '+');
    mark.setAttribute('aria-hidden', 'true');

    card.append(dot, copy, amount, mark);

    card.addEventListener('click', () => {
      if (getState().flavour !== flavour.id) {
        commit({ flavour: flavour.id });
      }

      // Move focus before hiding the selected card's container.
      browser.querySelector('summary').focus();
      browser.open = false;

      feedback.textContent =
        `${flavour.name} selected. Your cake colours are unchanged.`;
    });

    list.append(card);
    cards.push({ card, flavour, mark });
  });

  search.addEventListener('input', filterCards);

  apply.addEventListener('click', () => {
    const flavour = findFlavour(getState().flavour);
    if (!flavour) return;

    const palette = getFlavourPalette(flavour.id);

    commit({
      appearance: { ...palette.appearance }
    });

    feedback.textContent =
      `${palette.name} applied. Shape and decorations are preserved.`;
  });

  appearanceFields.forEach(field => {
    const row = element('div', 'colour-editor__row');
    const id = `studio-${field.key}`;

    const label = element('label', '', field.label);
    label.htmlFor = `${id}-preset`;

    const controls = element('div', 'colour-editor__inputs');
    const select = element('select');
    select.id = `${id}-preset`;

    select.append(new Option(field.automaticLabel, ''));

    Object.entries(colours).forEach(([label, value]) => {
      select.append(new Option(label, value.toLowerCase()));
    });

    const customOption = new Option('Custom shade', 'custom');
    customOption.disabled = true;
    select.append(customOption);

    const custom = element('input');
    custom.type = 'color';
    custom.id = `${id}-custom`;
    custom.setAttribute('aria-label', `Choose a custom ${field.label.toLowerCase()}`);

    const note = element('span', 'colour-editor__value');
    note.id = `${id}-note`;
    select.setAttribute('aria-describedby', note.id);
    custom.setAttribute('aria-describedby', note.id);

    function setColour(value) {
      const state = getState();

      if ((state.appearance?.[field.key] || '') === value) return;

      commit({
        appearance: {
          ...state.appearance,
          [field.key]: value
        }
      });
    }

    select.addEventListener('change', () => {
      if (select.value !== 'custom') setColour(select.value);
    });

    // One committed colour change creates one Undo step.
    custom.addEventListener('change', () => {
      setColour(custom.value.toLowerCase());
    });

    controls.append(select, custom);
    row.append(label, controls, note);
    $('.colour-editor__fields').append(row);

    colourRows.push({ field, row, select, custom, note });
  });

  $('.colour-editor__reset').addEventListener('click', () => {
    const appearance = getState().appearance || {};
    if (!Object.values(appearance).some(Boolean)) return;

    commit({
      appearance: Object.fromEntries(
        appearanceFields.map(({ key }) => [key, ''])
      )
    });

    feedback.textContent =
      'Automatic colours restored. Your selected icing shade is retained.';
  });

  function update(state) {
    const flavour = findFlavour(state.flavour);
    const palette = getFlavourPalette(flavour?.id);

    studio.style.setProperty('--flavour-accent', palette.accent);
    name.textContent = flavour?.name || 'Find your favourite.';

    price.textContent = flavour
      ? `${categoryLabel(flavour.category)} · Menu reference ${
          money.format(flavour.price)
        }. Serving size requires confirmation; this is not an extra charge in the demo estimate.`
      : 'Explore all 20 menu flavours, then choose a palette to make it yours.';

    cards.forEach(({ card, flavour: item, mark }) => {
      const active = item.id === state.flavour;
      card.setAttribute('aria-pressed', String(active));
      mark.textContent = active ? '✓' : '+';
    });

    paletteName.textContent = palette.name;
    apply.disabled = !flavour;

    paletteSwatches.replaceChildren();

    [
      ['Icing', palette.appearance.icingColour],
      ['Piping', palette.appearance.pipingColour],
      ['Drip', palette.appearance.dripColour],
      ['Writing', palette.appearance.messageColour]
    ].forEach(([label, colour]) => {
      const chip = element('span', 'palette-chip');
      const swatch = element('i');
      swatch.style.backgroundColor = colour;
      swatch.setAttribute('aria-hidden', 'true');
      chip.append(swatch, document.createTextNode(label));
      paletteSwatches.append(chip);
    });

    const used = new Set((state.placements || []).map(item => item.type));
    used.add(state.topping);

    const activeFields = {
      icingColour: true,
      pipingColour: state.finish === 'Piping',
      dripColour: state.finish.toLowerCase().includes('drip'),
      messageColour: true,
      cherryColour: used.has('Cherries'),
      candleColour: used.has('Candles'),
      pearlColour: used.has('Pearls'),
      sprinkleColour: used.has('Sprinkles')
    };

    const defaults = {
      icingColour: colours[state.colour] || colours.Ivory,
      pipingColour:
        state.appearance?.icingColour ||
        colours[state.colour] ||
        colours.Ivory,
      dripColour: {
        'Chocolate drip': '#381c13',
        'White chocolate drip': '#f3dfb6',
        'Caramel drip': '#b66b2e'
      }[state.finish] || '#381c13',
      messageColour: '#653a2b',
      cherryColour: '#8f1223',
      candleColour: '#fff0cf',
      pearlColour: '#fff2db',
      sprinkleColour: '#cc7894'
    };

    colourRows.forEach(({ field, row, select, custom, note }) => {
      row.hidden = !activeFields[field.key];

      const raw = state.appearance?.[field.key];
      const value = typeof raw === 'string' && hexPattern.test(raw)
        ? raw.toLowerCase()
        : '';

      const named = Object.entries(colours).find(
        ([, hex]) => hex.toLowerCase() === value
      );

      select.value = value ? named ? value : 'custom' : '';
      custom.value = value || defaults[field.key];

      note.textContent = value
        ? `${named?.[0] || 'Custom'} · ${value.toUpperCase()}`
        : field.automaticLabel;
    });
  }

  filterCards();
  return { update };
}