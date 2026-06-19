import { renderHook } from "@testing-library/react";
import type { MaintenanceStatus } from "@web/actions/maintenance";
import { useRouter, useSearchParams } from "next/navigation";
import { useMaintenance } from "./use-maintenance";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe("useMaintenance", () => {
  const mockReplace = vi.fn();
  const mockGet = vi.fn();
  // biome-ignore lint/suspicious/noExplicitAny: test spy requires loose typing
  let intervalSpy: any;
  const createFetcher = (status: MaintenanceStatus) => {
    return async () => ({
      ...status,
    });
  };

  const waitForAsyncEffect = (delay = 0) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  beforeEach(() => {
    vi.clearAllMocks();

    // biome-ignore lint/suspicious/noExplicitAny: test mock requires loose typing
    (useRouter as any).mockReturnValue({
      replace: mockReplace,
    });

    // biome-ignore lint/suspicious/noExplicitAny: test mock requires loose typing
    (useSearchParams as any).mockReturnValue({
      get: mockGet,
    });

    intervalSpy = vi.spyOn(global, "setInterval");
    vi.spyOn(global, "clearInterval");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should redirect to home when not in maintenance mode and no 'from' param", async () => {
    mockGet.mockReturnValue(null);
    const fetchStatus = createFetcher({ enabled: false, message: "" });

    renderHook(() => useMaintenance({ pollingInterval: 1000, fetchStatus }));

    // Wait for the async effect to complete
    await waitForAsyncEffect();

    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("should redirect to 'from' param URL when not in maintenance mode", async () => {
    mockGet.mockReturnValue("/dashboard");
    const fetchStatus = createFetcher({ enabled: false, message: "" });

    renderHook(() => useMaintenance({ pollingInterval: 1000, fetchStatus }));

    await waitForAsyncEffect();

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("should decode URI component from 'from' param", async () => {
    mockGet.mockReturnValue("/dashboard%2Fsettings");
    const fetchStatus = createFetcher({ enabled: false, message: "" });

    renderHook(() => useMaintenance({ pollingInterval: 1000, fetchStatus }));

    await waitForAsyncEffect();

    expect(mockReplace).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("should not redirect when in maintenance mode", async () => {
    const fetchStatus = createFetcher({ enabled: true, message: "Active" });

    renderHook(() => useMaintenance({ pollingInterval: 1000, fetchStatus }));

    await waitForAsyncEffect();

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should set up polling interval with custom interval", () => {
    const fetchStatus = createFetcher({ enabled: false, message: "" });

    renderHook(() => useMaintenance({ pollingInterval: 2000, fetchStatus }));

    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
  });

  it("should use default polling interval when not specified", () => {
    const fetchStatus = createFetcher({ enabled: false, message: "" });

    renderHook(() => useMaintenance({ fetchStatus }));

    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
  });

  it("should clear interval on unmount", () => {
    const fetchStatus = createFetcher({ enabled: false, message: "" });
    const { unmount } = renderHook(() =>
      useMaintenance({ pollingInterval: 1000, fetchStatus }),
    );

    unmount();

    expect(global.clearInterval).toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockReturnValue(null);

    const fetchStatus = async () => {
      throw new Error("Test error");
    };

    renderHook(() => useMaintenance({ pollingInterval: 1000, fetchStatus }));

    await waitForAsyncEffect(10);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error checking maintenance status:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
