import { menus } from './menu.js';

export const flavours = Object.entries(menus).flatMap(([category, items]) =>
  items.map(([name, price]) => ({
    id: `${category}:${name}`,
    name,
    category,
    price
  }))
);

export function findFlavour(id) {
  return flavours.find(flavour => flavour.id === id) || null;
}

const STORAGE_KEY = 'bakeology.flavour.v1';

export function saveFlavour(id) {
  if (!findFlavour(id)) return;

  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // The link also carries the selection if storage is unavailable.
  }
}

export function savedFlavour() {
  try {
    return findFlavour(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function categoryLabel(category) {
  return category === 'cream'
    ? 'Cream cakes'
    : category === 'dry'
      ? 'Dry cakes'
      : category;
}