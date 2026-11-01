const STORAGE_KEY = 'bakeology.theme.v1';
const root = document.documentElement;
const buttons = [...document.querySelectorAll('[data-theme-toggle]')];

const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let manualPreference = readPreference();
let busy = false;
let pendingAutomaticTheme = null;
let activeTransition = null;
let activeAnimation = null;

function readPreference() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);

    return value === 'light' || value === 'dark'
      ? value
      : null;
  } catch {
    return null;
  }
}

function preferredTheme() {
  return manualPreference ||
    (systemTheme.matches ? 'dark' : 'light');
}

function updateButtons(theme) {
  const dark = theme === 'dark';

  buttons.forEach(button => {
    button.setAttribute(
      'aria-label',
      dark ? 'Switch to light mode' : 'Switch to dark mode'
    );

    const tooltip = button.querySelector('.theme-toggle__tooltip');

    if (tooltip) {
      tooltip.textContent = dark
        ? 'Back to the daylight.'
        : 'After-hours at Bakeology.';
    }
  });
}

function applyTheme(theme) {
  const changed = root.dataset.theme !== theme;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      'content',
      theme === 'dark' ? '#17120f' : '#f6f1e9'
    );

  updateButtons(theme);

  if (changed) {
    window.dispatchEvent(new CustomEvent('bakeology:themechange', {
      detail: { theme }
    }));
  }
}

function applyAutomaticTheme(theme) {
  if (busy) {
    pendingAutomaticTheme = theme;
    return;
  }

  applyTheme(theme);
}

function finishAnimationEarly() {
  activeAnimation?.cancel();
  activeTransition?.skipTransition();
}

async function switchTheme(theme, button) {
  busy = true;

  buttons.forEach(item => {
    item.setAttribute('aria-disabled', 'true');
  });

  let watchdog;

  try {
    const canReveal =
      typeof document.startViewTransition === 'function' &&
      !reducedMotion.matches &&
      document.visibilityState === 'visible';

    if (!canReveal) {
      if (!reducedMotion.matches) {
        root.classList.add('bakeology-theme-fade');

        // Commit the fallback transition styles before changing colours.
        void root.offsetWidth;
      }

      applyTheme(theme);

      if (!reducedMotion.matches) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return;
    }

    const bounds = button.getBoundingClientRect();

    const x = Math.max(
      0,
      Math.min(innerWidth, bounds.left + bounds.width / 2)
    );

    const y = Math.max(
      0,
      Math.min(innerHeight, bounds.top + bounds.height / 2)
    );

    const radius = Math.ceil(Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )) + 4;

    root.classList.add('bakeology-theme-reveal');

    const transition = document.startViewTransition(() => {
      applyTheme(theme);
    });

    activeTransition = transition;

    // Attach rejection handlers immediately, including skipped transitions.
    const finished = transition.finished.catch(() => {});
    const updated = transition.updateCallbackDone.catch(() => {});

    watchdog = setTimeout(finishAnimationEarly, 2000);

    try {
      await transition.ready;

      if (
        reducedMotion.matches ||
        document.visibilityState !== 'visible'
      ) {
        transition.skipTransition();
      } else {
        activeAnimation = root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 780,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
            fill: 'both'
          }
        );

        await activeAnimation.finished;

        // Reveal is complete; release the snapshots.
        transition.skipTransition();
      }
    } catch {
      // A skipped or unsupported animation must not prevent switching.
      transition.skipTransition();
    }

    await updated;
    await finished;

    // Ensure the requested theme wins even if snapshot creation failed.
    applyTheme(theme);
  } catch {
    activeTransition?.skipTransition();
    applyTheme(theme);
  } finally {
    clearTimeout(watchdog);

    activeAnimation?.cancel();
    activeAnimation = null;
    activeTransition = null;

    root.classList.remove(
      'bakeology-theme-reveal',
      'bakeology-theme-fade'
    );

    busy = false;

    buttons.forEach(item => {
      item.removeAttribute('aria-disabled');
    });

    if (pendingAutomaticTheme) {
      const theme = pendingAutomaticTheme;
      pendingAutomaticTheme = null;
      applyTheme(theme);
    }
  }
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    // Keep repeated clicks from creating overlapping transitions.
    // aria-disabled preserves keyboard focus during the animation.
    if (busy) return;

    const nextTheme =
      root.dataset.theme === 'dark' ? 'light' : 'dark';

    manualPreference = nextTheme;
    pendingAutomaticTheme = null;

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The choice still applies for this page visit.
    }

    void switchTheme(nextTheme, button);
  });
});

systemTheme.addEventListener('change', () => {
  if (manualPreference === null) {
    applyAutomaticTheme(preferredTheme());
  }
});

// Keep other open tabs consistent with an explicitly saved choice.
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;

  manualPreference = readPreference();
  applyAutomaticTheme(preferredTheme());
});

reducedMotion.addEventListener('change', event => {
  if (event.matches) finishAnimationEarly();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    finishAnimationEarly();
  }
});

// Avoid a reveal whose coverage no longer matches the viewport.
window.addEventListener('resize', () => {
  if (busy) finishAnimationEarly();
}, { passive: true });

// Initial setup is immediate, without the decorative reveal.
applyTheme(preferredTheme());

buttons.forEach(button => {
  button.hidden = false;
});

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    root.classList.add('theme-ready');
  });
});