const toggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('.mobile-nav');

function closeMenu() {
  nav.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
}

toggle?.addEventListener('click', () => {
  nav.hidden = !nav.hidden;
  toggle.setAttribute('aria-expanded', String(!nav.hidden));
});

nav?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav && !nav.hidden) {
    closeMenu();
    toggle.focus();
  }
});

matchMedia('(min-width:1001px)').addEventListener(
  'change',
  event => {
    if (event.matches) closeMenu();
  }
);

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

  if (routes[location.hash]) {
    location.replace(routes[location.hash]);
  }
}
