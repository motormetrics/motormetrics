import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OG_CONFIG } from "@web/lib/og/config";

const FONT_DIR = join(process.cwd(), "assets/fonts");

const WEIGHTS = [
  { weight: 500, file: "Geist-Medium.ttf" },
  { weight: 600, file: "Geist-SemiBold.ttf" },
  { weight: 700, file: "Geist-Bold.ttf" },
  { weight: 800, file: "Geist-ExtraBold.ttf" },
] as const;

const fontFiles = Promise.all(
  WEIGHTS.map(async ({ weight, file }) => ({
    name: OG_CONFIG.fontFamily,
    data: await readFile(join(FONT_DIR, file)),
    style: "normal" as const,
    weight,
  })),
);

/**
 * Geist weights used by the share cards. The files are read once per
 * module instance and shared by every image route.
 */
export function getOGFonts() {
  return fontFiles;
}
