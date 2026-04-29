import { redis } from "@motormetrics/utils";
import { MAKES_SORTED_SET_KEY } from "@web/lib/redis/makes";
import { getDistinctMakes } from "@web/queries/cars";
import type { Make } from "@web/types";
import { cacheLife, cacheTag } from "next/cache";

export interface GroupedMakesResult {
  sortedMakes: Make[];
  groupedMakes: Record<string, Make[]>;
  letters: string[];
}

const getLetterFromMake = (make: Make): string => {
  const firstChar = make.trim().charAt(0).toUpperCase();
  return firstChar >= "A" && firstChar <= "Z" ? firstChar : "#";
};

export async function getGroupedMakes(): Promise<GroupedMakesResult> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:makes");

  let sortedMakes = await redis.zrange<Make[]>(MAKES_SORTED_SET_KEY, 0, -1);

  // Fallback to database when Redis sorted set is not populated
  if (!sortedMakes || sortedMakes.length === 0) {
    const dbMakes = await getDistinctMakes();
    sortedMakes = dbMakes.map((item) => item.make);
  }

  if (sortedMakes.length === 0) {
    return { sortedMakes: [], groupedMakes: {}, letters: ["ALL"] };
  }

  const grouped = sortedMakes.reduce<Record<string, Make[]>>((acc, make) => {
    const letter = getLetterFromMake(make);
    acc[letter] = acc[letter] ? [...acc[letter], make] : [make];
    return acc;
  }, {});

  const sortedLetters = Object.keys(grouped).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  return {
    sortedMakes,
    groupedMakes: grouped,
    letters: ["ALL", ...sortedLetters],
  };
}
