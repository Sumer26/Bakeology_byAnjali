// DEMO RATES ONLY — replace with Anjali's approved pricing.
export const PRICING = {
  demo: true,
  base: { One: 1000, Two: 2200 },
  shape: { Round: 0, Heart: 200, Square: 150 },
  finish: {
    Smooth: 0,
    Piping: 250,
    'Chocolate drip': 200,
    'White chocolate drip': 250,
    'Caramel drip': 200
  },
  toppings: {
    Cherries: 25,
    Candles: 15,
    Sprinkles: 10,
    Pearls: 5
  },
  message: 100
};

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

export function calculatePrice(state) {
  const lines = [
    {
      label: state.tiers === 'Two'
        ? 'Two-tier cake'
        : 'Single-tier cake',
      amount: PRICING.base[state.tiers]
    },
    {
      label: `${state.shape} shape`,
      amount: PRICING.shape[state.shape] || 0
    },
    {
      label: state.finish,
      amount: PRICING.finish[state.finish] || 0
    }
  ];

  const counts = new Map();

  state.placements.forEach(({ type }) => {
    counts.set(type, (counts.get(type) || 0) + 1);
  });

  counts.forEach((quantity, type) => {
    lines.push({
      label: `${quantity} × ${
        type === 'Sprinkles' ? 'sprinkle clusters' : type.toLowerCase()
      }`,
      amount: quantity * (PRICING.toppings[type] || 0)
    });
  });

  if (state.message.trim()) {
    lines.push({
      label: 'Personalised message',
      amount: PRICING.message
    });
  }

  return {
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0)
  };
}

export function createPricePanel(parent) {
  const panel = document.createElement('aside');
  panel.className = 'cake-price';
  panel.setAttribute('aria-label', 'Cake price estimate');

  panel.innerHTML = `
    <div class="cake-price__heading">
      <span>Your cake, itemised</span>
      <span>${PRICING.demo ? 'DEMO PRICING' : 'ESTIMATE'}</span>
    </div>
    <dl class="cake-price__lines"></dl>
    <div class="cake-price__total">
      <span>Estimated total</span>
      <strong aria-live="polite" aria-atomic="true"></strong>
    </div>
    <p>
      ${
        PRICING.demo
          ? 'Illustrative prices for testing. These are not bakery prices.'
          : 'Final price depends on size, flavour and decoration details.'
      }
      Anjali will confirm your quotation before any order.
    </p>
  `;

  parent.append(panel);

  return state => {
    const price = calculatePrice(state);
    const list = panel.querySelector('dl');

    list.replaceChildren();

    price.lines.forEach(line => {
      if (!line.amount) return;

      const row = document.createElement('div');
      const label = document.createElement('dt');
      const amount = document.createElement('dd');

      label.textContent = line.label;
      amount.textContent = money.format(line.amount);

      row.append(label, amount);
      list.append(row);
    });

    panel.querySelector('strong').textContent = money.format(price.total);
  };
}