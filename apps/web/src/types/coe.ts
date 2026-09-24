/** The COE history windows the results page and its queries accept. */
export const periods = ["12m", "5y", "10y", "ytd", "all"] as const;
export type Period = (typeof periods)[number];

export namespace Pqp {
  export type Rates = {
    "Category A": number;
    "Category B": number;
    "Category C": number;
    "Category D": number;
  };

  export interface TrendPoint {
    month: string;
    "Category A": number;
    "Category B": number;
    "Category C": number;
    "Category D": number;
  }

  export interface Comparison {
    category: string;
    latestPremium: number;
    pqpRate: number;
    difference: number;
    differencePercent: number;
  }

  export interface CategorySummary {
    category: string;
    coePremium: number;
    pqpRate: number;
    difference: number;
    differencePercent: number;
    pqpCost5Year: number;
    pqpCost10Year: number;
    savings5Year: number;
    savings10Year: number;
  }

  export interface TableRow extends Rates {
    key: string;
    month: string;
  }

  export interface Overview {
    latestMonth: string | null;
    tableRows: TableRow[];
    trendData: TrendPoint[];
    comparison: Comparison[];
    categorySummaries: CategorySummary[];
  }
}
