(() => {
  "use strict";

  function mountCakeScroll() {
    const host = document.getElementById("cake-scroll-story");

        if (!host) {
        console.error(
            'Cake assembly: add <section id="cake-scroll-story"></section> after the homepage hero.'
        );
        return;
        }

        if (host.shadowRoot) return;

    // Keep this section's styles separate from your existing website.
    const root = host.attachShadow({ mode: "open" });

    root.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          height: 440vh;
          height: 440svh;
          overflow: visible;
          background: #eee5d8;
          color: #35271f;
        }

        * { box-sizing: border-box; }

        .pin {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
          isolation: isolate;
          display: grid;
          grid-template-columns: .8fr 1.2fr;
          align-items: center;
          padding: 90px clamp(24px, 6vw, 100px);
          background:
            radial-gradient(
              ellipse at 69% 39%,
              #fffaf1 0%,
              #f0e7da 48%,
              #dfcfbc 100%
            );
        }

        .topline,
        .footer,
        .eyebrow {
          font-family: "DM Mono", monospace;
          font-size: 10px;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .topline {
          position: absolute;
          top: 32px;
          left: clamp(24px, 6vw, 100px);
          right: clamp(24px, 6vw, 100px);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: #776453;
          z-index: 3;
        }

        .backword {
          position: absolute;
          left: -4%;
          top: 32%;
          margin: 0;
          font-family: "Instrument Serif", Georgia, serif;
          font-size: clamp(170px, 29vw, 530px);
          font-weight: 400;
          line-height: .8;
          letter-spacing: -.06em;
          white-space: nowrap;
          color: #886548;
          opacity: .065;
          pointer-events: none;
          user-select: none;
          z-index: -1;
        }

        .copy {
          position: relative;
          z-index: 2;
          max-width: 430px;
        }

        .eyebrow {
          display: block;
          margin-bottom: 25px;
          color: #8a6249;
        }

        h2 {
          margin: 0;
          font-family: "Instrument Serif", Georgia, serif;
          font-size: clamp(49px, 6.5vw, 100px);
          font-weight: 400;
          line-height: .98;
          letter-spacing: -.045em;
        }

        h2 em {
          color: #956247;
          font-weight: 400;
        }

        .description {
          max-width: 295px;
          margin: 26px 0 0;
          font-family: "DM Sans", Arial, sans-serif;
          font-size: 14px;
          line-height: 1.8;
          color: #766455;
        }

        .skip {
          display: inline-block;
          margin-top: 28px;
          padding-block: 8px;
          color: #654b39;
          font-family: "DM Sans", Arial, sans-serif;
          font-size: 12px;
          text-underline-offset: 5px;
        }

        .skip:focus-visible {
          outline: 2px solid #654b39;
          outline-offset: 5px;
        }

        .art {
          position: relative;
          justify-self: center;
          width: min(57vw, 79svh, 850px);
          aspect-ratio: 1;
          transform-origin: 50% 82%;
        }

        .shadow {
          position: absolute;
          left: 29%;
          right: 29%;
          bottom: 3%;
          height: 5%;
          border-radius: 50%;
          background: #50331e;
          opacity: .18;
          filter: blur(17px);
        }

        .layers {
          position: absolute;
          inset: 0;
        }

        .layers img {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }

        /* Show the completed cake before animation initialization. */
        .layers img:not(:last-child) {
          visibility: hidden;
        }

        :host(.animated) .layers img {
          visibility: visible;
        }

        .footer {
          position: absolute;
          bottom: 29px;
          left: clamp(24px, 6vw, 100px);
          right: clamp(24px, 6vw, 100px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          color: #776453;
          z-index: 3;
        }

        .progress {
          width: min(190px, 28vw);
          height: 2px;
          background: #b6a18c55;
        }

        .progress span {
          display: block;
          width: 100%;
          height: 100%;
          background: #946448;
          transform: scaleX(0);
          transform-origin: left;
        }

        .sr {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip-path: inset(50%);
          white-space: nowrap;
        }

        :host(.static) {
          height: auto;
        }

        :host(.static) .pin {
          position: relative;
          height: auto;
          min-height: 100svh;
        }

        :host(.static) .progress {
          display: none;
        }

        @media (max-width: 760px) {
          :host {
            height: 380svh;
          }

          .pin {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            padding: 76px 24px 65px;
            gap: 8px;
          }

          .topline {
            top: 25px;
            left: 24px;
            right: 24px;
            font-size: 8px;
          }

          .copy {
            max-width: 100%;
          }

          .eyebrow {
            font-size: 9px;
            margin-bottom: 12px;
          }

          h2 {
            font-size: clamp(37px, 9vw, 60px);
          }

          h2 br {
            display: none;
          }

          .description {
            max-width: 330px;
            font-size: 12px;
            line-height: 1.6;
            margin-top: 13px;
          }

          .skip {
            margin-top: 9px;
            font-size: 11px;
          }

          .art {
            width: min(89vw, 51svh);
            align-self: center;
          }

          .backword {
            top: 48%;
            font-size: 48vw;
          }

          .footer {
            bottom: 25px;
            left: 24px;
            right: 24px;
            font-size: 8px;
            letter-spacing: .08em;
          }
        }

        @media (max-height: 600px) and (min-width: 761px) {
          .pin { padding-block: 65px; }
          h2 { font-size: 48px; }
          .eyebrow { margin-bottom: 14px; }
          .description { margin-top: 15px; }
          .skip { margin-top: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          :host { height: auto; }
          .pin {
            position: relative;
            height: auto;
            min-height: 100svh;
          }
        }
      </style>

      <div class="pin">
        <div class="topline">
          <span>Bakeology by Anjali</span>
          <span>The making of a moment</span>
        </div>

        <div class="backword" aria-hidden="true">made with care.</div>

        <div class="copy">
          <span class="eyebrow">A little patience. A little magic.</span>

          <h2>Good things.<br> <em>Layer by layer.</em></h2>

          <p class="description">
            Golden sponge. Soft buttercream. One final flourish.
            Scroll to see it come together.
          </p>

          <a class="skip" href="cakes.html">Explore the collection ↗</a>
        </div>

        <div class="art">
          <div class="shadow" aria-hidden="true"></div>

          <div class="layers" aria-hidden="true">
            <img src="assets/cake-stage-0.png" alt="" decoding="async">
            <img src="assets/cake-stage-1.png" alt="" decoding="async">
            <img src="assets/cake-stage-2.png" alt="" decoding="async">
            <img src="assets/cake-stage-3.png" alt="" decoding="async">
          </div>

          <p class="sr">
            A vanilla cake on an ivory stand, assembled from sponge
            and cream, covered in buttercream, then finished with
            chocolate drips and strawberries.
          </p>
        </div>

        <div class="footer">
          <span class="stage-label" aria-hidden="true">Scroll to begin ↓</span>
          <div class="progress" aria-hidden="true"><span></span></div>
          <span class="percentage" aria-hidden="true">00%</span>
        </div>
      </div>
    `;

    const pin = root.querySelector(".pin");
    const art = root.querySelector(".art");
    const copy = root.querySelector(".copy");
    const word = root.querySelector(".backword");
    const images = [...root.querySelectorAll(".layers img")];
    const label = root.querySelector(".stage-label");
    const meter = root.querySelector(".progress span");
    const percentage = root.querySelector(".percentage");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const mobile = window.matchMedia("(max-width: 760px)");

    const clamp = value => Math.min(1, Math.max(0, value));

    function segment(progress, start, end) {
      const t = clamp((progress - start) / (end - start));
      return t * t * (3 - 2 * t);
    }

    let ready = false;
    let frame = 0;

    function paint() {
      frame = 0;

      if (!ready || reducedMotion.matches) return;

      const rect = host.getBoundingClientRect();
      const distance = Math.max(1, host.offsetHeight - pin.offsetHeight);
      const progress = clamp(-rect.top / distance);

      const sponge = segment(progress, .08, .36);
      const frosting = segment(progress, .40, .66);
      const decoration = segment(progress, .70, .92);

      // Reveal the sponge upward from the stand.
      images[1].style.clipPath =
        `inset(${(1 - sponge) * 100}% 0 0 0)`;

      // Sweep the buttercream across the cake.
      images[2].style.clipPath =
        `inset(0 ${(1 - frosting) * 100}% 0 0)`;

      // Reveal the decorations from the top downward.
      images[3].style.clipPath =
        `inset(0 0 ${(1 - decoration) * 100}% 0)`;

      // Each finished stage replaces the earlier images completely.
      // This avoids leaving earlier silhouettes behind its edges.
      images[0].style.visibility =
        sponge >= 1 ? "hidden" : "visible";

      images[1].style.visibility =
        frosting >= 1 ? "hidden" : "visible";

      images[2].style.visibility =
        decoration >= 1 ? "hidden" : "visible";

      images[3].style.visibility = "visible";

      // Move the whole composition together so stages stay aligned.
      const scale = .89 + progress * .13;
      const lift = progress * (mobile.matches ? -10 : -28);

      art.style.transform =
        `translateY(${lift}px) scale(${scale})`;

      // Background travels farther than the foreground for depth.
      word.style.transform =
        `translate(${-progress * 160}px, ${90 - progress * 190}px)`;

      copy.style.transform =
        `translateY(${-progress * (mobile.matches ? 5 : 22)}px)`;

      meter.style.transform = `scaleX(${progress})`;

      percentage.textContent =
        `${String(Math.round(progress * 100)).padStart(2, "0")}%`;

      label.textContent =
        progress < .08 ? "01 / It starts with a little anticipation" :
        progress < .40 ? "02 / Golden sponge. Soft cream." :
        progress < .70 ? "03 / A coat of buttercream" :
        progress < .94 ? "04 / The finishing touches" :
        "Made for your moment.";
    }

    function requestPaint() {
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function syncMotionPreference() {
      const isStatic = !ready || reducedMotion.matches;

      host.classList.toggle("static", isStatic);
      host.classList.toggle("animated", !isStatic);

      if (isStatic) {
        images.forEach((image, index) => {
          image.style.clipPath = "";
          image.style.visibility = index === 3 ? "visible" : "hidden";
        });

        art.style.transform = "";
        copy.style.transform = "";
        word.style.transform = "";
        label.textContent = "Made for your moment.";
        percentage.textContent = "";
      } else {
        paint();
      }
    }

    // Ensure this link reaches the existing page outside the shadow root.

    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestPaint, { passive: true });
    window.addEventListener("pageshow", requestPaint);
    reducedMotion.addEventListener("change", syncMotionPreference);

    // Handle layout changes caused by other sections loading.
    const resizeObserver = new ResizeObserver(requestPaint);
    resizeObserver.observe(document.body);
    resizeObserver.observe(host);

    syncMotionPreference();

    // Start animation only when every image is available.
    Promise.allSettled(images.map(image => image.decode()))
  .then(results => {
    const failed = results
      .map((result, index) => (
        result.status === "rejected"
          ? images[index].getAttribute("src")
          : null
      ))
      .filter(Boolean);

    if (failed.length) {
      ready = false;
      syncMotionPreference();

      const available = results.findLastIndex(
        result => result.status === "fulfilled"
      );

      images.forEach((image, index) => {
        image.style.clipPath = "";
        image.style.visibility =
          index === available ? "visible" : "hidden";
      });

      label.textContent = "Cake images could not all be loaded.";

      console.error(
        "Cake assembly: missing or unreadable images:",
        failed
      );

      return;
    }

    ready = true;
    syncMotionPreference();
  });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountCakeScroll, {
      once: true
    });
  } else {
    mountCakeScroll();
  }
})();