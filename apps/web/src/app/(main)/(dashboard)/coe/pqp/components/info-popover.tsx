import { Button, Popover, Text } from "@heroui/react";
import { InfoIcon } from "lucide-react";

export function InfoPopover() {
  return (
    <Popover>
      <Popover.Trigger>
        <Button
          isIconOnly
          variant="tertiary"
          size="sm"
          className="rounded-full"
          aria-label="About PQP Rates"
        >
          <InfoIcon className="size-5" aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="max-w-md" placement="bottom end">
        <div className="flex flex-col gap-4 p-4">
          <Text type="h4">Understanding PQP Rates</Text>
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
      </Popover.Content>
    </Popover>
  );
}
