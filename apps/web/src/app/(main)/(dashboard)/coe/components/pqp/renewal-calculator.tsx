"use client";

import { Alert, Card, Tabs } from "@heroui/react";
import { KPI, KPIGroup, NumberValue } from "@heroui-pro/react";

import Typography from "@web/components/typography";
import type { Pqp } from "@web/types/coe";
import { Bike, Calculator, Car, type LucideIcon, Truck } from "lucide-react";
import { useMemo, useState } from "react";

interface PQPCalculatorProps {
  data: Pqp.CategorySummary[];
}

interface CoeCategory {
  key: keyof Pqp.Rates;
  label: string;
  description: string;
  icon: LucideIcon;
}

const coeCategories: CoeCategory[] = [
  {
    key: "Category A",
    label: "Category A",
    description: "≤1600cc, ≤130bhp",
    icon: Car,
  },
  {
    key: "Category B",
    label: "Category B",
    description: ">1600cc or >130bhp",
    icon: Car,
  },
  {
    key: "Category C",
    label: "Category C",
    description: "Goods Vehicles & Buses",
    icon: Truck,
  },
  {
    key: "Category D",
    label: "Category D",
    description: "Motorcycles",
    icon: Bike,
  },
];

const buildRecommendation = (
  savings5Year: number,
  savings10Year: number,
): string => {
  if (savings5Year > 0) {
    return "PQP renewal is currently more cost-effective than bidding. Consider the 5-year option for flexibility or 10-year for maximum value.";
  }
  if (savings10Year > 0) {
    return "Current bidding may be cheaper than 5-year PQP, but 10-year PQP offers better value. Consider market volatility and your long-term plans.";
  }
  return "Current market bidding appears more cost-effective than PQP renewal. However, consider bidding uncertainty and your risk tolerance.";
};

export function RenewalCalculator({ data }: PQPCalculatorProps) {
  const renewalRecords = useMemo<Pqp.RenewalRecord[]>(() => {
    return data.map((record) => ({
      category: record.category as keyof Pqp.Rates,
      pqpRate: record.pqpRate,
      coePremium: record.coePremium,
      pqpCost5Year: record.pqpCost5Year,
      pqpCost10Year: record.pqpCost10Year,
      pqpSavings5Year: record.savings5Year,
      pqpSavings10Year: record.savings10Year,
      recommendation: buildRecommendation(
        record.savings5Year,
        record.savings10Year,
      ),
    }));
  }, [data]);

  const [selectedCategory, setSelectedCategory] =
    useState<keyof Pqp.Rates>("Category A");
  const selectedRecord = renewalRecords.find(
    ({ category }) => category === selectedCategory,
  );

  return (
    <Card>
      <Card.Header className="flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="size-5" />
          <Typography.H4>PQP vs Bidding Calculator</Typography.H4>
        </div>
        <Typography.TextSm className="text-muted">
          Compare costs between PQP renewal and current market bidding
        </Typography.TextSm>
      </Card.Header>
      <Card.Content className="gap-4">
        <Tabs
          selectedKey={selectedCategory}
          onSelectionChange={(key) =>
            setSelectedCategory(key as keyof Pqp.Rates)
          }
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="COE categories">
              {coeCategories.map(({ key, icon: Icon, label }) => (
                <Tabs.Tab key={key} id={key}>
                  <Icon className="size-4" />
                  <span>{label}</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
          {coeCategories.map(({ key }) => {
            const categoryRecord = renewalRecords.find(
              ({ category }) => category === key,
            );
            const currentPQPRate = categoryRecord?.pqpRate ?? 0;
            const currentCOEPremium = categoryRecord?.coePremium ?? 0;

            return (
              <Tabs.Panel key={key} id={key}>
                <div className="flex flex-col gap-4">
                  <KPIGroup>
                    <KPI>
                      <KPI.Header>
                        <KPI.Title>Current PQP Rate</KPI.Title>
                      </KPI.Header>
                      <KPI.Content>
                        <KPI.Value
                          currency="SGD"
                          locale="en-SG"
                          maximumFractionDigits={0}
                          style="currency"
                          value={currentPQPRate}
                        />
                      </KPI.Content>
                      <KPI.Footer>
                        <span className="text-muted text-xs">
                          Latest available rate
                        </span>
                      </KPI.Footer>
                    </KPI>
                    <KPIGroup.Separator />
                    <KPI>
                      <KPI.Header>
                        <KPI.Title>Current COE Price</KPI.Title>
                      </KPI.Header>
                      <KPI.Content>
                        <KPI.Value
                          currency="SGD"
                          locale="en-SG"
                          maximumFractionDigits={0}
                          style="currency"
                          value={currentCOEPremium}
                        />
                      </KPI.Content>
                      <KPI.Footer>
                        <span className="text-muted text-xs">
                          Latest COE premium
                        </span>
                      </KPI.Footer>
                    </KPI>
                  </KPIGroup>
                </div>
              </Tabs.Panel>
            );
          })}
        </Tabs>
        {selectedRecord && (
          <div className="flex flex-col gap-4">
            <KPIGroup>
              <KPI>
                <KPI.Header>
                  <KPI.Title>PQP 5-Year Renewal (Estimate)</KPI.Title>
                </KPI.Header>
                <KPI.Content>
                  <KPI.Value
                    currency="SGD"
                    locale="en-SG"
                    maximumFractionDigits={0}
                    style="currency"
                    value={selectedRecord.pqpCost5Year}
                  />
                </KPI.Content>
                <KPI.Footer>
                  <span
                    className={`text-sm ${
                      selectedRecord.pqpSavings5Year > 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {selectedRecord.pqpSavings5Year > 0 ? "Saves" : "Costs"}{" "}
                    <NumberValue
                      currency="SGD"
                      locale="en-SG"
                      maximumFractionDigits={0}
                      style="currency"
                      value={Math.abs(selectedRecord.pqpSavings5Year)}
                    />
                  </span>
                </KPI.Footer>
              </KPI>
              <KPIGroup.Separator />
              <KPI>
                <KPI.Header>
                  <KPI.Title>PQP 10-Year Renewal (Estimate)</KPI.Title>
                </KPI.Header>
                <KPI.Content>
                  <KPI.Value
                    currency="SGD"
                    locale="en-SG"
                    maximumFractionDigits={0}
                    style="currency"
                    value={selectedRecord.pqpCost10Year}
                  />
                </KPI.Content>
                <KPI.Footer>
                  <span
                    className={`text-sm ${
                      selectedRecord.pqpSavings10Year > 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {selectedRecord.pqpSavings10Year > 0 ? "Saves" : "Costs"}{" "}
                    <NumberValue
                      currency="SGD"
                      locale="en-SG"
                      maximumFractionDigits={0}
                      style="currency"
                      value={Math.abs(selectedRecord.pqpSavings10Year)}
                    />
                  </span>
                </KPI.Footer>
              </KPI>
            </KPIGroup>

            <Alert status="accent" className="border border-accent/40">
              <Alert.Content>
                <Alert.Title>Note</Alert.Title>
                <Alert.Description>
                  {selectedRecord.recommendation}
                </Alert.Description>
              </Alert.Content>
            </Alert>

            <div className="flex flex-col gap-1 text-muted text-xs">
              <p>
                * All calculations are estimates only and exclude processing
                fees, registration fees, and other charges
              </p>
              <p>* Actual costs may vary significantly from these estimates</p>
              <p>
                * PQP rates are based on 3-month moving averages and updated
                monthly
              </p>
              <p>* Bidding prices are estimates based on recent market data</p>
              <p>
                * Consider vehicle condition, maintenance costs, and personal
                circumstances
              </p>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
