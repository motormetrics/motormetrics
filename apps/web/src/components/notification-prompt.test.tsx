import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { NotificationPrompt } from "./notification-prompt";

const mockSetNotificationStatus = vi.fn();
let mockNotificationStatus: "default" | "granted" | "denied" = "default";

vi.mock("@heroui/react", () => {
  const Alert = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="alert">{children}</div>
  );
  Alert.Indicator = () => null;
  Alert.Content = ({ children }: { children?: React.ReactNode }) => children;
  Alert.Title = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="alert-title">{children}</div>
  );
  Alert.Description = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  );

  return {
    Alert,
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
    CloseButton: ({ onPress }: { onPress?: () => void }) => (
      <button type="button" data-testid="alert-close" onClick={onPress}>
        close
      </button>
    ),
    cn: (...classes: unknown[]) => classes.flat().filter(Boolean).join(" "),
    toast: { success: vi.fn(), warning: vi.fn() },
  };
});

vi.mock("@web/app/store", () => ({
  default: () => ({
    notificationStatus: mockNotificationStatus,
    setNotificationStatus: mockSetNotificationStatus,
  }),
}));

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
    mockNotificationStatus = "default";
    global.Notification = {
      requestPermission: vi.fn().mockResolvedValue("default"),
      permission: "default",
    } as unknown as typeof global.Notification;
  });

  it("should set notification status to current permission on mount", () => {
    render(<NotificationPrompt />);

    expect(document.body.firstChild).toMatchSnapshot();
    expect(mockSetNotificationStatus).toHaveBeenCalledWith("default");
  });

  it("should display an alert when notificationStatus is 'default'", () => {
    render(<NotificationPrompt />);

    expect(screen.getByTestId("alert-title")).toHaveTextContent(
      "Enable Notifications?",
    );
    expect(screen.getByTestId("alert-description")).toHaveTextContent(
      "Stay updated with the latest news and alerts by enabling browser notifications",
    );
    const buttons = screen.getAllByTestId("button");
    expect(buttons[0]).toHaveTextContent("Allow");
    expect(buttons[1]).toHaveTextContent("Deny");
  });

  it("should not display anything if notificationStatus is not 'default' (e.g., granted/denied)", () => {
    mockNotificationStatus = "granted";

    const { container } = render(<NotificationPrompt />);

    expect(container.firstChild).toBeNull();
  });

  it("should call handleGranted when Allow button is clicked", async () => {
    mockNotificationStatus = "default";
    vi.mocked(global.Notification.requestPermission).mockResolvedValue(
      "granted",
    );

    render(<NotificationPrompt />);

    const buttons = screen.getAllByTestId("button");
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(global.Notification.requestPermission).toHaveBeenCalled();
      expect(mockSetNotificationStatus).toHaveBeenCalledWith("granted");
    });
  });

  it("should call handleDenied when Deny button is clicked", async () => {
    mockNotificationStatus = "default";
    vi.mocked(global.Notification.requestPermission).mockResolvedValue(
      "denied",
    );

    render(<NotificationPrompt />);

    const buttons = screen.getAllByTestId("button");
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(global.Notification.requestPermission).toHaveBeenCalled();
      expect(mockSetNotificationStatus).toHaveBeenCalledWith("denied");
    });
  });

  it("should set notification status to denied when alert is closed", () => {
    render(<NotificationPrompt />);

    fireEvent.click(screen.getByTestId("alert-close"));
    expect(mockSetNotificationStatus).toHaveBeenCalledWith("denied");
  });

  it("should not sync permission when Notification API is unavailable", () => {
    const original = global.Notification;
    delete (global as Partial<typeof globalThis>).Notification;

    render(<NotificationPrompt />);
    expect(mockSetNotificationStatus).not.toHaveBeenCalled();

    global.Notification = original;
  });
});
