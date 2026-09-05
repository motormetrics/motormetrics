export interface CarLogo {
  make: string;
  url: string;
  filename: string;
}

/**
 * `found`: fetched and stored. `missing`: the source had nothing, do not retry.
 * `manual`: uploaded by hand, never overwritten by the workflow.
 */
export type LogoStatus = "found" | "missing" | "manual";

export interface LogoEntry {
  make: string;
  status: LogoStatus;
  url: string | null;
  pathname: string | null;
  sourceUrl: string | null;
  checkedAt: string;
  lastError: string | null;
}

export interface LogoManifest {
  version: 1;
  updatedAt: string;
  logos: Record<string, LogoEntry>;
}
