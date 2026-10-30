import { whatsapp } from './config.js';
import { initialiseCakePicker } from './enquiry-cakes.js';
const form = document.getElementById('studio-form');
const cakePicker = initialiseCakePicker(form);

const steps = [
  ...form.querySelectorAll('[data-studio-step]')
];

const field = name => form.elements.namedItem(name);

const selected = name =>
  form.querySelector(`input[name="${name}"]:checked`)?.value
  || 'To be confirmed';

const date = document.getElementById('studio-date');
const today = new Date();

date.min = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0')
].join('-');

const back = document.getElementById('studio-back');
const next = document.getElementById('studio-next');
const send = document.getElementById('studio-send');

let current = 0;

function updateSummary() {
  const guests = field('studio-guests').value;

  const guestText = guests === 'Not sure yet'
    ? 'Guest count to confirm'
    : `${guests} guests`;

  document.getElementById('studio-summary').textContent = [
    selected('studio-occasion'),
    cakePicker.summary(),
    guestText,
    field('studio-flavour').value
  ].join(' · ');
}

function show(index, focus = false) {
  current = Math.max(
    0,
    Math.min(steps.length - 1, index)
  );

  steps.forEach((step, i) => {
    step.hidden = i !== current;
    step.classList.toggle('is-current', i === current);
  });

  back.hidden = current === 0;
  next.hidden = current === steps.length - 1;
  send.hidden = current !== steps.length - 1;

  document.getElementById('studio-step-indicator').textContent =
    `0${current + 1} / 0${steps.length}`;

  document.getElementById('studio-progress-bar').style.transform =
    `scaleX(${(current + 1) / steps.length})`;

  updateSummary();

  if (focus) {
    const legend = steps[current].querySelector('legend');
    legend.tabIndex = -1;
    legend.focus({ preventScroll: true });

    legend.scrollIntoView({
      block: 'nearest',
      behavior: 'instant'
    });
  }
}

function validateStep(index) {
  // Validate the cake selection once.
  if (index === 1 && !cakePicker.validate()) {
    show(index);
    cakePicker.validate();
    return false;
  }

  const inputs = [
    ...steps[index].querySelectorAll('input, select, textarea')
  ];

  for (const input of inputs) {
    if (input.disabled) continue;

    if (input.required && input.type === 'text') {
      input.setCustomValidity(
        input.value.trim()
          ? ''
          : 'Please enter your name.'
      );
    }

    if (!input.checkValidity()) {
      show(index);
      input.reportValidity();
      return false;
    }
  }

  return true;
}

next.addEventListener('click', () => {
  if (validateStep(current)) {
    show(current + 1, true);
  }
});

back.addEventListener('click', () => {
  show(current - 1, true);
});

form.addEventListener('input', event => {
  event.target.setCustomValidity?.('');
});

form.addEventListener('change', () => {
  updateSummary();

  const input = form.querySelector(
    'input[name="studio-design"]:checked'
  );

  const image = document.getElementById('studio-inspiration');

  if (input?.dataset.preview) {
    image.src = input.dataset.preview;
    image.alt = `${input.value} inspiration cake`;

    document.getElementById('studio-image-name').textContent =
      input.value;
  }
});

form.addEventListener('submit', event => {
  event.preventDefault();

  if (current < steps.length - 1) {
    if (validateStep(current)) {
      show(current + 1, true);
    }
    return;
  }

  for (let i = 0; i < steps.length; i++) {
    if (!validateStep(i)) return;
  }

  location.assign(whatsapp([
    'Hello Bakeology by Anjali! I would like to enquire about a custom cake.',
    `Name: ${field('studio-name').value.trim()}`,
    `Occasion: ${selected('studio-occasion')}`,
    `Date: ${date.value || 'To be confirmed'}`,
    `Guests: ${field('studio-guests').value}`,
    `Cake choice: ${cakePicker.summary()}`,
    `Flavour: ${field('studio-flavour').value}`,
    `Notes: ${field('studio-notes').value.trim() || 'None yet'}`,
    'Please confirm availability, suitable sizes and a quotation.'
  ].join('\n')));
});

show(0);
