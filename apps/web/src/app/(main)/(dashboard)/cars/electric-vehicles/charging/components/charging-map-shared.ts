/** Singapore, framed with a little sea on every side. */
export const ISLAND_CENTER: [number, number] = [103.82, 1.36];
export const ISLAND_ZOOM = 10.5;

/**
 * MapLibre paints cannot read CSS variables, so tokens are resolved once. The
 * theme's colours are oklch, which the browser reports as lab() and MapLibre
 * cannot parse, so each one is painted to a pixel and read back as rgb().
 */
export const readTokens = () => {
  const style = getComputedStyle(document.documentElement);
  const context = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  const read = (name: string, fallback: string) => {
    const colour = style.getPropertyValue(name).trim() || fallback;
    if (!context) {
      return fallback;
    }
    context.fillStyle = colour;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
    return `rgb(${red}, ${green}, ${blue})`;
  };
  return {
    available: read("--success", "#57b45f"),
    full: read("--warning", "#e9a63c"),
    offline: read("--muted", "#5f6b71"),
    cluster: read("--accent", "#0961bb"),
    clusterStrong: read("--chart-2", "#0a4c92"),
    clusterDeep: read("--chart-1", "#062f5c"),
    busy: read("--danger", "#e96e6e"),
  };
};

export type MapTokens = ReturnType<typeof readTokens>;
