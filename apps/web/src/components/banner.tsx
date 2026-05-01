"use client";

import useStore from "@web/app/store";

export function Banner() {
  const { bannerContent } = useStore();

  if (!bannerContent) {
    return null;
  }

  return (
    <div className="flex items-center overflow-x-auto whitespace-nowrap border-t bg-default shadow-md">
      <div className="px-6 py-4 lg:container lg:mx-auto">{bannerContent}</div>
    </div>
  );
}
