import "./src/queries/test-utils";

// Next.js client modules (next/link, next/navigation) read process.env at
// import time; the browser project has no `process` global.
globalThis.process ??= {
  env: { NODE_ENV: "test" },
} as unknown as NodeJS.Process;
