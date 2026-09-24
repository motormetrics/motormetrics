import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";

/**
 * Calculates the SHA-256 checksum of an in-memory buffer.
 */
export const calculateBufferChecksum = (buffer: Buffer): string =>
  createHash("sha256").update(buffer).digest("hex");

/**
 * Calculates the SHA-256 checksum of a file efficiently using streaming.
 *
 * Processes the file in chunks to minimize memory usage, making it suitable
 * for large files.
 *
 * @param filePath - Path to the file for checksum calculation
 * @returns Hex-encoded SHA-256 hash of the file contents
 * @throws {Error} If file reading or hashing encounters an issue
 *
 * @example
 * ```typescript
 * try {
 *   const checksum = await calculateChecksum("path/to/file.txt");
 *   console.log(checksum); // e.g. "a1b2c3d4..."
 * } catch (error) {
 *   console.error("Checksum calculation failed:", error);
 * }
 * ```
 */
export const calculateChecksum = async (filePath: string): Promise<string> => {
  const hash = createHash("sha256");
  const fileStream = createReadStream(filePath);

  try {
    await pipeline(fileStream, hash);
    return hash.digest("hex");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Checksum calculation failed for ${filePath}: ${message}`);
  }
};
