export const PHONE = '918437993098';

// These names describe visual icing colours, not cake flavours.
export const colours = {
  Ivory: '#f1e2c8',
  Rose: '#e4a8b1',
  Pistachio: '#b8c59e',
  Lavender: '#c1b3d6',
  Cocoa: '#895946',

  'Vanilla cream': '#fff0d5',
  'Champagne blush': '#ead0bc',
  Peach: '#efb396',
  Apricot: '#e9a36b',
  'Butter yellow': '#efd884',
  'Strawberry pink': '#d987a0',
  Raspberry: '#aa4865',
  'Velvet red': '#893e48',
  'Powder blue': '#abc6db',
  Blueberry: '#77729e',
  Mint: '#bdd8c3',
  Sage: '#a4b293',
  'Mocha beige': '#b69a83',
  'Dark chocolate': '#503329'
};

// Separate from `choices`: these are appearance settings,
// not shape/finish options for the Surprise me button.
export const appearanceFields = [
  {
    key: 'icingColour',
    label: 'Icing colour',
    automaticLabel: 'Use selected icing palette'
  },
  {
    key: 'pipingColour',
    label: 'Piping colour',
    automaticLabel: 'Match the icing'
  },
  {
    key: 'dripColour',
    label: 'Drip colour',
    automaticLabel: 'Use the selected finish'
  },
  {
    key: 'messageColour',
    label: 'Message colour',
    automaticLabel: 'Automatic contrast'
  },
  {
    key: 'cherryColour',
    label: 'Cherry colour',
    automaticLabel: 'Classic cherry red'
  },
  {
    key: 'candleColour',
    label: 'Candle colour',
    automaticLabel: 'Warm ivory'
  },
  {
    key: 'pearlColour',
    label: 'Pearl colour',
    automaticLabel: 'Soft ivory'
  },
  {
    key: 'sprinkleColour',
    label: 'Sprinkle colour',
    automaticLabel: 'Mixed colours'
  }
];

// An empty value lets the renderer choose its existing default.
export const defaultAppearance = Object.fromEntries(
  appearanceFields.map(({ key }) => [key, ''])
);

export const initial = {
  shape: 'Round',
  tiers: 'One',
  colour: 'Ivory',
  finish: 'Piping',
  topping: 'Cherries',
  message: 'Make a wish',
  flavour: ''
};

export const choices = {
  shape: ['Round', 'Heart', 'Square'],
  tiers: ['One', 'Two'],
  colour: Object.keys(colours),

  finish: [
    'Smooth',
    'Piping',
    'Chocolate drip',
    'White chocolate drip',
    'Caramel drip'
  ],

  topping: [
    'None',
    'Cherries',
    'Candles',
    'Sprinkles',
    'Pearls'
  ]
};

export function whatsapp(message) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}