import { toast } from "@heroui/react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationPrompt } from "./notification-prompt";

vi.mock("@heroui/react", () => {
  const toastMock = Object.assign(
    vi.fn(() => "notification-toast-id"),
    {
      close: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
    },
  );

  return {
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
  let originalNotification: typeof global.Notification;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    storage.clear();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: localStorageMock,
    });
    originalNotification = global.Notification;
    global.Notification = {
      requestPermission: vi.fn().mockResolvedValue("default"),
      permission: "default",
    } as unknown as typeof global.Notification;
  });

  afterEach(() => {
    global.Notification = originalNotification;
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
    global.Notification = {
      requestPermission: vi.fn(),
      permission,
    } as unknown as typeof global.Notification;

    await renderDelayedPrompt();
    expect(toast).not.toHaveBeenCalled();
  });

  it("does not prompt after a previous dismissal", async () => {
    storage.set("motormetrics:notification-prompt-dismissed", "true");
    await renderDelayedPrompt();
    expect(toast).not.toHaveBeenCalled();
  });

  it("requests permission only when Enable is pressed", async () => {
    vi.mocked(global.Notification.requestPermission).mockResolvedValue(
      "granted",
    );
    await renderDelayedPrompt();
    render(getFirstToastOptions().description as React.ReactElement);

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("button")[0]);
    });

    expect(global.Notification.requestPermission).toHaveBeenCalledOnce();
    expect(toast.close).toHaveBeenCalledWith("notification-toast-id");
    expect(toast.success).toHaveBeenCalledWith("Notifications enabled", {
      description: "You will receive an alert when new data is published.",
    });
  });

  it("dismisses without requesting permission", async () => {
    await renderDelayedPrompt();
    render(getFirstToastOptions().description as React.ReactElement);

    fireEvent.click(screen.getAllByTestId("button")[1]);

    expect(global.Notification.requestPermission).not.toHaveBeenCalled();
    expect(toast.close).toHaveBeenCalledWith("notification-toast-id");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "motormetrics:notification-prompt-dismissed",
      "true",
    );
  });

  it("shows guidance when the browser declines permission", async () => {
    vi.mocked(global.Notification.requestPermission).mockResolvedValue(
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
    delete (global as Partial<typeof globalThis>).Notification;
    await renderDelayedPrompt();
    expect(toast).not.toHaveBeenCalled();
  });
});
