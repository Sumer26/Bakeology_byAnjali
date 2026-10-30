import { getSavedCakes, toggleSavedCake } from './saved-cakes.js';
import { whatsapp } from './config.js';

const gallery = document.getElementById('gallery');
const dialog = document.getElementById('cake-dialog');

if (gallery && dialog) {
  initialiseCollectionTools();
}

function initialiseCollectionTools() {
  const toolbar = document.createElement('section');

  toolbar.className = 'collection-tools';
  toolbar.setAttribute('aria-label', 'Search and save cake designs');

  toolbar.innerHTML = `
    <div class="collection-tools__search">
      <label for="cake-search">Find your next celebration</label>
      <input
        id="cake-search"
        type="search"
        placeholder="Search by cake name or style…"
        autocomplete="off"
        aria-controls="gallery"
      >
    </div>

    <div class="collection-tools__actions">
      <button
        class="collection-tools__saved"
        type="button"
        aria-pressed="false"
        aria-controls="gallery"
      >
        Favourites <span data-saved-count>0</span>
      </button>

      <a
        class="collection-tools__enquire"
        target="_blank"
        rel="noopener noreferrer"
        hidden
      >
        Enquire about favourites ↗
      </a>
    </div>

    <p
      class="collection-tools__status"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    ></p>

    <div class="collection-tools__empty" hidden>
      <p>No designs match this view.</p>
      <button type="button" data-clear-view>
        Clear search and favourites filter
      </button>
    </div>
  `;

  gallery.before(toolbar);

  const search = toolbar.querySelector('input');
  const savedToggle = toolbar.querySelector('.collection-tools__saved');
  const count = toolbar.querySelector('[data-saved-count]');
  const enquire = toolbar.querySelector('.collection-tools__enquire');
  const status = toolbar.querySelector('[role="status"]');
  const empty = toolbar.querySelector('.collection-tools__empty');

  let showSavedOnly = false;

  // A separate control inside the existing cake details dialog.
  const saveButton = document.createElement('button');

  saveButton.type = 'button';
  saveButton.className = 'collection-save';
  saveButton.setAttribute('aria-pressed', 'false');

  const saveStatus = document.createElement('p');

  saveStatus.className = 'collection-save-status';
  saveStatus.setAttribute('role', 'status');

  const details = dialog.querySelector('.dialog-details');

  if (details) {
    details.append(saveButton, saveStatus);
  }

  function currentCakeName() {
    return dialog.querySelector('#dialog-title')?.textContent.trim() || '';
  }

  function updateDialogButton() {
    const name = currentCakeName();
    const saved = getSavedCakes().includes(name);

    saveButton.disabled = !name;
    saveButton.setAttribute('aria-pressed', String(saved));
    saveButton.textContent = saved
      ? '♥ Saved to favourites'
      : '♡ Save this design';
  }

  function updateCollection() {
    const saved = new Set(getSavedCakes());
    const query = search.value.trim().toLocaleLowerCase();
    const cards = [...gallery.querySelectorAll('.cake-card')];

    let visible = 0;

    cards.forEach(card => {
      const name = card.querySelector('strong')?.textContent.trim() || '';
      const searchableText = card.textContent.toLocaleLowerCase();
      const isSaved = saved.has(name);

      const matchesSearch = !query || searchableText.includes(query);
      const matchesSaved = !showSavedOnly || isSaved;

      card.hidden = !(matchesSearch && matchesSaved);
      card.classList.toggle('is-saved', isSaved);

      if (!card.hidden) visible += 1;
    });

    count.textContent = String(saved.size);
    savedToggle.setAttribute('aria-pressed', String(showSavedOnly));

    status.textContent =
      `${visible} ${visible === 1 ? 'design' : 'designs'} shown` +
      (showSavedOnly ? ' · Favourites' : '');

    empty.hidden = visible > 0;
    enquire.hidden = saved.size === 0;

    if (saved.size) {
      enquire.href = whatsapp([
        'Hello Bakeology by Anjali! I have shortlisted these cake designs:',
        ...[...saved].map(name => `• ${name}`),
        '',
        'Could we discuss availability, flavours, size and pricing?'
      ].join('\n'));
    } else {
      enquire.removeAttribute('href');
    }

    updateDialogButton();
  }

  search.addEventListener('input', updateCollection);

  savedToggle.addEventListener('click', () => {
    showSavedOnly = !showSavedOnly;
    updateCollection();
  });

  toolbar.querySelector('[data-clear-view]').addEventListener('click', () => {
    search.value = '';
    showSavedOnly = false;
    updateCollection();
    search.focus();
  });

  saveButton.addEventListener('click', () => {
    const name = currentCakeName();

    if (!name) return;

    const result = toggleSavedCake(name);
    saveStatus.textContent = result.message;
  });

  dialog.addEventListener('close', () => {
    saveStatus.textContent = '';
  });

  // Existing category filters rebuild the gallery.
  // Reapply the search and favourites view after each rebuild.
  const galleryObserver = new MutationObserver(updateCollection);

  galleryObserver.observe(gallery, {
    childList: true
  });

  const title = dialog.querySelector('#dialog-title');

  if (title) {
    const titleObserver = new MutationObserver(() => {
      saveStatus.textContent = '';
      updateDialogButton();
    });

    titleObserver.observe(title, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  window.addEventListener('bakeology:saved-change', updateCollection);

  // Keep favourites consistent between browser tabs.
  window.addEventListener('storage', updateCollection);

  // Hide the original total; the new status reflects visible results.
  document.querySelectorAll('.gallery-status').forEach(node => {
    node.hidden = true;
  });

  updateCollection();
}