interface Metric {
  label: string;
  count: number;
}

interface Data {
  period: string;
  total: number;
  fuelType: Metric[];
  vehicleType: Metric[];
}

export interface RegistrationStat {
  name: string;
  count: number;
}

export interface Registration {
  month: string;
  total: number;
  fuelType: RegistrationStat[];
  vehicleType: RegistrationStat[];
}

export interface Comparison {
  currentMonth: Data;
  previousMonth: Data;
  previousYear: Data;
}

export interface Make {
  make: string;
  count: number;
}

export interface FuelType {
  fuelType: string;
  total: number;
  makes: Make[];
}
