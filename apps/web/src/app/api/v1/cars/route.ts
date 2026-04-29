import { cars, db, desc, eq, sql, sum } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function getCarsData(
  month: string | null,
  page: number,
  limit: number,
  offset: number,
) {
  "use cache";
  cacheLife("max");

  if (month) {
    cacheTag(`cars:month:${month}`);
  } else {
    cacheTag("cars:months");
  }

  const filters = [];
  if (month) {
    filters.push(eq(cars.month, month));
  }

  const data = await db
    .select({
      month: cars.month,
      make: cars.make,
      fuelType: cars.fuelType,
      vehicleType: cars.vehicleType,
      number: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(filters.length > 0 ? filters[0] : undefined)
    .groupBy(cars.month, cars.make, cars.fuelType, cars.vehicleType)
    .orderBy(desc(cars.month), desc(sum(cars.number)))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({
      count:
        sql<number>`count(distinct (${cars.month}, ${cars.make}, ${cars.fuelType}, ${cars.vehicleType}))`.mapWith(
          Number,
        ),
    })
    .from(cars)
    .where(filters.length > 0 ? filters[0] : undefined);

  const total = countResult?.count ?? 0;

  return { data, total };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const month = searchParams.get("month");
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10),
  );
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)),
  );
  const offset = (page - 1) * limit;

  try {
    const { data, total } = await getCarsData(month, page, limit, offset);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching cars data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cars data",
        data: null,
      },
      { status: 500 },
    );
  }
}
