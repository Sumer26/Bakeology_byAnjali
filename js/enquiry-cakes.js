import { cakes } from './data/catalog.js';
import { getSavedCakes } from './saved-cakes.js';
import { choices, initial } from './config.js';

const DESIGN_KEY = 'bakeology.design.v1';

export function initialiseCakePicker(form) {
  const root = form.querySelector('#enquiry-cake-picker');

  if (!root) {
    throw new Error('The enquiry cake picker container is missing.');
  }

  const savedNames = new Set(getSavedCakes());
  const favourites = cakes.filter(cake => savedNames.has(cake[0]));
  const design = readDesign();

  root.innerHTML = `
    <label class="studio-field" for="enquiry-cake-source">
      Start with
      <select id="enquiry-cake-source" name="cake-source">
        <option value="collection">From our collection</option>
        <option value="favourites">My favourites</option>
        <option value="design">My custom design</option>
      </select>
    </label>

    <div data-cake-panel="collection">
      <label class="studio-field" for="enquiry-collection-cake">
        Choose a cake
        <select
          id="enquiry-collection-cake"
          name="collection-cake"
          required
        >
          <option value="">Select a cake…</option>
        </select>
      </label>

      <figure class="enquiry-cake-preview" hidden>
        <img alt="" loading="lazy">
        <figcaption></figcaption>
      </figure>
    </div>

    <div data-cake-panel="favourites" hidden>
      <p class="enquiry-cake-help">
        Select the saved designs you would like to discuss.
      </p>
      <div class="enquiry-favourites"></div>
    </div>

    <div data-cake-panel="design" hidden></div>

    <p
      class="enquiry-cake-error"
      role="alert"
      tabindex="-1"
      hidden
    ></p>
  `;

  const source = root.querySelector('#enquiry-cake-source');
  const collection = root.querySelector('#enquiry-collection-cake');
  const preview = root.querySelector('.enquiry-cake-preview');
  const favouriteList = root.querySelector('.enquiry-favourites');
  const designPanel = root.querySelector('[data-cake-panel="design"]');
  const error = root.querySelector('.enquiry-cake-error');

  cakes.forEach(([name]) => {
    collection.add(new Option(name, name));
  });

  if (favourites.length) {
    favourites.forEach(([name, file]) => {
      const label = document.createElement('label');
      label.className = 'enquiry-favourite';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'favourite-cakes';
      input.value = name;

      const image = document.createElement('img');
      image.src = `assets/${file}.jpg`;
      image.alt = '';
      image.loading = 'lazy';

      const title = document.createElement('span');
      title.textContent = name;

      label.append(input, image, title);
      favouriteList.append(label);
    });
  } else {
    addEmptyState(
      favouriteList,
      'You haven’t saved any cakes yet.',
      'Explore the collection ↗',
      'cakes.html'
    );
  }

  if (design) {
    const heading = document.createElement('p');
    heading.className = 'enquiry-design-title';
    heading.textContent = `${design.colour} / ${design.shape}`;

    const details = document.createElement('p');
    details.className = 'enquiry-cake-help';
    details.textContent = describeDesign(design);

    const message = document.createElement('p');
    message.className = 'enquiry-cake-help';
    message.textContent = `Cake message: ${design.message || 'None'}`;

    const edit = document.createElement('a');
    edit.className = 'enquiry-cake-link';
    edit.href = 'design.html';
    edit.textContent = 'Edit my design ↗';

    designPanel.append(heading, details, message, edit);
  } else {
    addEmptyState(
      designPanel,
      'You don’t have a saved design in this browser yet.',
      'Create your cake ↗',
      'design.html'
    );
  }

  function selectedFavourites() {
    return [...favouriteList.querySelectorAll('input:checked')]
      .map(input => input.value);
  }

  function updatePanels() {
    root.querySelectorAll('[data-cake-panel]').forEach(panel => {
      const active = panel.dataset.cakePanel === source.value;

      panel.hidden = !active;

      panel.querySelectorAll('input, select').forEach(control => {
        control.disabled = !active;
      });
    });

    clearError();
  }

  function clearError() {
    error.hidden = true;
    error.textContent = '';
  }

  function updatePreview() {
    const cake = cakes.find(item => item[0] === collection.value);

    preview.hidden = !cake;

    if (!cake) return;

    const image = preview.querySelector('img');

    image.src = `assets/${cake[1]}.jpg`;
    image.alt = `${cake[0]} cake`;
    preview.querySelector('figcaption').textContent = cake[0];

    // Keep the existing consultation inspiration image in sync.
    const inspiration = document.getElementById('studio-inspiration');
    const caption = document.getElementById('studio-image-name');

    if (inspiration) {
      inspiration.src = image.src;
      inspiration.alt = image.alt;
    }

    if (caption) caption.textContent = cake[0];
  }

  source.addEventListener('change', updatePanels);
  collection.addEventListener('change', updatePreview);
  root.addEventListener('change', clearError);

  updatePanels();

  return {
    summary() {
      if (source.value === 'favourites') {
        const names = selectedFavourites();

        return names.length
          ? `Favourites: ${names.join(', ')}`
          : 'Favourites: choose your cakes';
      }

      if (source.value === 'design') {
        return design
          ? `My design: ${describeDesign(design)} Writing: ${
              design.message || 'None'
            }.`
          : 'My design: no saved design yet';
      }

      return collection.value
        ? `Collection: ${collection.value}`
        : 'Collection: choose a cake';
    },

    validate() {
      let message = '';

      if (source.value === 'collection' && !collection.value) {
        message = 'Please choose a cake from the collection.';
      }

      if (source.value === 'favourites' && !selectedFavourites().length) {
        message = favourites.length
          ? 'Please select at least one favourite.'
          : 'Save a cake from the collection, or choose another starting point.';
      }

      if (source.value === 'design' && !design) {
        message = 'Create a cake design first, or choose another starting point.';
      }

      if (!message) {
        clearError();
        return true;
      }

      error.textContent = message;
      error.hidden = false;
      error.focus();

      return false;
    }
  };
}

function readDesign() {
  try {
    const saved = JSON.parse(localStorage.getItem(DESIGN_KEY));

    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
      return null;
    }

    const valid = Object.entries(choices).every(([key, options]) =>
      options.includes(saved[key])
    );

    if (!valid) return null;

    return {
      ...initial,
      ...Object.fromEntries(
        Object.keys(choices).map(key => [key, saved[key]])
      ),
      message: typeof saved.message === 'string'
        ? saved.message.slice(0, 28)
        : ''
    };
  } catch {
    return null;
  }
}

function describeDesign(design) {
  return [
    `${design.tiers === 'Two' ? 'Two-tier' : 'Single-tier'} ${
      design.shape.toLowerCase()
    } cake`,
    `${design.colour.toLowerCase()} icing`,
    design.finish.toLowerCase(),
    design.topping === 'None'
      ? 'no topping'
      : design.topping.toLowerCase()
  ].join(', ') + '.';
}

function addEmptyState(container, message, linkText, href) {
  const paragraph = document.createElement('p');
  paragraph.className = 'enquiry-cake-help';
  paragraph.textContent = message;

  const link = document.createElement('a');
  link.className = 'enquiry-cake-link';
  link.href = href;
  link.textContent = linkText;

  container.append(paragraph, link);
}