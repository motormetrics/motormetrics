import { describe, expect, it } from "vitest";
import {
  extractFileExtension,
  getContentType,
  getFileExtension,
} from "../file-utils";

describe("getContentType", () => {
  it.each([
    ["logo.png", "image/png"],
    ["logo.jpg", "image/jpeg"],
    ["logo.JPEG", "image/jpeg"],
    ["logo.gif", "image/gif"],
    ["logo.svg", "image/svg+xml"],
    ["logo.webp", "image/webp"],
    ["logo.unknown", "image/png"],
    ["logo", "image/png"],
    ["", "image/png"],
  ])("maps %s to %s", (filename, contentType) => {
    expect(getContentType(filename)).toBe(contentType);
  });
});

describe("getFileExtension", () => {
  it.each([
    ["image/png", "png"],
    ["IMAGE/JPEG", "jpg"],
    ["image/jpg", "jpg"],
    ["image/gif", "gif"],
    ["image/svg+xml", "svg"],
    ["image/webp", "webp"],
    ["image/png; charset=utf-8", "png"],
    ["application/octet-stream", "png"],
    ["", "png"],
  ])("maps %s to %s", (contentType, extension) => {
    expect(getFileExtension(contentType)).toBe(extension);
  });
});

describe("extractFileExtension", () => {
  it.each([
    ["https://source/logo.png", "png"],
    ["https://source/logo.JPEG", "jpeg"],
    ["https://source/logo.webp?version=2", "webp"],
    ["https://source/logo.svg?download=logo.png", "svg"],
    ["https://source/logo", "png"],
    ["https://source/logo.", "png"],
    ["", "png"],
  ])("extracts the extension from %s", (url, extension) => {
    expect(extractFileExtension(url)).toBe(extension);
  });
});
