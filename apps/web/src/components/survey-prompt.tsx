"use client";

import { usePathname } from "next/navigation";
import posthog, { DisplaySurveyType } from "posthog-js";
import { useEffect } from "react";

// PostHog survey "Visitor Intent", created as a draft for #1027.
export const VISITOR_INTENT_SURVEY_ID = "01a08b16-358f-0000-e30b-147c4ae4e28c";

export const SURVEY_SHOWN_AT_KEY = "motormetrics:survey-shown-at";
export const SURVEY_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;
const SURVEY_ROUTE_PATTERN = /^\/(coe|cars)(\/|$)/;

const SURVEY_PROMPT_DELAY_MS = 10_000;

// Shows at most one survey per browser every 90 days. PostHog holds the
// survey, its targeting and its responses; automatic popover display is
// switched off in instrumentation-client.ts so this component is the only
// display path.
//
// The 90-day gate is enforced four times over, so the survey vanishing after a
// refresh is expected rather than a bug:
//
//   1. The survey's completion condition is `schedule: once`.
//   2. Its display condition sets a 90-day wait period, which spans every
//      survey in the project, not just this one.
//   3. Its internal targeting flag requires `$survey_dismissed` and
//      `$survey_responded` to be unset and `$last_seen_survey_date` to be unset
//      or older than 90 days. PostHog writes that date when the survey is
//      *shown*, so simply seeing it is enough to gate the person out.
//   4. SURVEY_COOLDOWN_MS above, which saves the round trip when we already
//      know PostHog would refuse.
//
// Loosening SURVEY_COOLDOWN_MS therefore changes nothing on its own; the
// survey's conditions in PostHog have to change with it. Its URL condition is
// also anchored to the production host, so the survey never displays on
// localhost or a preview deployment.
export function SurveyPrompt() {
  const pathname = usePathname();

  useEffect(() => {
    if (!SURVEY_ROUTE_PATTERN.test(pathname) || isWithinCooldown()) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (cancelled || !posthog.__loaded) {
        return;
      }

      const { visible } = await posthog.canRenderSurveyAsync(
        VISITOR_INTENT_SURVEY_ID,
        false,
      );
      if (cancelled || !visible) {
        return;
      }

      posthog.displaySurvey(VISITOR_INTENT_SURVEY_ID, {
        displayType: DisplaySurveyType.Popover,
        ignoreConditions: false,
        ignoreDelay: false,
      });
      rememberShown();
    }, SURVEY_PROMPT_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}

function isWithinCooldown() {
  try {
    const shownAt = Number(window.localStorage?.getItem(SURVEY_SHOWN_AT_KEY));
    return shownAt > 0 && Date.now() - shownAt < SURVEY_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function rememberShown() {
  try {
    window.localStorage?.setItem(SURVEY_SHOWN_AT_KEY, String(Date.now()));
  } catch {
    // Storage unavailable; PostHog's own 90-day wait period still applies.
  }
}
