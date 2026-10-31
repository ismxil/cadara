// Decorative vector-editing treatment, using outlines from our own wordmark font.
(() => {
  const host = document.querySelector(".home-wordmark");
  const lettering = host?.querySelector("span");
  const pointerQuery = matchMedia("(hover: hover) and (pointer: fine)");
  if (!host || !lettering || !pointerQuery.matches) return;
  const outlineUrl = new URL(
    "../asset/home/wordmark-outline.json",
    document.currentScript.src,
  );
  const geometryUrl = new URL(
    "./wordmark-geometry.js",
    document.currentScript.src,
  );
  const ns = "http://www.w3.org/2000/svg";
  const make = (tag, attrs = {}) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) =>
      el.setAttribute(key, value),
    );
    return el;
  };
  const pathData = (commands) =>
    commands
      .map((command) => {
        const { type, x, y, x1, y1, x2, y2 } = command;
        if (type === "Z") return "Z";
        return `${type}${type === "C" ? `${x1} ${y1} ${x2} ${y2} ` : type === "Q" ? `${x1} ${y1} ` : ""}${x} ${y}`;
      })
      .join(" ");

  async function setup() {
    const response = await fetch(outlineUrl);
    if (!response.ok) return;
    const original = await response.json();
    await document.fonts.ready;
    const { densifyPaths } = await import(geometryUrl);
    const originalPaths = densifyPaths(original.paths);
    let commands = structuredClone(originalPaths);
    let geometry, cursor, selected, frame;
    const svg = make("svg", { "aria-hidden": "true" });
    const controls = make("g", { "pointer-events": "none" });
    svg.appendChild(controls);
    const readout = document.createElement("div");
    readout.className = "wordmark-readout";
    readout.hidden = true;
    host.append(svg, readout);

    function render() {
      frame = null;
      // Replace the six glyphs together so SVG repaint bounds include the whole wordmark.
      const shapes = commands.map((glyph) =>
        make("path", {
          fill: "currentColor",
          d: pathData(glyph),
          transform: `translate(${geometry.x} ${geometry.y}) scale(${geometry.scale})`,
        }),
      );
      svg.replaceChildren(...shapes, controls);
      controls.replaceChildren();
      if (!cursor || !pointerQuery.matches) return;
      const screen = (x, y) => ({
        x: geometry.x + x * geometry.scale,
        y: geometry.y + y * geometry.scale,
      });
      const influence = (point) =>
        Math.min(
          1,
          Math.max(
            0,
            (165 - Math.hypot(point.x - cursor.x, point.y - cursor.y)) / 65,
          ),
        );
      for (const glyph of commands) {
        let previous;
        for (const command of glyph) {
          if (command.x === undefined) {
            previous = undefined;
            continue;
          }
          const anchor = screen(command.x, command.y);
          const handles = [];
          if (command.x1 !== undefined)
            handles.push([screen(command.x1, command.y1), previous || anchor]);
          if (command.x2 !== undefined)
            handles.push([screen(command.x2, command.y2), anchor]);
          const opacity = influence(anchor);
          if (command.type === "C" && previous) {
            const from = previous;
            const first = screen(command.x1, command.y1),
              second = screen(command.x2, command.y2);
            const curveOpacity = Math.max(opacity, influence(from));
            if (curveOpacity)
              controls.append(
                make("path", {
                  d: `M${from.x} ${from.y}C${first.x} ${first.y} ${second.x} ${second.y} ${anchor.x} ${anchor.y}`,
                  fill: "none",
                  stroke: "#2d9ede",
                  "stroke-width": 0.9,
                  opacity: curveOpacity * 0.65,
                  "data-wordmark-guide": "curve",
                }),
              );
          }
          for (const [point, from] of handles) {
            const handleOpacity = Math.max(influence(point), influence(from));
            if (!handleOpacity) continue;
            controls.append(
              make("line", {
                x1: point.x,
                y1: point.y,
                x2: from.x,
                y2: from.y,
                stroke: "#2d9ede",
                "stroke-width": 1.3,
                opacity: handleOpacity * 0.8,
              }),
            );
            controls.append(
              make("circle", {
                cx: point.x,
                cy: point.y,
                r: 4.5,
                fill: "#2d9ede",
                stroke: "#fff",
                "stroke-width": 1.3,
                opacity: handleOpacity,
                "data-wordmark-point": "handle",
              }),
            );
          }
          if (opacity)
            controls.append(
              make("rect", {
                x: anchor.x - 3.25,
                y: anchor.y - 3.25,
                width: 6.5,
                height: 6.5,
                fill: "#fff",
                stroke: "#161616",
                "stroke-width": 1.2,
                opacity,
                "data-wordmark-point": "anchor",
              }),
            );
          previous = anchor;
        }
      }
      controls.append(
        make("circle", {
          cx: cursor.x,
          cy: cursor.y,
          r: 6,
          fill: "none",
          stroke: "#00E935",
          "stroke-width": 1,
        }),
      );
      controls.append(
        make("path", {
          d: `M${cursor.x - 10} ${cursor.y}h20 M${cursor.x} ${cursor.y - 10}v20`,
          stroke: "#00E935",
          "stroke-width": 1,
        }),
      );
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    function resize() {
      const rect = host.getBoundingClientRect();
      const textRect = lettering.getBoundingClientRect();
      const style = getComputedStyle(lettering);
      const scale = parseFloat(style.fontSize) / 1000;
      geometry = {
        scale,
        x:
          textRect.left -
          rect.left +
          (textRect.width - original.advance * scale) / 2,
        y:
          lettering.querySelector(".wordmark-baseline").getBoundingClientRect()
            .top - rect.top,
      };
      svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
      schedule();
    }
    function move(event) {
      if (!pointerQuery.matches || event.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      cursor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (selected) {
        const command = commands[selected.glyph][selected.index];
        command[selected.xKey] = (cursor.x - geometry.x) / geometry.scale;
        command[selected.yKey] = (cursor.y - geometry.y) / geometry.scale;
      }
      readout.textContent = `X: ${String(Math.round(event.pageX)).padStart(4, "0")}\nY: ${String(Math.round(event.pageY)).padStart(4, "0")}`;
      readout.style.left = `${Math.max(0, Math.min(cursor.x + 12, rect.width - 76))}px`;
      readout.style.top = `${Math.max(0, Math.min(cursor.y + 12, rect.height - 38))}px`;
      readout.hidden = false;
      schedule();
    }
    function reset() {
      selected = null;
      cursor = null;
      commands = structuredClone(originalPaths);
      readout.hidden = true;
      schedule();
    }
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerdown", (event) => {
      if (
        event.button !== 0 ||
        !pointerQuery.matches ||
        event.pointerType === "touch"
      )
        return;
      move(event);
      let closest = 12;
      commands.forEach((glyph, glyphIndex) =>
        glyph.forEach((command, index) => {
          for (const [xKey, yKey] of [
            ["x", "y"],
            ["x1", "y1"],
            ["x2", "y2"],
          ]) {
            if (command[xKey] === undefined) continue;
            const distance = Math.hypot(
              geometry.x + command[xKey] * geometry.scale - cursor.x,
              geometry.y + command[yKey] * geometry.scale - cursor.y,
            );
            if (distance < closest) {
              closest = distance;
              selected = { glyph: glyphIndex, index, xKey, yKey };
            }
          }
        }),
      );
      if (selected) {
        event.preventDefault();
        host.setPointerCapture(event.pointerId);
      }
    });
    host.addEventListener("pointerup", (event) => {
      selected = null;
      if (host.hasPointerCapture(event.pointerId))
        host.releasePointerCapture(event.pointerId);
      const rect = host.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        reset();
    });
    host.addEventListener("pointerleave", () => {
      if (!selected) reset();
    });
    host.addEventListener("pointercancel", reset);
    pointerQuery.addEventListener("change", () => {
      host.classList.toggle("is-interactive", pointerQuery.matches);
      svg.toggleAttribute("hidden", !pointerQuery.matches);
      reset();
    });
    new ResizeObserver(resize).observe(host);
    resize();
    host.classList.add("is-interactive");
  }
  // The original text stays visible if outlines or browser APIs are unavailable.
  setup().catch(() => {
    host.classList.remove("is-interactive");
    host.querySelector("svg")?.remove();
    host.querySelector(".wordmark-readout")?.remove();
  });
})();
