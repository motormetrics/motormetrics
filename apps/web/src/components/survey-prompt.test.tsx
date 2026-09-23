import {
  SURVEY_COOLDOWN_MS,
  SURVEY_SHOWN_AT_KEY,
  SurveyPrompt,
  VISITOR_INTENT_SURVEY_ID,
} from "@web/components/survey-prompt";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

const state = vi.hoisted(() => ({
  pathname: "/coe/pqp",
  visible: true,
  loaded: true,
}));

const canRenderSurveyAsync = vi.hoisted(() =>
  vi.fn(async () => ({ visible: state.visible })),
);
const displaySurvey = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
}));

vi.mock("posthog-js", () => ({
  default: {
    get __loaded() {
      return state.loaded;
    },
    canRenderSurveyAsync,
    displaySurvey,
  },
  DisplaySurveyType: { Popover: "popover" },
}));

const storage = new Map<string, string>();

async function renderAndWait() {
  const screen = await render(<SurveyPrompt />);
  await vi.runAllTimersAsync();
  return screen;
}

describe("SurveyPrompt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    storage.clear();
    state.pathname = "/coe/pqp";
    state.visible = true;
    state.loaded = true;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should display the survey on a COE page and remember it", async () => {
    await renderAndWait();

    expect(canRenderSurveyAsync).toHaveBeenCalledWith(
      VISITOR_INTENT_SURVEY_ID,
      false,
    );
    expect(displaySurvey).toHaveBeenCalledWith(VISITOR_INTENT_SURVEY_ID, {
      displayType: "popover",
      ignoreConditions: false,
      ignoreDelay: false,
    });
    expect(Number(storage.get(SURVEY_SHOWN_AT_KEY))).toBeGreaterThan(0);
  });

  it("should not display outside the COE and cars routes", async () => {
    state.pathname = "/blog/some-post";

    await renderAndWait();

    expect(canRenderSurveyAsync).not.toHaveBeenCalled();
    expect(displaySurvey).not.toHaveBeenCalled();
  });

  it("should not display again within the cooldown", async () => {
    storage.set(SURVEY_SHOWN_AT_KEY, String(Date.now() - 1_000));

    await renderAndWait();

    expect(displaySurvey).not.toHaveBeenCalled();
  });

  it("should display again once the cooldown has passed", async () => {
    storage.set(
      SURVEY_SHOWN_AT_KEY,
      String(Date.now() - SURVEY_COOLDOWN_MS - 1_000),
    );

    await renderAndWait();

    expect(displaySurvey).toHaveBeenCalledTimes(1);
  });

  it("should not display when PostHog says the survey is ineligible", async () => {
    state.visible = false;

    await renderAndWait();

    expect(displaySurvey).not.toHaveBeenCalled();
    expect(storage.has(SURVEY_SHOWN_AT_KEY)).toBe(false);
  });

  it("should do nothing when PostHog has not loaded", async () => {
    state.loaded = false;

    await renderAndWait();

    expect(canRenderSurveyAsync).not.toHaveBeenCalled();
  });

  it("should cancel a pending display on unmount", async () => {
    const screen = await render(<SurveyPrompt />);
    await screen.unmount();
    await vi.runAllTimersAsync();

    expect(displaySurvey).not.toHaveBeenCalled();
  });
});
