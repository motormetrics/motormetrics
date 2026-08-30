import { advertiseNav, blogNav, socialLinks } from "@web/flags";
import { evaluate } from "flags/next";
import { cache } from "react";

export const getChromeFlags = cache(() =>
  evaluate({ advertiseNav, blogNav, socialLinks }),
);
