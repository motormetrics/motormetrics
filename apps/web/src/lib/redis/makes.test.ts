import { vi } from "vitest";

const { delMock, pipelineExecMock, pipelineZaddMock, getDistinctMakesMock } =
  vi.hoisted(() => {
    const pipelineZaddMock = vi.fn();
    const pipelineExecMock = vi.fn().mockResolvedValue([]);
    return {
      delMock: vi.fn(),
      pipelineExecMock,
      pipelineZaddMock,
      getDistinctMakesMock: vi.fn(),
    };
  });

vi.mock("@motormetrics/utils", () => ({
  redis: {
    del: delMock,
    pipeline: () => ({
      zadd: pipelineZaddMock,
      exec: pipelineExecMock,
    }),
  },
}));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => vi.fn()),
}));

vi.mock("@motormetrics/database", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@motormetrics/database")>();
  return {
    ...mod,
    db: {
      selectDistinct: vi.fn(() => ({
        from: vi.fn(() => ({
          orderBy: vi.fn(() => getDistinctMakesMock()),
        })),
      })),
    },
  };
});

import { populateMakesSortedSet } from "./makes";

describe("populateMakesSortedSet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 0 when no makes exist", async () => {
    getDistinctMakesMock.mockResolvedValue([]);

    const result = await populateMakesSortedSet();

    expect(result).toBe(0);
    expect(delMock).not.toHaveBeenCalled();
  });

  it("should populate sorted set with all makes", async () => {
    getDistinctMakesMock.mockResolvedValue([
      { make: "AUDI" },
      { make: "BMW" },
      { make: "TOYOTA" },
    ]);

    const result = await populateMakesSortedSet();

    expect(result).toBe(3);
    expect(delMock).toHaveBeenCalledWith("makes:alpha");
    expect(pipelineZaddMock).toHaveBeenCalledTimes(3);
    expect(pipelineZaddMock).toHaveBeenCalledWith("makes:alpha", {
      score: 0,
      member: "AUDI",
    });
    expect(pipelineZaddMock).toHaveBeenCalledWith("makes:alpha", {
      score: 0,
      member: "BMW",
    });
    expect(pipelineZaddMock).toHaveBeenCalledWith("makes:alpha", {
      score: 0,
      member: "TOYOTA",
    });
    expect(pipelineExecMock).toHaveBeenCalledOnce();
  });
});
