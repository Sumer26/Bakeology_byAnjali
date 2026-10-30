# Bakeology by Anjali — website prototype (v1)

A responsive, static website prototype created from 17 supplied cake photos and the supplied price list. No AI-generated images. The source photos are under `assets/`.

## Run locally

No dependencies required. Open `index.html` in a browser, or serve locally:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Features

- Responsive editorial design and mobile navigation
- Filterable gallery of 17 cake photographs
- Cake-detail modal with WhatsApp enquiry link
- Switchable dry/cream menu, transcribed from the supplied price sheet
- Enquiry form that prepares a WhatsApp message (no backend or data storage)
- Reduced-motion support, semantic HTML and keyboard-accessible controls

## Things to verify before launch

1. The bakery's official business name/spelling and permission to use photos.
2. Phone/WhatsApp number: `+91 84379 93098` (as shown on the provided price sheet).
3. Menu prices, currency, quantities/weights, availability, and flavour spellings (transcribed faithfully including unusual naming).
4. Pickup/delivery service area and business hours (not supplied; intentionally omitted).
5. Allergy and dietary product claims, including atta/gluten-free options.
6. Whether the business wants payments, online checkout, order tracking, or just enquiries.
7. Hosting, custom domain, analytics/privacy notices, and contact details.

This version does **not** make calls to an OpenAI model. An AI service, if needed, must be designed as a separate backend with a securely stored API key and a clear customer use case; never put a secret API key in browser JavaScript.
