import { toast } from "@heroui/react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationPrompt } from "./notification-prompt";

const capture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({ default: { capture } }));

vi.mock("@heroui/react", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const toastMock = Object.assign(
    vi.fn(() => "notification-toast-id"),
    {
      close: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
    },
  );

  return {
    ...actual,
    Button: ({
      onPress,
      children,
    }: {
      onPress?: () => void;
      children?: React.ReactNode;
    }) => (
      <button type="button" onClick={onPress} data-testid="button">
        {children}
      </button>
    ),
    toast: toastMock,
  };
});

const storage = new Map<string, string>();
const localStorageMock = {
  clear: vi.fn(() => storage.clear()),
  getItem: vi.fn((key: string) => storage.get(key) ?? null),
  key: vi.fn(() => null),
  length: 0,
  removeItem: vi.fn((key: string) => storage.delete(key)),
  setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
};

function getFirstToastOptions() {
  const call = vi.mocked(toast).mock.calls[0];

  if (!call?.[1]) {
    throw new Error("Expected toast to be called with options");
  }

  return call[1];
}

async function renderDelayedPrompt() {
  const result = render(<NotificationPrompt />);
  await act(async () => {
    vi.advanceTimersByTime(2_000);
  });
  return result;
}

describe("NotificationPrompt Component", () => {
  let originalNotification: typeof globalThis.Notification;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    storage.clear();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: localStorageMock,
    });
    originalNotification = globalThis.Notification;
    globalThis.Notification = {
      requestPermission: vi.fn().mockResolvedValue("default"),
      permission: "default",
    } as unknown as typeof globalThis.Notification;
  });

  afterEach(() => {
    globalThis.Notification = originalNotification;
    vi.useRealTimers();
  });

  it("renders nothing directly", () => {
    const { container } = render(<NotificationPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("shows a delayed, temporary prompt when permission is undecided", async () => {
    await renderDelayedPrompt();

    expect(toast).toHaveBeenCalledWith(
      "Get data update alerts",
      expect.objectContaining({ timeout: 8_000, variant: "default" }),
    );

    const options = getFirstToastOptions();
    render(options.description as React.ReactElement);

    expect(
      screen.getByText(
        "Enable browser notifications when new vehicle and COE data is published.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Enable")).toBeInTheDocument();
    expect(screen.getByText("Not now")).toBeInTheDocument();
  });

  it.each([
    "granted",
    "denied",
  ] as const)("does not prompt when permission is %s", async (permission) => {
    globalThis.Notification = {
      requestPermission: vi.fn(),
      permission,
    } as unknown as typeof globalThis.Notification;

    await renderDelayedPrompt();
    expect(toast).not.toHaveBeenCalled();
  });

  it("does not prompt after a previous dismissal", async () => {
    storage.set("motormetrics:notification-prompt-dismissed", "true");
    await renderDelayedPrompt();
    expect(toast).not.toHaveBeenCalled();
  });

  it("requests permission only when Enable is pressed", async () => {
    vi.mocked(globalThis.Notification.requestPermission).mockResolvedValue(
      "granted",
    );
    await renderDelayedPrompt();
    render(getFirstToastOptions().description as React.ReactElement);

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("button")[0]);
    });

    expect(globalThis.Notification.requestPermission).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith("notification_prompt_answered", {
      answer: "enabled",
    });
    expect(toast.close).toHaveBeenCalledWith("notification-toast-id");
    expect(toast.success).toHaveBeenCalledWith("Notifications enabled", {
      description: "You will receive an alert when new data is published.",
    });
  });

  it("dismisses without requesting permission", async () => {
    await renderDelayedPrompt();
    render(getFirstToastOptions().description as React.ReactElement);

    fireEvent.click(screen.getAllByTestId("button")[1]);

    expect(globalThis.Notification.requestPermission).not.toHaveBeenCalled();
    expect(capture).toHaveBeenCalledWith("notification_prompt_answered", {
      answer: "dismissed",
    });
    expect(toast.close).toHaveBeenCalledWith("notification-toast-id");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "motormetrics:notification-prompt-dismissed",
      "true",
    );
  });

  it("shows guidance when the browser declines permission", async () => {
    vi.mocked(globalThis.Notification.requestPermission).mockResolvedValue(
      "denied",
    );
    await renderDelayedPrompt();
    render(getFirstToastOptions().description as React.ReactElement);

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("button")[0]);
    });

    expect(toast.warning).toHaveBeenCalledWith("Notifications remain off", {
      description:
        "You can enable browser notifications later from your browser settings.",
    });
  });

  it("remembers when the toast closes", async () => {
    await renderDelayedPrompt();
    getFirstToastOptions().onClose?.();

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "motormetrics:notification-prompt-dismissed",
      "true",
    );
  });

  it("does not prompt when the Notification API is unavailable", async () => {
    delete (globalThis as Partial<typeof globalThis>).Notification;
    await renderDelayedPrompt();
    expect(toast).not.toHaveBeenCalled();
  });
});
