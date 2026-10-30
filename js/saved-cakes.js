const STORAGE_KEY = 'bakeology.saved-cakes.v1';

export function getSavedCakes() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return Array.isArray(value)
      ? [...new Set(value.filter(name => typeof name === 'string'))]
      : [];
  } catch {
    return [];
  }
}

export function toggleSavedCake(name) {
  const saved = new Set(getSavedCakes());

  if (saved.has(name)) {
    saved.delete(name);
  } else {
    saved.add(name);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]));
  } catch {
    return {
      success: false,
      message: 'Your browser could not save this design.'
    };
  }

  window.dispatchEvent(new Event('bakeology:saved-change'));

  return {
    success: true,
    message: saved.has(name)
      ? `${name} added to favourites.`
      : `${name} removed from favourites.`
  };
}