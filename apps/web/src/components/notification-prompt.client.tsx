"use client";

import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import useStore from "@web/app/store";
import { useCallback, useEffect } from "react";

interface NotificationPromptClientProps {
  title: string;
  description: string;
  allowLabel: string;
  denyLabel: string;
  enabledToastTitle: string;
  enabledToastDescription: string;
  disabledToastTitle: string;
  disabledToastDescription: string;
}

export function NotificationPromptClient({
  title,
  description,
  allowLabel,
  denyLabel,
  enabledToastTitle,
  enabledToastDescription,
  disabledToastTitle,
  disabledToastDescription,
}: NotificationPromptClientProps) {
  const { notificationStatus, setNotificationStatus } = useStore();

  useEffect(() => {
    if (!("Notification" in window)) {
      return;
    }

    const status = Notification.permission;
    setNotificationStatus(status);
  }, [setNotificationStatus]);

  const handleGranted = useCallback(async () => {
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);

    if (permission === "granted") {
      addToast({
        title: enabledToastTitle,
        description: enabledToastDescription,
        color: "success",
        classNames: {
          base: "bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700",
          icon: "w-5 h-5 fill-current text-success-600",
        },
        shouldShowTimeoutProgress: true,
      });
    }
  }, [setNotificationStatus, enabledToastTitle, enabledToastDescription]);

  const handleDenied = useCallback(async () => {
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);

    if (permission === "denied") {
      addToast({
        title: disabledToastTitle,
        description: disabledToastDescription,
        color: "warning",
        classNames: {
          base: "bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700",
          icon: "w-5 h-5 fill-current text-warning-600",
        },
        shouldShowTimeoutProgress: true,
      });
    }
  }, [setNotificationStatus, disabledToastTitle, disabledToastDescription]);

  const handleClose = useCallback(() => {
    setNotificationStatus("denied");
  }, [setNotificationStatus]);

  if (notificationStatus === "default") {
    return (
      <Alert
        color="primary"
        variant="faded"
        title={title}
        description={description}
        isClosable
        onClose={handleClose}
        className={cn([
          "bg-default-50 shadow-sm dark:bg-background",
          "rounded-md rounded-l-none border border-l-8",
          "border-primary-200 border-l-primary dark:border-primary-100",
        ])}
        endContent={
          <div className="flex gap-2">
            <Button
              onPress={handleGranted}
              color="primary"
              size="sm"
              variant="solid"
            >
              {allowLabel}
            </Button>
            <Button
              onPress={handleDenied}
              color="default"
              size="sm"
              variant="bordered"
            >
              {denyLabel}
            </Button>
          </div>
        }
      />
    );
  }

  return null;
}
