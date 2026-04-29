import { vi } from "vitest";

type ResultFactory<T> = T | (() => T | Promise<T>);

const resolveFactory = async <T>(factory: ResultFactory<T>): Promise<T> => {
  if (typeof factory === "function") {
    return (factory as () => T | Promise<T>)();
  }
  return factory;
};

interface QueryBuilder<T> {
  from: (...args: unknown[]) => QueryBuilder<T>;
  where: (...args: unknown[]) => QueryBuilder<T>;
  groupBy: (...args: unknown[]) => QueryBuilder<T>;
  orderBy: (...args: unknown[]) => QueryBuilder<T>;
  limit: (...args: unknown[]) => QueryBuilder<T>;
  innerJoin: (...args: unknown[]) => QueryBuilder<T>;
  leftJoin: (...args: unknown[]) => QueryBuilder<T>;
  having: (...args: unknown[]) => QueryBuilder<T>;
  then: (
    onFulfilled?: (value: T) => unknown,
    onRejected?: (reason: unknown) => void,
  ) => Promise<unknown>;
}

const createQueryBuilder = <T>(factory: ResultFactory<T>): QueryBuilder<T> => {
  const builder: QueryBuilder<T> = {
    from: () => builder,
    where: () => builder,
    groupBy: () => builder,
    orderBy: () => builder,
    limit: () => builder,
    innerJoin: () => builder,
    leftJoin: () => builder,
    having: () => builder,
    // biome-ignore lint/suspicious/noThenProperty: Required to make query builder thenable for async/await syntax
    then: (onFulfilled, onRejected) =>
      Promise.resolve(resolveFactory(factory)).then(onFulfilled, onRejected),
  };

  return builder;
};

const selectQueue: ResultFactory<unknown>[] = [];
const selectDistinctQueue: ResultFactory<unknown>[] = [];
const batchQueue: ResultFactory<unknown[]>[] = [];

const dequeue = (queue: ResultFactory<unknown>[]) => {
  const factory = queue.shift() ?? [];
  return createQueryBuilder(factory);
};

const mockDb = {
  select: vi.fn(() => dequeue(selectQueue)),
  selectDistinct: vi.fn(() => dequeue(selectDistinctQueue)),
  batch: vi.fn(
    async (
      queries: Array<{ then: (fn: (v: unknown) => void) => Promise<unknown> }>,
    ) => {
      // If batchQueue has a result, use it
      if (batchQueue.length > 0) {
        const factory = batchQueue.shift();
        return resolveFactory(factory ?? []);
      }
      // Otherwise resolve each query in the batch
      return Promise.all(queries.map((q) => q));
    },
  ),
  query: {
    cars: {
      findFirst: vi.fn(),
    },
  },
};

// Mock the Neon client to prevent database connection at import time
vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => vi.fn()),
}));

vi.mock("@motormetrics/database", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@motormetrics/database")>();
  return {
    ...mod,
    db: mockDb,
  };
});

export const cacheLifeMock = vi.fn();
export const cacheTagMock = vi.fn();

vi.mock("next/cache", () => ({
  cacheLife: cacheLifeMock,
  cacheTag: cacheTagMock,
}));

export const queueSelect = (...results: ResultFactory<unknown>[]) => {
  selectQueue.push(...results);
};

export const queueSelectDistinct = (...results: ResultFactory<unknown>[]) => {
  selectDistinctQueue.push(...results);
};

export const queueBatch = (...results: ResultFactory<unknown[]>[]) => {
  batchQueue.push(...results);
};

export const resetDbMocks = () => {
  selectQueue.length = 0;
  selectDistinctQueue.length = 0;
  batchQueue.length = 0;
  mockDb.select.mockClear();
  mockDb.selectDistinct.mockClear();
  mockDb.batch.mockClear();
  mockDb.query.cars.findFirst.mockReset();
  cacheLifeMock.mockClear();
  cacheTagMock.mockClear();
};

export const dbMock = mockDb;
