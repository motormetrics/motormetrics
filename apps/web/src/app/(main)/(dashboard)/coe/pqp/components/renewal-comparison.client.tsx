"use client";

import { Alert, Text } from "@heroui/react";
import { KPI, KPIGroup, NumberValue, Segment } from "@heroui-pro/react";

import type { Pqp } from "@web/types/coe";
import { useMemo, useState } from "react";

interface RenewalComparisonProps {
  categories?: Array<keyof Pqp.Rates>;
  data: Pqp.CategorySummary[];
}

interface CoeCategory {
  key: keyof Pqp.Rates;
  label: string;
  description: string;
}

const coeCategories: CoeCategory[] = [
  {
    key: "Category A",
    label: "Category A",
    description: "≤1600cc, ≤130bhp",
  },
  {
    key: "Category B",
    label: "Category B",
    description: ">1600cc or >130bhp",
  },
  {
    key: "Category C",
    label: "Category C",
    description: "Goods Vehicles & Buses",
  },
  {
    key: "Category D",
    label: "Category D",
    description: "Motorcycles",
  },
];

const defaultCategories = coeCategories.map(({ key }) => key);

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

export function RenewalComparison({
  categories = defaultCategories,
  data,
}: RenewalComparisonProps) {
  const visibleCategories = coeCategories.filter(({ key }) =>
    categories.includes(key),
  );
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

  const [selectedCategory, setSelectedCategory] = useState<keyof Pqp.Rates>(
    categories[0] ?? "Category A",
  );
  const selectedRecord = renewalRecords.find(
    ({ category }) => category === selectedCategory,
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Text type="h3">PQP vs Bidding Comparison</Text>
        <Text type="body-sm" color="muted">
          Compare renewal estimates against the latest market premium for each
          visible COE category.
        </Text>
      </div>
      <div className="flex flex-col gap-4">
        <Segment
          aria-label="COE categories"
          selectedKey={selectedCategory}
          variant="ghost"
          onSelectionChange={(key) =>
            setSelectedCategory(key as keyof Pqp.Rates)
          }
        >
          {visibleCategories.map(({ key, label }) => (
            <Segment.Item key={key} id={key}>
              <Segment.Separator />
              {label}
            </Segment.Item>
          ))}
        </Segment>
        {selectedRecord && (
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
                    value={selectedRecord.pqpRate}
                  />
                </KPI.Content>
                <KPI.Footer>Latest available rate</KPI.Footer>
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
                    value={selectedRecord.coePremium}
                  />
                </KPI.Content>
                <KPI.Footer>Latest COE premium</KPI.Footer>
              </KPI>
            </KPIGroup>

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

            <Alert status="accent">
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
      </div>
    </section>
  );
}
