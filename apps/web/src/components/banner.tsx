"use client";

import useStore from "@web/app/store";

export function Banner() {
  const { bannerContent } = useStore();

  if (!bannerContent) {
    return null;
  }

  return (
    <div className="flex items-center overflow-x-auto whitespace-nowrap border-t bg-default shadow-md">
      <div className="mx-auto w-full max-w-page px-4 py-4 sm:px-6 lg:px-9">
        {bannerContent}
      </div>
    </div>
  );
}
