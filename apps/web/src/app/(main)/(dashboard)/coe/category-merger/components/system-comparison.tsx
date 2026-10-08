import { Card, cn, Typography } from "@heroui/react";
import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

/** One labelled box in the flow, toned for a category, a price or a result. */
function Step({
  children,
  className,
  note,
}: {
  children: ReactNode;
  className?: string;
  note?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-3 py-4 text-center",
        className,
      )}
    >
      <span className="font-bold text-sm">{children}</span>
      {note ? <span className="text-xs opacity-80">{note}</span> : null}
    </div>
  );
}

function Flow() {
  return (
    <ArrowDown aria-hidden className="mx-auto size-5 shrink-0 text-muted" />
  );
}

/**
 * Today's two-category system beside LTA's proposed one, drawn as two flows
 * from bidding to what the buyer pays, so the change is a single comparison.
 */
export function SystemComparison() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <Card.Header>
          <Card.Title>Today</Card.Title>
          <Card.Description>Split by engine or motor power</Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Step
              className="bg-default"
              note="Up to 1,600cc and 130bhp, or EVs up to 110kW"
            >
              Category A
            </Step>
            <Step className="bg-default" note="Everything above">
              Category B
            </Step>
          </div>
          <Flow />
          <div className="flex gap-3">
            <Step className="bg-default">Cat A price</Step>
            <Step className="bg-default">Cat B price</Step>
          </div>
          <Flow />
          <Step className="bg-default">
            Buyer pays their category&apos;s price
          </Step>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Proposed</Card.Title>
          <Card.Description>
            Split by the car model&apos;s value
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          <Step
            className="bg-accent-soft text-accent-strong"
            note="All cars bid from one pool"
          >
            One car category
          </Step>
          <Flow />
          <Step className="bg-accent-soft text-accent-strong">
            One COE price
          </Step>
          <Flow />
          <div className="flex gap-3">
            <Step
              className="bg-success-soft text-success-soft-foreground"
              note="Lower-value models"
            >
              Rebate
            </Step>
            <Step className="bg-default" note="Mid-range models">
              No change
            </Step>
            <Step
              className="bg-danger-soft text-danger-soft-foreground"
              note="Higher-value models"
            >
              Surcharge
            </Step>
          </div>
        </Card.Content>
      </Card>
      <Typography.Paragraph className="md:col-span-2" color="muted" size="sm">
        The feebate is set by the model&apos;s median OMV, up to $15,000 either
        way.
      </Typography.Paragraph>
    </div>
  );
}
