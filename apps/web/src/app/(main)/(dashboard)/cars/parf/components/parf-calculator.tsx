"use client";

import { Alert, Card, Input, Label, ListBox, Select } from "@heroui/react";
import { KPI, KPIGroup } from "@heroui-pro/react";

import { Currency } from "@web/components/shared/currency";
import Typography from "@web/components/typography";
import { ArrowDown } from "lucide-react";
import { useMemo, useState } from "react";

interface AgeBracket {
  key: string;
  label: string;
  oldRate: number;
  newRate: number;
}

const AGE_BRACKETS: AgeBracket[] = [
  { key: "0", label: "5 years or younger", oldRate: 0.75, newRate: 0.3 },
  { key: "1", label: "More than 5 to 6 years", oldRate: 0.7, newRate: 0.25 },
  { key: "2", label: "More than 6 to 7 years", oldRate: 0.65, newRate: 0.2 },
  { key: "3", label: "More than 7 to 8 years", oldRate: 0.6, newRate: 0.15 },
  { key: "4", label: "More than 8 to 9 years", oldRate: 0.55, newRate: 0.1 },
  { key: "5", label: "More than 9 to 10 years", oldRate: 0.5, newRate: 0.05 },
  { key: "6", label: "Over 10 years", oldRate: 0, newRate: 0 },
];

const OLD_CAP = 60_000;
const NEW_CAP = 30_000;

export function PARFCalculator() {
  const [arfInput, setArfInput] = useState("80000");
  const [selectedBracket, setSelectedBracket] = useState("0");

  const arf = Number(arfInput.replace(/[^0-9.]/g, "")) || 0;
  const bracket = AGE_BRACKETS[Number(selectedBracket)] ?? AGE_BRACKETS[0];

  const result = useMemo(() => {
    const oldUncapped = arf * bracket.oldRate;
    const newUncapped = arf * bracket.newRate;
    const oldRebate = Math.min(oldUncapped, OLD_CAP);
    const newRebate = Math.min(newUncapped, NEW_CAP);
    const difference = oldRebate - newRebate;

    return {
      oldUncapped,
      newUncapped,
      oldRebate,
      newRebate,
      difference,
      oldCapped: oldUncapped > OLD_CAP,
      newCapped: newUncapped > NEW_CAP,
    };
  }, [arf, bracket]);

  return (
    <Card>
      <Card.Content className="flex flex-col gap-6">
        <Typography.H4>Calculate Your PARF Rebate</Typography.H4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            aria-label="ARF Amount Paid"
            placeholder="e.g. 40,000"
            type="text"
            inputMode="numeric"
            value={arfInput}
            onChange={(event) => setArfInput(event.target.value)}
          />
          <Select
            value={selectedBracket}
            onChange={(key) => key && setSelectedBracket(String(key))}
          >
            <Label>Vehicle Age at Deregistration</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {AGE_BRACKETS.map(({ key, label }) => (
                  <ListBox.Item key={key} id={key} textValue={label}>
                    {label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        <KPIGroup>
          <KPI>
            <KPI.Header>
              <KPI.Title>Before Budget 2026</KPI.Title>
            </KPI.Header>
            <KPI.Content>
              <KPI.Value
                className="text-muted"
                currency="SGD"
                locale="en-SG"
                maximumFractionDigits={0}
                style="currency"
                value={result.oldRebate}
              />
            </KPI.Content>
            <KPI.Footer>
              <div className="flex w-full flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Rebate Rate</span>
                  <span className="font-medium">{bracket.oldRate * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Uncapped Amount</span>
                  <span className="font-medium">
                    <Currency value={result.oldUncapped} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cap</span>
                  <span className="font-medium">
                    <Currency value={OLD_CAP} />
                  </span>
                </div>
                {result.oldCapped ? (
                  <Typography.Caption className="text-warning">
                    Cap of <Currency value={OLD_CAP} /> applied
                  </Typography.Caption>
                ) : null}
              </div>
            </KPI.Footer>
          </KPI>

          <KPIGroup.Separator />

          <KPI>
            <KPI.Header>
              <KPI.Title>After Budget 2026</KPI.Title>
            </KPI.Header>
            <KPI.Content>
              <KPI.Value
                className="text-accent"
                currency="SGD"
                locale="en-SG"
                maximumFractionDigits={0}
                style="currency"
                value={result.newRebate}
              />
            </KPI.Content>
            <KPI.Footer>
              <div className="flex w-full flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Rebate Rate</span>
                  <span className="font-medium">{bracket.newRate * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Uncapped Amount</span>
                  <span className="font-medium">
                    <Currency value={result.newUncapped} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cap</span>
                  <span className="font-medium">
                    <Currency value={NEW_CAP} />
                  </span>
                </div>
                {result.newCapped ? (
                  <Typography.Caption className="text-warning">
                    Cap of <Currency value={NEW_CAP} /> applied
                  </Typography.Caption>
                ) : null}
              </div>
            </KPI.Footer>
          </KPI>
        </KPIGroup>

        {result.difference > 0 && (
          <Alert status="danger" className="border border-danger/40">
            <Alert.Indicator>
              <ArrowDown className="size-4" />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title>
                <span>
                  You would receive{" "}
                  <strong>
                    <Currency value={result.difference} /> less
                  </strong>{" "}
                  under the new Budget 2026 rates.
                </span>
              </Alert.Title>
            </Alert.Content>
          </Alert>
        )}

        {bracket.oldRate === 0 && (
          <Alert className="border border-border">
            <Alert.Content>
              <Alert.Title>
                No PARF rebate is given for vehicles over 10 years old.
              </Alert.Title>
            </Alert.Content>
          </Alert>
        )}
      </Card.Content>
    </Card>
  );
}
