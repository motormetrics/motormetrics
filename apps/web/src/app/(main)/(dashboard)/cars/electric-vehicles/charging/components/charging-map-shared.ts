/** Singapore, framed with a little sea on every side. */
export const ISLAND_CENTER: [number, number] = [103.82, 1.36];
export const ISLAND_ZOOM = 10.5;

/**
 * The theme declares its colours in `lab()`/`oklch()`, which MapLibre cannot
 * parse, so each one is painted onto a 1×1 canvas and read back as rgb.
 */
const toRgb = (colour: string, fallback: string): string => {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) {
    return fallback;
  }
  context.fillStyle = fallback;
  context.fillStyle = colour;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${red}, ${green}, ${blue})`;
};

/** MapLibre paints cannot read CSS variables, so tokens are resolved once. */
export const readTokens = () => {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    toRgb(style.getPropertyValue(name).trim() || fallback, fallback);
  return {
    available: read("--success", "#57b45f"),
    full: read("--warning", "#e9a63c"),
    offline: read("--muted", "#5f6b71"),
    cluster: read("--accent", "#4e7c9b"),
    clusterStrong: read("--chart-2", "#33586f"),
    clusterDeep: read("--chart-1", "#16323f"),
  };
};

export type MapTokens = ReturnType<typeof readTokens>;
