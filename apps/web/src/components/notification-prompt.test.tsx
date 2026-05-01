import { toast } from "@heroui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
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

function getFirstToastOptions() {
  const call = vi.mocked(toast).mock.calls[0];

  if (!call?.[1]) {
    throw new Error("Expected toast to be called with options");
  }

  return call[1];
}

describe("NotificationPrompt Component", () => {
  let originalNotification: typeof global.Notification;

  beforeAll(() => {
    originalNotification = global.Notification;
  });

  afterAll(() => {
    global.Notification = originalNotification;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    global.Notification = {
      requestPermission: vi.fn().mockResolvedValue("default"),
      permission: "default",
    } as unknown as typeof global.Notification;
  });

  it("should render nothing directly because the prompt is shown as a toast", () => {
    const { container } = render(<NotificationPrompt />);

    expect(container.firstChild).toBeNull();
  });

  it("should show a persistent toast when notification permission is default", async () => {
    render(<NotificationPrompt />);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        "Enable Notifications?",
        expect.objectContaining({ timeout: 0, variant: "accent" }),
      );
    });

    const options = getFirstToastOptions();
    render(options.description as React.ReactElement);

    expect(
      screen.getByText(
        "Stay updated with the latest news and alerts by enabling browser notifications",
      ),
    ).toBeInTheDocument();
    const buttons = screen.getAllByTestId("button");
    expect(buttons[0]).toHaveTextContent("Allow");
    expect(buttons[1]).toHaveTextContent("Deny");
  });

  it("should not show a toast when notification permission is granted", async () => {
    global.Notification = {
      requestPermission: vi.fn().mockResolvedValue("default"),
      permission: "granted",
    } as unknown as typeof global.Notification;

    const { container } = render(<NotificationPrompt />);

    expect(container.firstChild).toBeNull();
    await waitFor(() => expect(toast).not.toHaveBeenCalled());
  });

  it("should not show a toast when notification permission is denied", async () => {
    global.Notification = {
      requestPermission: vi.fn().mockResolvedValue("default"),
      permission: "denied",
    } as unknown as typeof global.Notification;

    render(<NotificationPrompt />);

    await waitFor(() => expect(toast).not.toHaveBeenCalled());
  });

  it("should request permission when Allow button is clicked", async () => {
    vi.mocked(global.Notification.requestPermission).mockResolvedValue(
      "granted",
    );

    render(<NotificationPrompt />);

    await waitFor(() => expect(toast).toHaveBeenCalled());
    const options = getFirstToastOptions();
    render(options.description as React.ReactElement);

    const buttons = screen.getAllByTestId("button");
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(global.Notification.requestPermission).toHaveBeenCalled();
      expect(toast.close).toHaveBeenCalledWith("notification-toast-id");
      expect(toast.success).toHaveBeenCalledWith("Notifications Enabled!", {
        description:
          "You will now receive updates and alerts whenever new data is published",
      });
    });
  });

  it("should request permission when Deny button is clicked", async () => {
    vi.mocked(global.Notification.requestPermission).mockResolvedValue(
      "denied",
    );

    render(<NotificationPrompt />);

    await waitFor(() => expect(toast).toHaveBeenCalled());
    const options = getFirstToastOptions();
    render(options.description as React.ReactElement);

    const buttons = screen.getAllByTestId("button");
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(global.Notification.requestPermission).toHaveBeenCalled();
      expect(toast.close).toHaveBeenCalledWith("notification-toast-id");
      expect(toast.warning).toHaveBeenCalledWith("Notifications Disabled!", {
        description:
          "You will not receive updates and alerts whenever new data is published",
      });
    });
  });

  it("should not reopen the prompt when toast is closed", async () => {
    render(<NotificationPrompt />);

    await waitFor(() => expect(toast).toHaveBeenCalled());
    const options = getFirstToastOptions();
    options.onClose?.();

    await waitFor(() => expect(toast).toHaveBeenCalledTimes(1));
  });

  it("should not show a toast when Notification API is unavailable", () => {
    const original = global.Notification;
    delete (global as Partial<typeof globalThis>).Notification;

    render(<NotificationPrompt />);
    expect(toast).not.toHaveBeenCalled();

    global.Notification = original;
  });
});
