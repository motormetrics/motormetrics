export const EV_BATCH_URL =
  "https://datamall2.mytransport.sg/ltaodataservice/EVCBatch";

/**
 * DataMall's file-link APIs return `{ value: [{ Link }] }`; the batch one
 * does too, but the placements the guide hints at are all accepted.
 */
export const extractDownloadLink = (payload: unknown): string | null => {
  const candidates: unknown[] = [];
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    candidates.push(record.Link, record.link);
    if (Array.isArray(record.value)) {
      for (const item of record.value) {
        if (typeof item === "object" && item !== null) {
          const entry = item as Record<string, unknown>;
          candidates.push(entry.Link, entry.link);
        }
      }
    }
  }
  const link = candidates.find(
    (value): value is string =>
      typeof value === "string" && value.startsWith("http"),
  );
  return link ?? null;
};

/**
 * The batch endpoint returns a presigned S3 link that expires after fifteen
 * minutes, so both requests happen back to back.
 */
export const fetchBatch = async (accountKey: string): Promise<unknown> => {
  const linkResponse = await fetch(EV_BATCH_URL, {
    headers: { AccountKey: accountKey, accept: "application/json" },
  });
  if (!linkResponse.ok) {
    throw new Error(
      `EVCBatch link request failed: ${linkResponse.status} ${linkResponse.statusText}`,
    );
  }

  const link = extractDownloadLink(await linkResponse.json());
  if (!link) {
    throw new Error("EVCBatch response carried no download link");
  }

  const fileResponse = await fetch(link);
  if (!fileResponse.ok) {
    throw new Error(
      `EVCBatch download failed: ${fileResponse.status} ${fileResponse.statusText}`,
    );
  }
  return fileResponse.json();
};
