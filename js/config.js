export const PHONE = '918437993098';

export const colours = {
      Ivory: '#f1e2c8',
      Rose: '#e4a8b1',
      Pistachio: '#b8c59e',
      Lavender: '#c1b3d6',
      Cocoa: '#895946'
    };

export const initial = {
      shape: 'Round',
      tiers: 'One',
      colour: 'Ivory',
      finish: 'Piping',
      topping: 'Cherries',
      message: 'Make a wish'
    };

export const choices = {
  shape: ['Round', 'Heart', 'Square'],
  tiers: ['One', 'Two'],
  colour: Object.keys(colours),
  finish: ['Smooth', 'Piping', 'Chocolate drip'],
  topping: ['None', 'Cherries', 'Candles', 'Sprinkles']
};

export function whatsapp(message) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}
