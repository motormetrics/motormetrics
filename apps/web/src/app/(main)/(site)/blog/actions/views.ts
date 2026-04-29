"use server";

import { redis } from "@motormetrics/utils";

export const incrementPostView = async (postId: string): Promise<number> => {
  try {
    const newCount = await redis.zincrby("blog:popular", 1, postId);
    return newCount;
  } catch (error) {
    console.error("Error incrementing post view:", error);
    return 0;
  }
};
