import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { z } from "zod";

const revalidateBodySchema = z.object({
  tags: z.array(z.string()).optional(),
  tag: z.string().optional(),
  path: z.string().optional(),
});

/**
 * On-demand cache revalidation endpoint for granular cache tag invalidation.
 *
 * Supported cache tags:
 *
 * Cars:
 * - cars:month:{month}     - Month-specific data (e.g., cars:month:2024-01)
 * - cars:year:{year}       - Year-specific data (e.g., cars:year:2024)
 * - cars:make:{make}       - Make-specific data (e.g., cars:make:toyota)
 * - cars:fuel:{fuelType}   - Fuel type data (e.g., cars:fuel:electric)
 * - cars:vehicle:{type}    - Vehicle type data (e.g., cars:vehicle:saloon)
 * - cars:category:{cat}    - Category data (e.g., cars:category:saloon)
 * - cars:makes             - All makes list
 * - cars:months            - Available months list
 * - cars:annual            - Yearly registration totals
 *
 * COE:
 * - coe:results            - All COE results
 * - coe:latest             - Latest COE results
 * - coe:period:{period}    - Period-filtered data (e.g., coe:period:12m)
 * - coe:category:{cat}     - Category data (e.g., coe:category:A)
 * - coe:year:{year}        - Year-specific data (e.g., coe:year:2024)
 * - coe:months             - Available COE months
 * - coe:pqp                - PQP rates data
 *
 * Posts:
 * - posts:list             - Blog post list
 * - posts:slug:{slug}      - Individual post (e.g., posts:slug:jan-2024)
 */
export const POST = async (req: NextRequest) => {
  const token = req.headers.get("x-revalidate-token");
  const expectedToken = process.env.REVALIDATE_TOKEN;

  if (!token) {
    return Response.json(
      { message: "Missing revalidate token" },
      { status: 400 },
    );
  }

  if (!expectedToken) {
    return Response.json(
      { message: "Revalidate token is not configured" },
      { status: 500 },
    );
  }

  if (token !== expectedToken) {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    const parsed = revalidateBodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { message: "Invalid request body", error: parsed.error.message },
        { status: 400 },
      );
    }

    // Support single tag or array of tags
    const tags = parsed.data.tags ?? (parsed.data.tag ? [parsed.data.tag] : []);
    const path = parsed.data.path;

    const revalidated: { tags?: string[]; path?: string } = {};

    // Revalidate tags
    if (tags.length > 0) {
      for (const tag of tags) {
        revalidateTag(tag, "max");
      }
      revalidated.tags = tags;
    }

    // Revalidate path
    if (path) {
      revalidatePath(path);
      revalidated.path = path;
    }

    if (!tags.length && !path) {
      return Response.json(
        { message: "No tags or path provided" },
        { status: 400 },
      );
    }

    return Response.json({
      revalidated: true,
      ...revalidated,
      now: Date.now(),
    });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to revalidate",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
