import {
  AGE_BRACKETS,
  NEW_CAP,
  OLD_CAP,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import {
  getRoadTax,
  getSurchargeYears,
  type RoadTaxInput,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/road-tax";
import type { Pqp } from "@web/types/coe";
import {
  addDays,
  addMonths,
  addYears,
  differenceInYears,
  format,
  isAfter,
  subDays,
  subMonths,
} from "date-fns";

/** The categories /coe/pqp reports, and so the only ones the calculator prices. */
export type RenewalCategory = "Category A" | "Category B";

/** The two terms a COE can be renewed for. */
export type RenewalTerm = 5 | 10;

/**
 * Registrations after these dates hold a COE from the 2nd February bidding
 * exercise of that year or later. The registration date stands in for the
 * exercise, so a car registered just after one on an older COE is misread.
 */
const NEW_SCHEDULE_AFTER = new Date(2026, 1, 18);
const OLD_CAP_AFTER = new Date(2023, 1, 15);

/**
 * A first COE expires the day before the 10th anniversary of registration:
 * registered 10 Dec 2016, it expires 9 Dec 2026.
 */
export const getFirstCoeExpiry = (registration: Date) =>
  subDays(addYears(registration, 10), 1);

export interface VehicleHistory {
  /** Whole years from registration to the day after expiry. */
  ageAtExpiry: number;
  /** The COE has been renewed before, so the PARF rebate is already gone. */
  renewedBefore: boolean;
  /** The last renewal was for 5 years, which LTA does not allow to renew again. */
  mustDeregister: boolean;
}

/**
 * What the two dates on the log card say about the car. A first COE runs 10
 * years and each renewal adds 5 or 10, so a gap ending in 5 means the last
 * renewal was for 5 years.
 */
export const getVehicleHistory = (
  registration: Date,
  expiry: Date,
): VehicleHistory => {
  const ageAtExpiry = differenceInYears(addDays(expiry, 1), registration);
  const renewedBefore = ageAtExpiry > 10;

  return {
    ageAtExpiry,
    mustDeregister: renewedBefore && ageAtExpiry % 10 === 5,
    renewedBefore,
  };
};

export interface ParfRebate {
  amount: number;
  capped: boolean;
  /** Infinity for an old-schedule COE from before February 2023. */
  cap: number;
  newSchedule: boolean;
  /** The share of ARF paid back, 0 once past 10 years or renewed. */
  rate: number;
}

/**
 * The PARF rebate for deregistering at COE expiry, from the schedule either
 * side of Budget 2026. A renewed COE has already given it up.
 */
export const getParfRebate = (
  registration: Date,
  expiry: Date,
  arf: number,
): ParfRebate => {
  const newSchedule = isAfter(registration, NEW_SCHEDULE_AFTER);
  const cap = newSchedule
    ? NEW_CAP
    : isAfter(registration, OLD_CAP_AFTER)
      ? OLD_CAP
      : Number.POSITIVE_INFINITY;

  // Brackets run "5 years or younger" then one a year to "more than 9 to 10";
  // the first anniversary on or after expiry picks the bracket.
  const index = [5, 6, 7, 8, 9, 10].findIndex(
    (years) => !isAfter(expiry, addYears(registration, years)),
  );
  const bracket = AGE_BRACKETS[index === -1 ? AGE_BRACKETS.length - 1 : index];
  const rate = getVehicleHistory(registration, expiry).renewedBefore
    ? 0
    : newSchedule
      ? bracket.newRate
      : bracket.oldRate;

  const uncapped = arf * rate;
  return {
    amount: Math.min(uncapped, cap),
    cap,
    capped: uncapped > cap,
    newSchedule,
    rate,
  };
};

export interface ApplicablePqp {
  /** The expiry month, as YYYY-MM. */
  month: string;
  rate: number;
  /** LTA has not published the expiry month yet, so the latest rate stands in. */
  estimated: boolean;
}

/**
 * The PQP an owner pays when renewing in the expiry month. LTA publishes it in
 * the 3rd week of the month before; until then the latest month stands in.
 */
export const getApplicablePqp = (
  expiry: Date,
  category: RenewalCategory,
  rates: Pqp.TrendPoint[],
): ApplicablePqp | null => {
  const month = format(expiry, "yyyy-MM");
  const published = rates.find((point) => point.month === month);
  if (published) {
    return { estimated: false, month, rate: published[category] };
  }

  const latest = rates.reduce<Pqp.TrendPoint | undefined>(
    (found, point) => (!found || point.month > found.month ? point : found),
    undefined,
  );
  if (!latest || latest.month > month) {
    return null;
  }
  return { estimated: true, month, rate: latest[category] };
};

export interface RenewalWindows {
  /**
   * Renewing before the expiry month's PQP is out (the 3rd week of the month
   * before) pays this month's PQP, as YYYY-MM, and loses the unused COE days.
   */
  earlyPqpMonth: string;
  /** The last day to renew without a late fee. */
  expiry: Date;
  /** The last day to renew at all, with a S$50–250 late fee. */
  lateUntil: Date;
}

/** When renewing pays which PQP, and how long a late renewal is allowed. */
export const getRenewalWindows = (expiry: Date): RenewalWindows => ({
  earlyPqpMonth: format(subMonths(expiry, 1), "yyyy-MM"),
  expiry,
  lateUntil: addMonths(expiry, 1),
});

/** 10 years costs the full PQP; 5 years half, rounded up to the dollar. */
export const getRenewalPayment = (pqp: number, term: RenewalTerm) =>
  term === 10 ? pqp : Math.ceil(pqp / 2);

export interface RenewalCost {
  term: RenewalTerm;
  /** The PQP paid to renew. */
  payment: number;
  /** The PARF rebate given up by renewing instead of deregistering. */
  parfForgone: number;
  roadTax: number;
  roadTaxSurcharge: number;
  /** The electric car Additional Flat Component or diesel special tax. */
  roadTaxExtra: number;
  total: number;
  perYear: number;
  perMonth: number;
}

/**
 * The estimated cost of renewing for a term: the PQP, the PARF rebate given
 * up, and road tax with the age surcharge. Repairs are left out.
 */
export const getRenewalCost = ({
  ageAtExpiry,
  parfForgone,
  pqp,
  roadTax: roadTaxInput,
  term,
}: {
  ageAtExpiry: number;
  parfForgone: number;
  pqp: number;
  roadTax: RoadTaxInput;
  term: RenewalTerm;
}): RenewalCost => {
  const { base, extra } = getRoadTax(roadTaxInput);
  const payment = getRenewalPayment(pqp, term);
  const roadTax = base * term;
  const roadTaxSurcharge = base * getSurchargeYears(ageAtExpiry, term);
  const roadTaxExtra = extra * term;
  const total =
    payment + parfForgone + roadTax + roadTaxSurcharge + roadTaxExtra;

  return {
    parfForgone,
    payment,
    perMonth: total / (term * 12),
    perYear: total / term,
    roadTax,
    roadTaxExtra,
    roadTaxSurcharge,
    term,
    total,
  };
};
