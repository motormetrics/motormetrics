import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  HERO_IMAGE_INSTRUCTION,
  HERO_IMAGE_SIZE,
  HERO_IMAGE_SUBJECTS,
} from "../config";
import { generateHeroImage } from "../generate-hero-image";

const { imageModel, generateImage, uploadPostHeroImage } = vi.hoisted(() => ({
  imageModel: vi.fn(),
  generateImage: vi.fn(),
  uploadPostHeroImage: vi.fn(),
}));
vi.mock("@ai-sdk/gateway", () => ({ gateway: { imageModel } }));
vi.mock("ai", () => ({ generateImage }));
vi.mock("../blob", () => ({ uploadPostHeroImage }));

const params = {
  title: "Registrations rose",
  excerpt: "More cars arrived in July.",
  dataType: "cars",
  slug: "july-cars",
} as const;

beforeEach(() => {
  vi.resetAllMocks();
  imageModel.mockReturnValue("image-model");
  generateImage.mockResolvedValue({
    images: [
      {
        base64: Buffer.from("first image").toString("base64"),
        mediaType: "image/png",
      },
    ],
  });
  uploadPostHeroImage.mockResolvedValue({
    url: "https://blob/hero.png",
    pathname: "posts/hero/july-cars.png",
  });
});

describe("generateHeroImage", () => {
  it.each(
    Object.keys(HERO_IMAGE_SUBJECTS) as Array<keyof typeof HERO_IMAGE_SUBJECTS>,
  )("uses the subject and post context for %s", async (dataType) => {
    await expect(generateHeroImage({ ...params, dataType })).resolves.toEqual({
      url: "https://blob/hero.png",
      pathname: "posts/hero/july-cars.png",
    });
    expect(imageModel).toHaveBeenCalledExactlyOnceWith("openai/gpt-image-2");
    expect(generateImage).toHaveBeenCalledExactlyOnceWith({
      model: "image-model",
      prompt: expect.stringContaining(HERO_IMAGE_SUBJECTS[dataType]),
      size: HERO_IMAGE_SIZE,
      providerOptions: {
        openai: { quality: "high" },
        gateway: { tags: ["feature:blog-hero", `dataType:${dataType}`] },
      },
    });
    const prompt: string = generateImage.mock.calls[0][0].prompt;
    expect(prompt).toContain(HERO_IMAGE_INSTRUCTION);
    expect(prompt).toContain(`Title: ${params.title}`);
    expect(prompt).toContain(`Excerpt: ${params.excerpt}`);
    expect(prompt).toContain(`Dataset: ${dataType} (Singapore LTA data)`);
    expect(uploadPostHeroImage).toHaveBeenCalledExactlyOnceWith(
      params.slug,
      Buffer.from("first image"),
      "image/png",
    );
  });

  it("uploads only the first image using its media type", async () => {
    generateImage.mockResolvedValue({
      images: [
        {
          base64: Buffer.from("jpeg image").toString("base64"),
          mediaType: "image/jpeg",
        },
        {
          base64: Buffer.from("unused image").toString("base64"),
          mediaType: "image/png",
        },
      ],
    });
    await generateHeroImage(params);
    expect(uploadPostHeroImage).toHaveBeenCalledExactlyOnceWith(
      params.slug,
      Buffer.from("jpeg image"),
      "image/jpeg",
    );
  });

  it("rejects empty image results without uploading", async () => {
    generateImage.mockResolvedValue({ images: [] });
    await expect(generateHeroImage(params)).rejects.toThrow(
      "No image returned from gpt-image-2",
    );
    expect(uploadPostHeroImage).not.toHaveBeenCalled();
  });

  it("propagates generation failures without uploading", async () => {
    const error = new Error("Generation failed");
    generateImage.mockRejectedValue(error);
    await expect(generateHeroImage(params)).rejects.toBe(error);
    expect(uploadPostHeroImage).not.toHaveBeenCalled();
  });

  it("propagates upload failures for workflow retries", async () => {
    const error = new Error("Upload failed");
    uploadPostHeroImage.mockRejectedValue(error);
    await expect(generateHeroImage(params)).rejects.toBe(error);
  });
});
