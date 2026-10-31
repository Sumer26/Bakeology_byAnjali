import { calculatePrice, PRICING } from './cake-pricing.js';
import { findFlavour } from './data/flavours.js';

let pdfLibrary;

function loadPDFLibrary() {
  if (window.jspdf?.jsPDF) {
    return Promise.resolve(window.jspdf.jsPDF);
  }

  if (!pdfLibrary) {
    pdfLibrary = new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.src =
        'https://cdn.jsdelivr.net/npm/jspdf@3.0.3/dist/jspdf.umd.min.js';

      script.onload = () => {
        if (window.jspdf?.jsPDF) {
          resolve(window.jspdf.jsPDF);
        } else {
          pdfLibrary = null;
          script.remove();
          reject(new Error('PDF library did not initialise.'));
        }
      };

      script.onerror = () => {
        pdfLibrary = null;
        script.remove();
        reject(new Error('Could not load the PDF library.'));
      };

      document.head.append(script);
    });
  }

  return pdfLibrary;
}

export async function downloadDesignPDF({ state, preview }) {
  const jsPDF = await loadPDFLibrary();
  await document.fonts.ready;

  const image = new Image();
  image.src = preview;
  await image.decode();

  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;

  const context = canvas.getContext('2d');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

  let y;
  let pageNumber = 0;

  function startPage() {
    context.fillStyle = '#faf6ee';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#302622';
    context.font = '48px Georgia, serif';
    context.fillText('bakeology.', 90, 100);

    context.font = '18px Arial, sans-serif';
    context.fillText('BY ANJALI / YOUR CAKE DESIGN', 90, 138);

    context.fillStyle = '#946752';
    context.fillText(
      PRICING.demo ? 'DEMO PRICING — NOT A QUOTATION' : 'ESTIMATE — SUBJECT TO CONFIRMATION',
      90,
      180
    );

    y = 230;
  }

  function finishPage() {
    context.fillStyle = '#796b60';
    context.font = '16px Arial, sans-serif';
    context.fillText(
      'Illustrated design. Decoration, size, flavour and availability require confirmation.',
      90,
      1670
    );

    if (pageNumber) pdf.addPage();

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      210,
      297,
      undefined,
      'FAST'
    );

    pageNumber += 1;
  }

  function line(text, size = 23, colour = '#493b31') {
    context.font = `${size}px Arial, sans-serif`;

    // Wrap by characters so long unbroken messages also fit.
    const lines = [];
    let current = '';

    for (const character of String(text)) {
      if (
        character === '\n' ||
        context.measureText(current + character).width > 1060
      ) {
        lines.push(current);
        current = character === '\n' ? '' : character;
      } else {
        current += character;
      }
    }

    if (current) lines.push(current);

    for (const textLine of lines) {
      if (y + size * 1.5 > 1600) {
        finishPage();
        startPage();
      }

      context.font = `${size}px Arial, sans-serif`;
      context.fillStyle = colour;
      context.fillText(textLine, 90, y);

      y += size * 1.5;
    }

    y += 8;
  }

  startPage();

  const imageScale = Math.min(1060 / image.width, 530 / image.height);
  const width = image.width * imageScale;
  const height = image.height * imageScale;

  context.drawImage(image, (1240 - width) / 2, y, width, height);
  y += height + 50;

  const flavour = findFlavour(state.flavour);

  line(`${state.colour} / ${state.shape}`, 32);
  line(`Tiers: ${state.tiers} · Finish: ${state.finish}`);
  line(`Flavour: ${flavour?.name || 'To be confirmed'}`);

  if (flavour) {
    line(
      `Menu reference: ₹${flavour.price}. Not added separately to this estimate.`,
      19,
      '#796b60'
    );
  }

  line(`Message: ${state.message || 'None'}`);

  const decorations = new Map();

  state.placements.forEach(item => {
    const tier = item.tier ?? (state.tiers === 'Two' ? 1 : 0);
    const location = state.tiers === 'Two'
      ? tier === 1 ? 'upper tier' : 'lower tier'
      : 'cake';

    const label = `${item.type} — ${location}, ${item.surface || 'top'}`;

    decorations.set(label, (decorations.get(label) || 0) + 1);
  });

  line('DECORATIONS', 19, '#946752');

  if (!decorations.size) line('No decorations placed.', 21);

  decorations.forEach((count, label) => {
    line(`${count} × ${label}`, 21);
  });

  y += 12;

  line(
    PRICING.demo ? 'ITEMISED DEMO ESTIMATE' : 'ITEMISED ESTIMATE',
    19,
    '#946752'
  );

  const estimate = calculatePrice(state);

  estimate.lines.filter(item => item.amount).forEach(item => {
    line(`${item.label} — ₹${item.amount.toLocaleString('en-IN')}`, 21);
  });

  line(`Total: ₹${estimate.total.toLocaleString('en-IN')}`, 30);

  if (PRICING.demo) {
    line(
      'These are illustrative test rates, not approved bakery prices.',
      19,
      '#946752'
    );
  }

  finishPage();
  pdf.save('Bakeology-my-cake-design.pdf');
}