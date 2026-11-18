/** Singapore, framed with a little sea on every side. */
export const ISLAND_CENTER: [number, number] = [103.82, 1.36];
export const ISLAND_ZOOM = 10.5;

/** MapLibre paints cannot read CSS variables, so tokens are resolved once. */
export const readTokens = () => {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
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
