import { gateway } from "@ai-sdk/gateway";
import { generateImage } from "ai";
import { uploadPostHeroImage } from "./blob";
import {
  HERO_IMAGE_INSTRUCTION,
  HERO_IMAGE_SIZE,
  HERO_IMAGE_SUBJECTS,
} from "./config";

type HeroDataType = keyof typeof HERO_IMAGE_SUBJECTS;

export interface GenerateHeroImageParams {
  title: string;
  excerpt: string;
  dataType: HeroDataType;
  slug: string;
}

export interface GenerateHeroImageResult {
  url: string;
  pathname: string;
}

function buildHeroImagePrompt(params: {
  title: string;
  excerpt: string;
  dataType: HeroDataType;
}): string {
  const { title, excerpt, dataType } = params;
  const subject = HERO_IMAGE_SUBJECTS[dataType];

  return `${HERO_IMAGE_INSTRUCTION}

SUBJECT
${subject}

POST CONTEXT
- Title: ${title}
- Excerpt: ${excerpt}
- Dataset: ${dataType} (Singapore LTA data)`;
}

export async function generateHeroImage(
  params: GenerateHeroImageParams,
): Promise<GenerateHeroImageResult> {
  const { title, excerpt, dataType, slug } = params;

  const result = await generateImage({
    model: gateway.imageModel("openai/gpt-image-2"),
    prompt: buildHeroImagePrompt({ title, excerpt, dataType }),
    size: HERO_IMAGE_SIZE,
    providerOptions: {
      openai: { quality: "high" },
      gateway: {
        tags: ["feature:blog-hero", `dataType:${dataType}`],
      },
    },
  });

  const [image] = result.images;
  if (!image) {
    throw new Error("No image returned from gpt-image-2");
  }

  const buffer = Buffer.from(image.base64, "base64");
  return uploadPostHeroImage(slug, buffer, image.mediaType);
}
