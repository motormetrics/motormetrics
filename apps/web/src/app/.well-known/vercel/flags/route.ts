import { getProviderData } from "@flags-sdk/vercel";
import * as flags from "@web/flags";
import { createFlagsDiscoveryEndpoint } from "flags/next";

export const GET = createFlagsDiscoveryEndpoint(() => getProviderData(flags));
