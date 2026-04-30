"use client";

import { Alert } from "@heroui/alert";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
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
      <CardBody className="flex flex-col gap-6 p-6">
        <Typography.H4>Calculate Your PARF Rebate</Typography.H4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="ARF Amount Paid"
            labelPlacement="outside"
            placeholder="e.g. 40,000"
            startContent={<span className="text-default-400 text-sm">$</span>}
            type="text"
            inputMode="numeric"
            value={arfInput}
            onValueChange={setArfInput}
          />
          <Select
            label="Vehicle Age at Deregistration"
            labelPlacement="outside"
            selectedKeys={[selectedBracket]}
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];
              if (key !== undefined) setSelectedBracket(String(key));
            }}
          >
            {AGE_BRACKETS.map(({ key, label }) => (
              <SelectItem key={key}>{label}</SelectItem>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="border border-default-200 bg-default-50 shadow-none">
            <CardBody className="flex flex-col gap-4 p-6">
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
              <Divider />
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
            </CardBody>
          </Card>

          <Card className="border border-primary-200 bg-primary-50 shadow-none">
            <CardBody className="flex flex-col gap-4 p-6">
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
              <Divider />
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
            </CardBody>
          </Card>
        </div>

        {result.difference > 0 && (
          <Alert
            color="danger"
            variant="bordered"
            icon={<ArrowDown className="size-4" />}
            title={
              <span>
                You would receive{" "}
                <strong>
                  <Currency value={result.difference} /> less
                </strong>{" "}
                under the new Budget 2026 rates.
              </span>
            }
          />
        )}

        {bracket.oldRate === 0 && (
          <Alert
            hideIconWrapper
            color="default"
            variant="bordered"
            title="No PARF rebate is given for vehicles over 10 years old."
          />
        )}
      </CardBody>
    </Card>
  );
}
