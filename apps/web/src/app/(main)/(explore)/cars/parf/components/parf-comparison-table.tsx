"use client";

import { Card, CardBody } from "@heroui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { cn } from "@heroui/theme";
import Typography from "@web/components/typography";
import { ArrowDown, Table as TableIcon } from "lucide-react";

const BRACKETS = [
  {
    age: "5 years or younger",
    oldRate: "75%",
    newRate: "30%",
    change: "-45pp",
  },
  { age: ">5 to 6 years", oldRate: "70%", newRate: "25%", change: "-45pp" },
  { age: ">6 to 7 years", oldRate: "65%", newRate: "20%", change: "-45pp" },
  { age: ">7 to 8 years", oldRate: "60%", newRate: "15%", change: "-45pp" },
  { age: ">8 to 9 years", oldRate: "55%", newRate: "10%", change: "-45pp" },
  { age: ">9 to 10 years", oldRate: "50%", newRate: "5%", change: "-45pp" },
  { age: "Over 10 years", oldRate: "0%", newRate: "0%", change: null },
];

export function PARFComparisonTable() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardBody className="flex flex-col gap-0 p-0">
        <div className="flex items-center gap-2 px-6 py-4">
          <TableIcon className="size-4 text-primary" />
          <Typography.H4>PARF Rebate Rate Comparison</Typography.H4>
        </div>
        <Table
          aria-label="PARF rebate rate comparison by vehicle age"
          removeWrapper
          classNames={{
            th: "text-xs uppercase tracking-wider",
            td: "py-2",
          }}
        >
          <TableHeader>
            <TableColumn>Vehicle Age</TableColumn>
            <TableColumn align="center">Old Rate</TableColumn>
            <TableColumn align="center" className="text-primary">
              New Rate
            </TableColumn>
            <TableColumn align="end" className="text-danger">
              Change
            </TableColumn>
          </TableHeader>
          <TableBody>
            {BRACKETS.map((row) => (
              <TableRow key={row.age}>
                <TableCell className="font-medium">{row.age}</TableCell>
                <TableCell className={cn("text-center text-default-500")}>
                  {row.oldRate}
                </TableCell>
                <TableCell className="text-center font-semibold text-primary">
                  {row.newRate}
                </TableCell>
                <TableCell className="text-right">
                  {row.change ? (
                    <span className="inline-flex items-center justify-end gap-1 font-semibold text-danger text-xs">
                      <ArrowDown className="size-4" />
                      {row.change}
                    </span>
                  ) : (
                    <span className="text-default-400 text-xs">No change</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col justify-between gap-2 border-default-200 border-t bg-default-50 px-6 py-4 text-default-500 text-xs sm:flex-row">
          <span>
            Rebate Cap: <strong className="text-foreground">$60,000</strong>{" "}
            (old) &rarr; <strong className="text-foreground">$30,000</strong>{" "}
            (new)
          </span>
          <span>Effective: 2nd COE bidding, Feb 2026</span>
        </div>
      </CardBody>
    </Card>
  );
}
