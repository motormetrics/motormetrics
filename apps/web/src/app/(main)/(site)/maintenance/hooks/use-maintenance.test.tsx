import { useMaintenance } from "@web/app/(main)/(site)/maintenance/hooks/use-maintenance";
import type { MaintenanceConfig } from "@web/lib/maintenance";
import { useRouter, useSearchParams } from "next/navigation";
import type { MockInstance } from "vitest";
import { renderHook } from "vitest-browser-react";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe("useMaintenance", () => {
  const mockReplace = vi.fn();
  const mockGet = vi.fn();
  let intervalSpy: MockInstance<typeof globalThis.setInterval>;
  const createFetcher = (status: MaintenanceConfig) => {
    return async () => ({
      ...status,
    });
  };

  const waitForAsyncEffect = (delay = 0) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
    } as unknown as ReturnType<typeof useRouter>);

    vi.mocked(useSearchParams).mockReturnValue({
      get: mockGet,
    } as unknown as ReturnType<typeof useSearchParams>);

    intervalSpy = vi.spyOn(globalThis, "setInterval");
    vi.spyOn(globalThis, "clearInterval");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should redirect to home when not in maintenance mode and no 'from' param", async () => {
    mockGet.mockReturnValue(null);
    const fetchStatus = createFetcher({ enabled: false, message: "" });

    await renderHook(() =>
      useMaintenance({ pollingInterval: 1000, fetchStatus }),
    );

    // Wait for the async effect to complete
    await waitForAsyncEffect();

    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("should redirect to 'from' param URL when not in maintenance mode", async () => {
    mockGet.mockReturnValue("/dashboard");
    const fetchStatus = createFetcher({ enabled: false, message: "" });

    await renderHook(() =>
      useMaintenance({ pollingInterval: 1000, fetchStatus }),
    );

    await waitForAsyncEffect();

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("should decode URI component from 'from' param", async () => {
    mockGet.mockReturnValue("/dashboard%2Fsettings");
    const fetchStatus = createFetcher({ enabled: false, message: "" });

    await renderHook(() =>
      useMaintenance({ pollingInterval: 1000, fetchStatus }),
    );

    await waitForAsyncEffect();

    expect(mockReplace).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("should not redirect when in maintenance mode", async () => {
    const fetchStatus = createFetcher({ enabled: true, message: "Active" });

    await renderHook(() =>
      useMaintenance({ pollingInterval: 1000, fetchStatus }),
    );

    await waitForAsyncEffect();

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should set up polling interval with custom interval", async () => {
    const fetchStatus = createFetcher({ enabled: false, message: "" });

    await renderHook(() =>
      useMaintenance({ pollingInterval: 2000, fetchStatus }),
    );

    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
  });

  it("should use default polling interval when not specified", async () => {
    const fetchStatus = createFetcher({ enabled: false, message: "" });

    await renderHook(() => useMaintenance({ fetchStatus }));

    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
  });

  it("should clear interval on unmount", async () => {
    const fetchStatus = createFetcher({ enabled: false, message: "" });
    const { unmount } = await renderHook(() =>
      useMaintenance({ pollingInterval: 1000, fetchStatus }),
    );

    await unmount();

    expect(globalThis.clearInterval).toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockReturnValue(null);

    const fetchStatus = async () => {
      throw new Error("Test error");
    };

    await renderHook(() =>
      useMaintenance({ pollingInterval: 1000, fetchStatus }),
    );

    await waitForAsyncEffect(10);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error checking maintenance status:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
