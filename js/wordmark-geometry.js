// De Casteljau subdivision adds editable points without changing the letter contours.
const mix = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function splitCubic([a, b, c, d], t = 0.5) {
  const ab = mix(a, b, t),
    bc = mix(b, c, t),
    cd = mix(c, d, t);
  const abc = mix(ab, bc, t),
    bcd = mix(bc, cd, t);
  const middle = mix(abc, bcd, t);
  return [
    [a, ab, abc, middle],
    [middle, bcd, cd, d],
  ];
}
export function densifyPaths(paths, maxLength = 80) {
  return paths.map((path) => {
    const result = [];
    let previous, start;
    for (const command of path) {
      if (command.type === "M") {
        previous = start = { x: command.x, y: command.y };
        result.push({ ...command });
        continue;
      }
      if (command.type === "Z") {
        result.push({ ...command });
        previous = start;
        continue;
      }
      const end = { x: command.x, y: command.y };
      let first, second;
      if (command.type === "C") {
        first = { x: command.x1, y: command.y1 };
        second = { x: command.x2, y: command.y2 };
      } else if (command.type === "Q") {
        const control = { x: command.x1, y: command.y1 };
        first = mix(previous, control, 2 / 3);
        second = mix(end, control, 2 / 3);
      } else {
        first = mix(previous, end, 1 / 3);
        second = mix(previous, end, 2 / 3);
      }
      let curve = [previous, first, second, end];
      const count = Math.max(
        1,
        Math.ceil(
          (distance(previous, first) +
            distance(first, second) +
            distance(second, end)) /
            maxLength,
        ),
      );
      for (let remaining = count; remaining > 0; remaining--) {
        const [segment, rest] =
          remaining === 1 ? [curve, null] : splitCubic(curve, 1 / remaining);
        result.push({
          type: "C",
          x1: segment[1].x,
          y1: segment[1].y,
          x2: segment[2].x,
          y2: segment[2].y,
          x: segment[3].x,
          y: segment[3].y,
        });
        curve = rest;
      }
      previous = end;
    }
    return result;
  });
}
