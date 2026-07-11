import { Button, Popover, Tooltip } from "@heroui/react";
import Typography from "@web/components/typography";
import { InfoIcon } from "lucide-react";

export function InfoPopover() {
  return (
    <Popover>
      <Popover.Trigger>
        <Tooltip delay={300}>
          <Button
            isIconOnly
            variant="tertiary"
            className="size-10"
            aria-label="About PQP rates"
          >
            <InfoIcon className="size-5" aria-hidden="true" />
          </Button>
          <Tooltip.Content>About PQP rates</Tooltip.Content>
        </Tooltip>
      </Popover.Trigger>
      <Popover.Content className="max-w-md" placement="bottom end">
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
      </Popover.Content>
    </Popover>
  );
}
