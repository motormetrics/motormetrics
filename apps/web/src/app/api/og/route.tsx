import { formatDateToMonthYear } from "@motormetrics/utils";
import { loadSearchParams } from "@web/app/api/og/search-params";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const { month, title, subtitle, total, topFuelType, topVehicleType } =
    loadSearchParams(request.nextUrl.searchParams);

  let formattedMonth = month;
  if (month) {
    formattedMonth = formatDateToMonthYear(month);
  }

  return new ImageResponse(
    <div
      tw="flex h-full w-full flex-col items-center justify-center bg-white"
      style={{
        position: "relative",
        background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(128,128,128,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`,
          backgroundSize: "500px 500px",
          opacity: 0.5,
        }}
      />
      <div tw="absolute bottom-8 left-8 flex items-center">
        {/** biome-ignore lint/a11y/noSvgWithoutTitle: TODO: to be updated */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-trending-up"
        >
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
        <span
          tw="ml-2 text-xl"
          style={{ textShadow: `0 2px 4px rgba(0,0,0,0.3)` }}
        >
          <span tw="text-black">Motor</span>
          <span tw="text-blue-600">Metrics</span>
        </span>
      </div>
      <div tw="flex w-full p-32">
        <div tw="flex w-full items-center justify-between py-8">
          <div
            tw="flex flex-col"
            style={{ textShadow: `0 2px 4px rgba(0,0,0,0.3)` }}
          >
            <h1 tw="flex flex-col text-left text-3xl font-bold sm:text-4xl">
              <span>{title}</span>
              <span tw="text-blue-600">{formattedMonth}</span>
            </h1>
            <h2 tw="text-gray-600">{subtitle}</h2>
          </div>
          {total && (
            <div tw="flex flex-col text-2xl">
              {total && (
                <div tw="-mr-64 mb-4 flex w-[50vw] flex-col rounded-2xl bg-gray-50 p-8 shadow-lg">
                  Total Registrations
                  <span
                    tw="text-blue-600"
                    style={{ textShadow: `0 2px 4px rgba(0,0,0,0.3)` }}
                  >
                    {total}
                  </span>
                </div>
              )}
              {topFuelType && (
                <div tw="-mr-64 mb-4 flex w-[50vw] flex-col rounded-2xl bg-gray-50 p-8 shadow-lg">
                  Top Fuel Type
                  <span
                    tw="text-green-600"
                    style={{ textShadow: `0 2px 4px rgba(0,0,0,0.3)` }}
                  >
                    {topFuelType}
                  </span>
                </div>
              )}
              {topVehicleType && (
                <div tw="-mr-64 mb-4 flex w-[50vw] flex-col rounded-2xl bg-gray-50 p-8 shadow-lg">
                  Top Vehicle Type
                  <span
                    tw="text-pink-600"
                    style={{ textShadow: `0 2px 4px rgba(0,0,0,0.3)` }}
                  >
                    {topVehicleType}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
};
