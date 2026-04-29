import { formatCurrency } from "@motormetrics/utils";

interface CurrencyProps {
  value: number;
}

export function Currency({ value }: CurrencyProps) {
  return <span>{formatCurrency(value)}</span>;
}
