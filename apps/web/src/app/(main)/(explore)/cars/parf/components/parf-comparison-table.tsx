"use client";

import { Card, Table } from "@heroui/react";

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
    <Card className="overflow-hidden">
      <Card.Content className="flex flex-col gap-0 p-0">
        <div className="flex items-center gap-2 px-6 py-4">
          <TableIcon className="size-4 text-accent" />
          <Typography.H4>PARF Rebate Rate Comparison</Typography.H4>
        </div>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="PARF rebate rate comparison by vehicle age">
              <Table.Header>
                <Table.Column>Vehicle Age</Table.Column>
                <Table.Column>Old Rate</Table.Column>
                <Table.Column>New Rate</Table.Column>
                <Table.Column>Change</Table.Column>
              </Table.Header>
              <Table.Body>
                {BRACKETS.map((row) => (
                  <Table.Row key={row.age}>
                    <Table.Cell>{row.age}</Table.Cell>
                    <Table.Cell>{row.oldRate}</Table.Cell>
                    <Table.Cell>{row.newRate}</Table.Cell>
                    <Table.Cell>
                      {row.change ? (
                        <span className="inline-flex items-center gap-1 text-danger">
                          <ArrowDown className="size-4" />
                          {row.change}
                        </span>
                      ) : (
                        "No change"
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
        <div className="flex flex-col justify-between gap-2 border-border border-t bg-default px-6 py-4 text-muted text-xs sm:flex-row">
          <span>
            Rebate Cap: <strong className="text-foreground">$60,000</strong>{" "}
            (old) &rarr; <strong className="text-foreground">$30,000</strong>{" "}
            (new)
          </span>
          <span>Effective: 2nd COE bidding, Feb 2026</span>
        </div>
      </Card.Content>
    </Card>
  );
}
