"use client";

import { Button, toast } from "@heroui/react";

import { useCallback, useEffect, useRef, useState } from "react";

const NOTIFICATION_PROMPT_DISMISSED_KEY =
  "motormetrics:notification-prompt-dismissed";
const NOTIFICATION_PROMPT_DELAY_MS = 2_000;

const NOTIFICATION_PROMPT = {
  title: "Get data update alerts",
  description:
    "Enable browser notifications when new vehicle and COE data is published.",
  allowLabel: "Enable",
  dismissLabel: "Not now",
  enabledToastTitle: "Notifications enabled",
  enabledToastDescription:
    "You will receive an alert when new data is published.",
  disabledToastTitle: "Notifications remain off",
  disabledToastDescription:
    "You can enable browser notifications later from your browser settings.",
} as const;

export function NotificationPrompt() {
  const promptToastId = useRef<string | null>(null);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);

  const rememberDismissal = useCallback(() => {
    window.localStorage?.setItem(NOTIFICATION_PROMPT_DISMISSED_KEY, "true");
    promptToastId.current = null;
    setIsPromptDismissed(true);
  }, []);

  const closePrompt = useCallback(() => {
    if (promptToastId.current) {
      toast.close(promptToastId.current);
      promptToastId.current = null;
    }
    rememberDismissal();
  }, [rememberDismissal]);

  const handleEnable = useCallback(async () => {
    closePrompt();
    const nextPermission = await Notification.requestPermission();

    if (nextPermission === "granted") {
      toast.success(NOTIFICATION_PROMPT.enabledToastTitle, {
        description: NOTIFICATION_PROMPT.enabledToastDescription,
      });
      return;
    }
    toast.warning(NOTIFICATION_PROMPT.disabledToastTitle, {
      description: NOTIFICATION_PROMPT.disabledToastDescription,
    });
  }, [closePrompt]);

  const handleClose = useCallback(() => {
    rememberDismissal();
  }, [rememberDismissal]);

  useEffect(() => {
    if (
      !("Notification" in window) ||
      Notification.permission !== "default" ||
      window.localStorage?.getItem(NOTIFICATION_PROMPT_DISMISSED_KEY) ===
        "true" ||
      isPromptDismissed ||
      promptToastId.current
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      promptToastId.current = toast(NOTIFICATION_PROMPT.title, {
        description: (
          <div className="flex flex-col gap-3">
            <span>{NOTIFICATION_PROMPT.description}</span>
            <div className="flex gap-2">
              <Button onPress={handleEnable} size="sm" variant="primary">
                {NOTIFICATION_PROMPT.allowLabel}
              </Button>
              <Button onPress={closePrompt} size="sm" variant="tertiary">
                {NOTIFICATION_PROMPT.dismissLabel}
              </Button>
            </div>
          </div>
        ),
        onClose: handleClose,
        timeout: 8_000,
        variant: "default",
      });
    }, NOTIFICATION_PROMPT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [closePrompt, handleClose, handleEnable, isPromptDismissed]);

  return null;
}
