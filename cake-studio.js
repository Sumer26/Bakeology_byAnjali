(() => {
  'use strict';

  function mount() {
    const anchor = document.querySelector('#atelier');

    if (!anchor || document.querySelector('#cake-studio')) return;

    const host = document.createElement('section');
    host.id = 'cake-studio';
    host.style.scrollMarginTop = '90px';
    anchor.before(host);

    const root = host.attachShadow({ mode: 'open' });

    const colours = {
      Ivory: '#f1e2c8',
      Rose: '#e4a8b1',
      Pistachio: '#b8c59e',
      Lavender: '#c1b3d6',
      Cocoa: '#895946'
    };

    const initial = {
      shape: 'Round',
      tiers: 'One',
      colour: 'Ivory',
      finish: 'Piping',
      topping: 'Cherries',
      message: 'Make a wish'
    };

    let state = { ...initial };

    const options = (key, values) => values.map(value => `
      <button
        type="button"
        data-key="${key}"
        data-value="${value}"
        aria-pressed="${state[key] === value}"
      >${value}</button>
    `).join('');

    root.innerHTML = `
      <style>
        :host {
          display: block;
          color: #2e2825;
          background: #eee7dc;
          font-family: var(--sans, 'DM Sans', Arial, sans-serif);
        }

        * { box-sizing: border-box; }
        button, input { font: inherit; }
        button { cursor: pointer; }

        button, a, input {
          -webkit-tap-highlight-color: transparent;
        }

        button:focus-visible,
        a:focus-visible,
        input:focus-visible {
          outline: 2px solid #895946;
          outline-offset: 4px;
        }

        .studio {
          max-width: 1600px;
          margin: auto;
          padding: 88px clamp(22px, 5.1vw, 92px);
        }

        .intro {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 32px;
          margin-bottom: 40px;
        }

        .kicker, .index, .caption {
          font-family: var(--mono, 'DM Mono', monospace);
          font-size: 10px;
          letter-spacing: .12em;
          line-height: 1.6;
          text-transform: uppercase;
        }

        h2 {
          font: 400 clamp(48px, 5.5vw, 88px)/.98
            var(--serif, 'Instrument Serif', Georgia, serif);
          letter-spacing: -.035em;
          margin: 18px 0 0;
        }

        h2 em {
          font-weight: 400;
          color: #896757;
        }

        .intro p {
          max-width: 300px;
          font-size: 13px;
          line-height: 1.85;
          margin: 0;
          color: #766c64;
        }

        .layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1.15fr) minmax(0, 1fr);
          border-top: 1px solid #cfc4b6;
          border-bottom: 1px solid #cfc4b6;
        }

        .preview {
          position: sticky;
          top: 20px;
          align-self: start;
          min-width: 0;
        }

        .preview-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 24px 28px 0 0;
        }

        .text-button {
          border: 0;
          background: none;
          padding: 10px 0;
          color: #69594d;
          font-size: 12px;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .art {
          background: radial-gradient(
            ellipse at 50% 48%,
            #fffaf2 0%,
            #eee7dc 67%
          );
        }

        svg {
          display: block;
          width: 100%;
          height: auto;
          max-height: 540px;
          overflow: visible;
        }

        .preview-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          border-top: 1px solid #d7cfc5;
          margin-right: 28px;
          padding: 21px 0;
        }

        .preview-foot p {
          font: italic 26px
            var(--serif, 'Instrument Serif', Georgia, serif);
          margin: 0;
        }

        .caption {
          color: #766c64;
          max-width: 170px;
          font-size: 9px;
          text-align: right;
        }

        .controls {
          padding: 12px 0 26px 40px;
          border-left: 1px solid #cfc4b6;
          min-width: 0;
        }

        fieldset {
          border: 0;
          border-bottom: 1px solid #d7cfc5;
          padding: 20px 0 23px;
          margin: 0;
          min-width: 0;
        }

        legend {
          float: left;
          width: 100%;
          padding: 0;
          margin-bottom: 13px;
          font-size: 13px;
          font-weight: 500;
        }

        legend span {
          font: 10px var(--mono, monospace);
          color: #896757;
          margin-right: 12px;
        }

        .choices {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          clear: both;
        }

        .choices button {
          border: 1px solid #c9bfb2;
          color: #54483e;
          background: transparent;
          min-height: 42px;
          padding: 10px 15px;
          font-size: 12px;
          transition: background .2s, color .2s;
        }

        .choices button:hover {
          background: #e2d8cb;
        }

        .choices button[aria-pressed=true] {
          background: #332b26;
          border-color: #332b26;
          color: #fffaf2;
        }

        .swatches { gap: 13px; }

        .swatches button {
          display: flex;
          align-items: center;
          gap: 7px;
          border: 0;
          padding: 6px 2px;
          min-height: 44px;
          background: none !important;
          color: #54483e !important;
        }

        .swatches i {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: var(--swatch);
          box-shadow: inset 0 0 0 1px #332b2630;
          display: block;
        }

        .swatches button[aria-pressed=true] i {
          outline: 1px solid #54483e;
          outline-offset: 4px;
        }

        .swatches button[aria-pressed=true] {
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .writing { padding-top: 24px; }

        .writing label {
          display: block;
          font-size: 13px;
          margin-bottom: 12px;
        }

        input {
          width: 100%;
          border: 0;
          border-bottom: 1px solid #aa9987;
          background: transparent;
          color: #332b26;
          border-radius: 0;
          padding: 10px 0;
          font-size: 18px;
        }

        .input-note {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin: 9px 0 24px;
          font-size: 11px;
          line-height: 1.5;
          color: #766c64;
        }

        .cta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          background: #332b26;
          color: #fffaf2;
          text-decoration: none;
          font-size: 13px;
          padding: 19px 22px;
          transition: background .2s;
        }

        .cta:hover { background: #624839; }

        .note {
          font-size: 11px;
          line-height: 1.7;
          color: #766c64;
          margin: 13px 0 0;
        }

        .sr {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 850px) {
          .studio { padding-block: 55px; }

          .intro {
            display: block;
            margin-bottom: 28px;
          }

          .intro p {
            margin-top: 22px;
            max-width: 440px;
          }

          .layout { grid-template-columns: 1fr; }

          .preview {
            position: sticky;
            top: 0;
            z-index: 2;
            background: #eee7dc;
          }

          .preview-head { padding: 5px 0 0; }

          .art svg {
            height: 210px;
            max-height: 28svh;
          }

          .preview-foot {
            margin-right: 0;
            padding: 8px 0;
          }

          .preview-foot p { font-size: 21px; }
          .caption { display: none; }

          .controls {
            border-left: 0;
            padding: 0 0 24px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      </style>

      <div class="studio">
        <header class="intro">
          <div>
            <span class="kicker">
              Bakeology / The interactive cake studio
            </span>

            <h2>
              A little imagination.<br>
              <em>A cake that's yours.</em>
            </h2>
          </div>

          <p>
            Choose a silhouette. Play with the finishing touches.
            Watch your idea take shape, one little detail at a time.
          </p>
        </header>

        <div class="layout">
          <div class="preview">
            <div class="preview-head">
              <span class="index">Your cake / Live preview</span>

              <button
                type="button"
                class="text-button"
                id="surprise"
              >Surprise me ↗</button>
            </div>

            <div class="art">
              <svg
                id="cake"
                viewBox="0 0 600 470"
                role="img"
                aria-labelledby="cake-title cake-description"
              >
                <title id="cake-title">Your custom cake</title>
                <desc id="cake-description"></desc>

                <defs>
                  <linearGradient id="side" x1="0" x2="1">
                    <stop
                      offset="0"
                      stop-color="#000"
                      stop-opacity=".13"
                    />
                    <stop
                      offset=".35"
                      stop-color="#fff"
                      stop-opacity=".12"
                    />
                    <stop
                      offset="1"
                      stop-color="#000"
                      stop-opacity=".22"
                    />
                  </linearGradient>

                  <radialGradient id="top">
                    <stop stop-color="#fff" stop-opacity=".3"/>
                    <stop
                      offset="1"
                      stop-color="#fff"
                      stop-opacity="0"
                    />
                  </radialGradient>

                  <radialGradient id="shadow">
                    <stop
                      stop-color="#5b4431"
                      stop-opacity=".23"
                    />
                    <stop
                      offset="1"
                      stop-color="#5b4431"
                      stop-opacity="0"
                    />
                  </radialGradient>
                </defs>

                <ellipse
                  cx="300" cy="390" rx="220" ry="34"
                  fill="url(#shadow)"
                />

                <ellipse
                  cx="300" cy="367" rx="208" ry="63"
                  fill="#cbbba7"
                />

                <ellipse
                  cx="300" cy="362" rx="208" ry="63"
                  fill="#faf5e9"
                  stroke="#dfd3c3"
                />

                <g id="drawing"></g>
              </svg>
            </div>

            <div class="preview-foot">
              <p id="design-name"></p>

              <span class="caption">
                An illustrated idea.<br>
                Handmade, in real life.
              </span>
            </div>

            <button
              type="button"
              class="text-button"
              id="reset"
            >Reset design</button>
          </div>

          <div class="controls">
            <fieldset>
              <legend><span>01</span>The silhouette</legend>
              <div class="choices">
                ${options('shape', ['Round', 'Heart', 'Square'])}
              </div>
            </fieldset>

            <fieldset>
              <legend><span>02</span>A little more cake</legend>
              <div class="choices">
                ${options('tiers', ['One', 'Two'])}
              </div>
            </fieldset>

            <fieldset>
              <legend><span>03</span>Your icing palette</legend>

              <div class="choices swatches">
                ${Object.entries(colours).map(([name, hex]) => `
                  <button
                    type="button"
                    data-key="colour"
                    data-value="${name}"
                    aria-pressed="${state.colour === name}"
                  >
                    <i
                      style="--swatch:${hex}"
                      aria-hidden="true"
                    ></i>
                    ${name}
                  </button>
                `).join('')}
              </div>
            </fieldset>

            <fieldset>
              <legend><span>04</span>The finishing touch</legend>
              <div class="choices">
                ${options('finish', [
                  'Smooth', 'Piping', 'Chocolate drip'
                ])}
              </div>
            </fieldset>

            <fieldset>
              <legend><span>05</span>Something on top</legend>
              <div class="choices">
                ${options('topping', [
                  'None', 'Cherries', 'Candles', 'Sprinkles'
                ])}
              </div>
            </fieldset>

            <div class="writing">
              <label for="cake-message">
                06 &nbsp; Say it with cake
              </label>

              <input
                id="cake-message"
                type="text"
                maxlength="28"
                value="Make a wish"
                placeholder="Your little message…"
                autocomplete="off"
                aria-describedby="message-help"
              >

              <div class="input-note">
                <span id="message-help">
                  A short message looks best.
                </span>
                <span id="count">11 / 28</span>
              </div>
            </div>

            <a
              class="cta"
              id="enquire"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enquire about this cake
              <span aria-hidden="true">↗</span>
            </a>

            <p class="note">
              Opens WhatsApp with your design choices.
              This is a design idea; Anjali will confirm decoration,
              flavour, size, price and availability.
            </p>

            <p
              class="sr"
              id="announcement"
              role="status"
              aria-live="polite"
            ></p>
          </div>
        </div>
      </div>
    `;

    const $ = selector => root.querySelector(selector);
    const ns = 'http://www.w3.org/2000/svg';

    function el(tag, attrs = {}, parent) {
      const node = document.createElementNS(ns, tag);

      Object.entries(attrs).forEach(([key, value]) => {
        node.setAttribute(key, String(value));
      });

      if (parent) parent.append(node);

      return node;
    }

    const path = points =>
      `M${points.map(point => point.join(',')).join(' L')}Z`;

    function outline(shape) {
      if (shape === 'Square') {
        return [
          [-155, -50],
          [105, -76],
          [155, 50],
          [-105, 76]
        ];
      }

      return Array.from({ length: 96 }, (_, i) => {
        const t = i * Math.PI * 2 / 96;

        if (shape === 'Heart') {
          return [
            155 * Math.sin(t) ** 3,
            -(
              13 * Math.cos(t)
              - 5 * Math.cos(2 * t)
              - 2 * Math.cos(3 * t)
              - Math.cos(4 * t)
            ) * 4.5
          ];
        }

        return [
          160 * Math.sin(t),
          -73 * Math.cos(t)
        ];
      });
    }

    function frontEdge(points) {
      const min = Math.min(...points.map(point => point[0]));
      const max = Math.max(...points.map(point => point[0]));

      return Array.from({ length: 65 }, (_, i) => {
        const x = min + .01 + (max - min - .02) * i / 64;
        const ys = [];

        points.forEach(([ax, ay], j) => {
          const [bx, by] = points[(j + 1) % points.length];

          if (
            ax !== bx &&
            x >= Math.min(ax, bx) &&
            x <= Math.max(ax, bx)
          ) {
            ys.push(ay + (by - ay) * (x - ax) / (bx - ax));
          }
        });

        return [x, Math.max(...ys)];
      });
    }

    function perimeter(points, count) {
      const lengths = points.map((point, i) => {
        const next = points[(i + 1) % points.length];

        return Math.hypot(
          next[0] - point[0],
          next[1] - point[1]
        );
      });

      const total = lengths.reduce((a, b) => a + b, 0);

      return Array.from({ length: count }, (_, i) => {
        let distance = total * i / count;
        let j = 0;

        while (
          j < lengths.length - 1 &&
          distance > lengths[j]
        ) {
          distance -= lengths[j++];
        }

        const point = points[j];
        const next = points[(j + 1) % points.length];
        const fraction = distance / lengths[j];

        return [
          point[0] + (next[0] - point[0]) * fraction,
          point[1] + (next[1] - point[1]) * fraction
        ];
      });
    }

    function render() {
      const drawing = $('#drawing');
      drawing.replaceChildren();

      const points = outline(state.shape);
      const front = frontEdge(points);
      const depth = 88;

      const sidePath = path([
        ...front,
        ...front.map(([x, y]) => [x, y + depth]).reverse()
      ]);

      const tierCount = state.tiers === 'Two' ? 2 : 1;

      for (let level = 0; level < tierCount; level++) {
        const scale = level ? .64 : 1;

        const tier = el('g', {
          transform:
            `translate(300 ${level ? 179 : 267}) scale(${scale})`
        }, drawing);

        el('path', {
          d: sidePath,
          fill: colours[state.colour]
        }, tier);

        el('path', {
          d: sidePath,
          fill: 'url(#side)'
        }, tier);

        el('path', {
          d: path(points),
          fill: colours[state.colour]
        }, tier);

        el('path', {
          d: path(points),
          fill: 'url(#top)'
        }, tier);

        if (state.finish === 'Chocolate drip') {
          const lower = front.map(([x, y], i) => [
            x,
            y + 12 + 24 * Math.pow(
              Math.max(0, Math.sin(i * .72)), 4
            )
          ]);

          el('path', {
            d: path([...front, ...lower.reverse()]),
            fill: '#503025'
          }, tier);

          el('path', {
            d: path(points),
            fill: '#634032'
          }, tier);

          el('path', {
            d: path(points),
            fill: 'url(#top)'
          }, tier);
        }

        if (state.finish === 'Piping') {
          perimeter(points, 48).forEach(([x, y]) => {
            el('ellipse', {
              cx: x * .96,
              cy: y * .96,
              rx: 6.6,
              ry: 4.5,
              fill: '#fff3df',
              stroke: '#ccb9a2',
              'stroke-width': .5
            }, tier);
          });

          front
            .filter((_, i) => i % 3 === 0)
            .forEach(([x, y]) => {
              el('ellipse', {
                cx: x,
                cy: y + depth - 2,
                rx: 7,
                ry: 4.5,
                fill: '#fff0d7',
                stroke: '#ccb9a2',
                'stroke-width': .5
              }, tier);
            });
        }

        // Decorations and writing belong to the uppermost tier.
        if (level !== tierCount - 1) continue;

        const top = el('g', {}, tier);

        const spots = perimeter(points, 12).filter(
          (_, i) => [1, 3, 5, 7, 9, 11].includes(i)
        );

        if (state.topping === 'Cherries') {
          spots.forEach(([px, py]) => {
            const x = px * .78;
            const y = py * .78;

            el('path', {
              d: `M${x},${y - 8}q-2,-17 9,-23`,
              fill: 'none',
              stroke: '#56613b',
              'stroke-width': 2
            }, top);

            el('circle', {
              cx: x,
              cy: y - 5,
              r: 9,
              fill: '#923e45'
            }, top);

            el('circle', {
              cx: x - 3,
              cy: y - 8,
              r: 2.3,
              fill: '#e7a3a0'
            }, top);
          });
        }

        if (state.topping === 'Candles') {
          [-58, 0, 58].forEach(x => {
            const y = -28;

            el('rect', {
              x: x - 4,
              y: y - 43,
              width: 8,
              height: 43,
              rx: 2,
              fill: '#faf2da',
              stroke: '#b79c7e'
            }, top);

            el('path', {
              d: `M${x - 3},${y - 34}l6,5m-6,9l6,5m-6,9l6,5`,
              stroke: '#b07a79',
              'stroke-width': 2
            }, top);

            el('path', {
              d: `M${x},${y - 48}q-9,-7 0,-18q9,12 0,18`,
              fill: '#cf9450'
            }, top);
          });
        }

        if (state.topping === 'Sprinkles') {
          perimeter(points, 48).forEach(([px, py], i) => {
            const x = px * (i % 2 ? .74 : .87);
            const y = py * (i % 2 ? .74 : .87);

            el('rect', {
              x: x - 3,
              y: y - 1,
              width: 7,
              height: 2.8,
              rx: 1.4,
              fill: [
                '#a75c65', '#f9efda', '#85724b', '#ac8fba'
              ][i % 4],
              transform: `rotate(${i * 47} ${x} ${y})`
            }, top);
          });
        }

        const writing = el('text', {
          x: 0,
          y: state.shape === 'Heart' ? 12 : 9,
          'text-anchor': 'middle',
          fill:
            state.finish === 'Chocolate drip' ||
            state.colour === 'Cocoa'
              ? '#fff0d7'
              : '#694837',
          'font-family': 'Georgia, serif',
          'font-style': 'italic',
          'font-size': 19,
          transform: 'scale(1 .78)'
        }, top);

        // User-entered writing is always rendered as plain text.
        writing.textContent = state.message;

        if (writing.getComputedTextLength() > 195) {
          writing.setAttribute('textLength', '195');
          writing.setAttribute(
            'lengthAdjust', 'spacingAndGlyphs'
          );
        }
      }

      root.querySelectorAll('[data-key]').forEach(button => {
        button.setAttribute(
          'aria-pressed',
          String(
            state[button.dataset.key] === button.dataset.value
          )
        );
      });

      const mood =
        state.topping === 'None' ? 'simplicity' :
        state.topping === 'Cherries' ? 'cherry charm' :
        state.topping === 'Candles' ? 'celebration' :
        'confetti';

      $('#design-name').textContent =
        `${state.colour.toLowerCase()} & a little ${mood}.`;

      const summary = [
        `${state.tiers === 'Two' ? 'Two-tier' : 'Single-tier'}`,
        `${state.shape.toLowerCase()} cake,`,
        `${state.colour.toLowerCase()} icing,`,
        `${state.finish.toLowerCase()},`,
        `${state.topping.toLowerCase()}.`
      ].join(' ');

      $('#cake-description').textContent =
        summary + (
          state.message
            ? ` Message: ${state.message}`
            : ' No message.'
        );

      $('#count').textContent =
        `${state.message.length} / 28`;

      const brief = [
        "Hello Bakeology by Anjali! I'd like to enquire about this cake idea:",
        '',
        `Shape: ${state.shape}`,
        `Tiers: ${state.tiers}`,
        `Icing colour: ${state.colour}`,
        `Finish: ${state.finish}`,
        `Topping: ${state.topping}`,
        `Writing: ${state.message || 'None'}`,
        '',
        'Could we discuss flavour, size, date, availability and pricing?'
      ];

      // Uses the bakery number already present on your website.
      $('#enquire').href =
        'https://wa.me/918437993098?text=' +
        encodeURIComponent(brief.join('\n'));

      return summary;
    }

    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;

      if (button.dataset.key) {
        state[button.dataset.key] = button.dataset.value;
      } else if (button.id === 'reset') {
        state = { ...initial };
      } else if (button.id === 'surprise') {
        const pick = values =>
          values[Math.floor(Math.random() * values.length)];

        state = {
          ...state,
          shape: pick(['Round', 'Heart', 'Square']),
          tiers: pick(['One', 'Two']),
          colour: pick(Object.keys(colours)),
          finish: pick(['Smooth', 'Piping', 'Chocolate drip']),
          topping: pick([
            'None', 'Cherries', 'Candles', 'Sprinkles'
          ])
        };
      } else {
        return;
      }

      $('#cake-message').value = state.message;
      $('#announcement').textContent = render();

      if (
        !matchMedia('(prefers-reduced-motion: reduce)').matches &&
        $('#drawing').animate
      ) {
        $('#drawing').animate(
          [{ opacity: .65 }, { opacity: 1 }],
          { duration: 230, easing: 'ease-out' }
        );
      }
    });

    $('#cake-message').addEventListener('input', event => {
      state.message = event.target.value;
      render();
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded', mount, { once: true }
    );
  } else {
    mount();
  }
})();