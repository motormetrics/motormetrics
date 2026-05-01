"use client";

import {
  Alert,
  Card,
  Input,
  Label,
  ListBox,
  Select,
  Separator,
} from "@heroui/react";

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
      <Card.Content className="flex flex-col gap-6 p-6">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="border border-default-200 bg-default-50 shadow-none">
            <Card.Content className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-default-400" />
                <Typography.Caption className="font-semibold text-default-500 uppercase tracking-wider">
                  Before Budget 2026
                </Typography.Caption>
              </div>
              <div className="flex flex-col gap-2">
                <Typography.Caption>PARF Rebate</Typography.Caption>
                <span className="font-bold text-3xl text-default-600 tracking-tight">
                  <Currency value={result.oldRebate} />
                </span>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-default-500">Rebate Rate</span>
                  <span className="font-medium">{bracket.oldRate * 100}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-default-500">Uncapped Amount</span>
                  <span className="font-medium">
                    <Currency value={result.oldUncapped} />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-default-500">Cap</span>
                  <span className="font-medium">
                    <Currency value={OLD_CAP} />
                  </span>
                </div>
              </div>
              {result.oldCapped && (
                <Typography.Caption className="text-warning">
                  Cap of <Currency value={OLD_CAP} /> applied
                </Typography.Caption>
              )}
            </Card.Content>
          </Card>

          <Card className="border border-accent/20 bg-accent-soft shadow-none">
            <Card.Content className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <Typography.Caption className="font-semibold text-primary uppercase tracking-wider">
                  After Budget 2026
                </Typography.Caption>
              </div>
              <div className="flex flex-col gap-2">
                <Typography.Caption>PARF Rebate</Typography.Caption>
                <span className="font-bold text-3xl text-primary tracking-tight">
                  <Currency value={result.newRebate} />
                </span>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-default-500">Rebate Rate</span>
                  <span className="font-medium">{bracket.newRate * 100}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-default-500">Uncapped Amount</span>
                  <span className="font-medium">
                    <Currency value={result.newUncapped} />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-default-500">Cap</span>
                  <span className="font-medium">
                    <Currency value={NEW_CAP} />
                  </span>
                </div>
              </div>
              {result.newCapped && (
                <Typography.Caption className="text-warning">
                  Cap of <Currency value={NEW_CAP} /> applied
                </Typography.Caption>
              )}
            </Card.Content>
          </Card>
        </div>

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
