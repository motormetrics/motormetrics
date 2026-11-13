/** Singapore, framed with a little sea on every side. */
export const ISLAND_CENTER: [number, number] = [103.82, 1.36];
export const ISLAND_ZOOM = 10.5;

/**
 * MapLibre paints cannot read CSS variables, so tokens are resolved once.
 * Theme tokens can resolve to `lab()` or `oklch()`, which MapLibre's colour
 * parser rejects, so each value is drawn to a 1px canvas and read back as rgb.
 */
export const readTokens = () => {
  const style = getComputedStyle(document.documentElement);
  const context = document.createElement("canvas").getContext("2d");
  const toRgb = (value: string, fallback: string) => {
    if (!context) {
      return fallback;
    }
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = fallback;
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    return `rgba(${red}, ${green}, ${blue}, ${(alpha / 255).toFixed(3)})`;
  };
  const read = (name: string, fallback: string) =>
    toRgb(style.getPropertyValue(name).trim() || fallback, fallback);
  return {
    available: read("--success", "#00ca67"),
    full: read("--warning", "#f4a61e"),
    offline: read("--muted", "#707276"),
    // Clusters grow darker with size, along the theme's chart ramp.
    cluster: read("--chart-1", "#6e95b0"),
    clusterStrong: read("--chart-2", "#57768c"),
    clusterDeep: read("--chart-4", "#2c3d49"),
    busy: read("--danger", "#ff3836"),
  };
};

export type MapTokens = ReturnType<typeof readTokens>;
