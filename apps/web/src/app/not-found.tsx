import { PageNotFound } from "@web/components/page-not-found";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: { index: false, follow: false },
};

const NotFound = () => {
  return <PageNotFound />;
};

export default NotFound;
