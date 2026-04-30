import { Button } from "@heroui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import Typography from "@web/components/typography";
import { InfoIcon } from "lucide-react";

export function InfoPopover() {
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="light"
          size="sm"
          radius="full"
          aria-label="About PQP Rates"
        >
          <InfoIcon className="size-5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-md">
        <div className="flex flex-col gap-4 p-4">
          <Typography.H4>Understanding PQP Rates</Typography.H4>
          <div className="flex flex-col gap-4 text-sm">
            <p>
              Certificate of Entitlement (COE) Prevailing Quota Premium (PQP)
              rates are specific to Singapore&apos;s vehicle ownership system.
              They represent the average COE prices over the last 3 months,
              which car owners must pay to renew their existing vehicle&apos;s
              COE.
            </p>
            <p>
              The PQP system allows car owners to extend their COE for another 5
              or 10 years by paying the prevailing market rate rather than
              bidding in the open market. This is particularly relevant for
              owners who wish to keep their vehicles beyond the initial 10-year
              COE period.
            </p>
            <p>
              The Land Transport Authority (LTA) calculates and updates these
              rates monthly based on the moving average of COE prices in the
              preceding three months.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
