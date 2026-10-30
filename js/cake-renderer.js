import { colours } from "./config.js";
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
export function renderCake(svg, state) {
  const $ = selector => svg.querySelector(selector);

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
          fill: 'url(#cake-side)'
        }, tier);

        el('path', {
          d: path(points),
          fill: colours[state.colour]
        }, tier);

        el('path', {
          d: path(points),
          fill: 'url(#cake-top)'
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
            fill: 'url(#cake-top)'
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
}
