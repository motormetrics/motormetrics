"use client";

import { Button, toast } from "@heroui/react";

import { useCallback, useEffect, useRef, useState } from "react";

const NOTIFICATION_PROMPT = {
  title: "Enable Notifications?",
  description:
    "Stay updated with the latest news and alerts by enabling browser notifications",
  allowLabel: "Allow",
  denyLabel: "Deny",
  enabledToastTitle: "Notifications Enabled!",
  enabledToastDescription:
    "You will now receive updates and alerts whenever new data is published",
  disabledToastTitle: "Notifications Disabled!",
  disabledToastDescription:
    "You will not receive updates and alerts whenever new data is published",
} as const;

export function NotificationPrompt() {
  const promptToastId = useRef<string | null>(null);
  const isClosingPromptProgrammatically = useRef(false);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);

  const handleGranted = useCallback(async () => {
    const nextPermission = await Notification.requestPermission();
    if (promptToastId.current) {
      isClosingPromptProgrammatically.current = true;
      toast.close(promptToastId.current);
      promptToastId.current = null;
    }

    if (nextPermission === "granted") {
      toast.success(NOTIFICATION_PROMPT.enabledToastTitle, {
        description: NOTIFICATION_PROMPT.enabledToastDescription,
      });
    }
  }, []);

  const handleDenied = useCallback(async () => {
    const nextPermission = await Notification.requestPermission();
    if (promptToastId.current) {
      isClosingPromptProgrammatically.current = true;
      toast.close(promptToastId.current);
      promptToastId.current = null;
    }

    if (nextPermission === "granted") {
      toast.success(NOTIFICATION_PROMPT.enabledToastTitle, {
        description: NOTIFICATION_PROMPT.enabledToastDescription,
      });
      return;
    }

    toast.warning(NOTIFICATION_PROMPT.disabledToastTitle, {
      description: NOTIFICATION_PROMPT.disabledToastDescription,
    });
  }, []);

  const handleClose = useCallback(() => {
    if (isClosingPromptProgrammatically.current) {
      isClosingPromptProgrammatically.current = false;
      return;
    }

    promptToastId.current = null;
    setIsPromptDismissed(true);
  }, []);

  useEffect(() => {
    if (
      !("Notification" in window) ||
      Notification.permission !== "default" ||
      isPromptDismissed ||
      promptToastId.current
    ) {
      return;
    }

    promptToastId.current = toast(NOTIFICATION_PROMPT.title, {
      description: (
        <div className="flex flex-col gap-4">
          <span>{NOTIFICATION_PROMPT.description}</span>
          <div className="flex gap-2">
            <Button onPress={handleGranted} size="sm" variant="primary">
              {NOTIFICATION_PROMPT.allowLabel}
            </Button>
            <Button onPress={handleDenied} size="sm" variant="secondary">
              {NOTIFICATION_PROMPT.denyLabel}
            </Button>
          </div>
        </div>
      ),
      onClose: handleClose,
      timeout: 0,
      variant: "accent",
    });
  }, [isPromptDismissed, handleGranted, handleDenied, handleClose]);

  return null;
}
