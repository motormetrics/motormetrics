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
    offline: read("--subtle", "#5f6b71"),
    cluster: read("--accent", "#4e7c9b"),
    clusterStrong: read("--accent-strong", "#33586f"),
    clusterDeep: read("--accent-deep", "#16323f"),
    busy: read("--danger", "#e96e6e"),
  };
};

export type MapTokens = ReturnType<typeof readTokens>;
