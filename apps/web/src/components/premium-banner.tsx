"use client";

import { Chip } from "@heroui/react";

import { formatCurrency } from "@motormetrics/utils";
import useStore from "@web/app/store";
import type { COEResult } from "@web/types";
import { useEffect } from "react";

interface PremiumBannerProps {
  data: COEResult[];
}

export function PremiumBanner({ data = [] }: PremiumBannerProps) {
  const setBannerContent = useStore(({ setBannerContent }) => setBannerContent);

  useEffect(() => {
    setBannerContent(
      <div className="flex items-center justify-center gap-4">
        {data.toSorted(sortByCategory).map(({ vehicleClass, premium }) => (
          <div key={vehicleClass} className="flex items-center gap-2">
            <div className="font-semibold text-sm">{vehicleClass}</div>
            <Chip color="accent" variant="primary">
              {formatCurrency(premium)}
            </Chip>
          </div>
        ))}
      </div>,
    );

    return () => {
      setBannerContent(null);
    };
  }, [data, setBannerContent]);

  return null;
}

// TODO: Move this to a common directory
const sortByCategory = (a: COEResult, b: COEResult) =>
  a.vehicleClass.localeCompare(b.vehicleClass);
