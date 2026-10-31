const toggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('.mobile-nav');
const desktopLayout = matchMedia('(min-width: 1101px)');

function closeMenu({ restoreFocus = false } = {}) {
  if (!toggle || !nav) return;

  nav.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');

  if (restoreFocus) {
    toggle.focus({ preventScroll: true });
  }
}

if (toggle && nav) {
  toggle.setAttribute('aria-expanded', String(!nav.hidden));

  toggle.addEventListener('click', () => {
    const opening = nav.hidden;

    nav.hidden = !opening;
    toggle.setAttribute('aria-expanded', String(opening));
  });

  nav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !nav.hidden) {
      closeMenu({ restoreFocus: true });
    }
  });

  // Dismiss the menu when clicking elsewhere.
  document.addEventListener('click', event => {
    if (
      !nav.hidden &&
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  desktopLayout.addEventListener('change', event => {
    if (!event.matches) return;

    // Avoid leaving keyboard focus inside navigation being hidden.
    const focusWillBeHidden =
      nav.contains(document.activeElement) ||
      document.activeElement === toggle;

    closeMenu();

    if (focusWillBeHidden) {
      document.querySelector('.wordmark')?.focus({
        preventScroll: true
      });
    }
  });

  if (desktopLayout.matches) {
    closeMenu();
  }
}

const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}

// Preserve links saved from the old single-page website.
if (
  location.pathname.endsWith('/') ||
  location.pathname.endsWith('/index.html')
) {
  const routes = {
    '#collection': 'cakes.html',
    '#menu': 'flavours.html',
    '#cake-studio': 'contact.html',
    '#cake-customizer': 'design.html',
    '#enquire': 'contact.html'
  };

  const destination = routes[location.hash];

  if (destination) {
    location.replace(destination);
  }
}