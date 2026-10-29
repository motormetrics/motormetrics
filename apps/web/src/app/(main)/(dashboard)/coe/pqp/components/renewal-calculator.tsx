"use client";

import { cn, Input } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  getFirstCoeExpiry,
  getParfRebate,
  getVehicleHistory,
  type RenewalCategory,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/renewal";
import { RenewalResults } from "@web/app/(main)/(dashboard)/coe/pqp/components/renewal-results";
import {
  type FuelType,
  getRoadTax,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/road-tax";
import { SectionHead } from "@web/components/shared/overview";
import type { Pqp } from "@web/types/coe";
import { format, isAfter, isValid, parseISO, startOfToday } from "date-fns";
import { Check } from "lucide-react";
import posthog from "posthog-js";
import { type ReactNode, useState } from "react";

const CATEGORIES: { id: RenewalCategory; label: string }[] = [
  { id: "Category A", label: "Cat A" },
  { id: "Category B", label: "Cat B" },
];

const FUELS: { id: FuelType; label: string }[] = [
  { id: "petrol", label: "Petrol" },
  { id: "hybrid", label: "Hybrid" },
  { id: "electric", label: "Electric" },
  { id: "diesel", label: "Diesel" },
];

/** The value of a native date input, as a date, or null while incomplete. */
const toDate = (value: string) => {
  const date = parseISO(value);
  return isValid(date) ? date : null;
};

/** "30,000" or "S$30,000" typed into a number field, as 30000. */
const toNumber = (value: string) => Number(value.replace(/[^0-9]/g, "")) || 0;

/** The small label above each field, matching the PARF calculator. */
function Field({
  children,
  className,
  htmlFor,
  label,
}: {
  children: ReactNode;
  className?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label className="font-semibold text-muted text-xs" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * The renew-or-deregister calculator. Everything the owner would otherwise be
 * asked — whether the COE was renewed, which PARF schedule applies — is worked
 * out from the two dates on the log card.
 */
export function RenewalCalculator({ rates }: { rates: Pqp.TrendPoint[] }) {
  const [category, setCategory] = useState<RenewalCategory>("Category A");
  const [registrationInput, setRegistrationInput] = useState("2016-12-10");
  const [expiryInput, setExpiryInput] = useState("2026-12-09");
  // Until the owner types their own, the expiry follows the registration date.
  const [expiryEdited, setExpiryEdited] = useState(false);
  const [arfInput, setArfInput] = useState("30,000");
  const [fuel, setFuel] = useState<FuelType>("petrol");
  const [ccInput, setCcInput] = useState("1,598");
  const [kwInput, setKwInput] = useState("100");

  const registration = toDate(registrationInput);
  const expiry = toDate(expiryInput);
  const datesValid =
    registration !== null && expiry !== null && isAfter(expiry, registration);

  const history =
    datesValid && registration && expiry
      ? getVehicleHistory(registration, expiry)
      : null;
  const rebate =
    datesValid && registration && expiry
      ? getParfRebate(registration, expiry, toNumber(arfInput))
      : null;
  const roadTaxInput = {
    engineCapacity: toNumber(ccInput),
    fuel,
    powerRating: toNumber(kwInput),
  };
  const roadTax = getRoadTax(roadTaxInput);

  // One event per field the owner changes, as the PARF calculator does.
  const track = (field: string) =>
    posthog.capture("renewal_calculator_used", {
      category,
      field,
      fuel,
      renewed_before: history?.renewedBefore ?? null,
    });

  const changeRegistration = (value: string) => {
    setRegistrationInput(value);
    const date = toDate(value);
    if (!expiryEdited && date) {
      setExpiryInput(format(getFirstCoeExpiry(date), "yyyy-MM-dd"));
    }
  };

  // A filled-in first COE already past its expiry was almost certainly renewed.
  const filledInPast =
    !expiryEdited && expiry !== null && isAfter(startOfToday(), expiry);
  const expiryHelp = filledInPast
    ? "This first COE has already expired. Enter the expiry date on your log card."
    : expiryEdited
      ? "Expiry from your log card."
      : "Pre-filled as the day before 10 years from registration. Change it if your COE was renewed.";

  const derived =
    history && rebate
      ? [
          `${history.ageAtExpiry} years old at expiry · ${
            history.mustDeregister
              ? "renewed for 5 years before"
              : history.renewedBefore
                ? "COE renewed before"
                : "first COE"
          }`,
          history.renewedBefore
            ? "PARF rebate already given up at the last renewal"
            : `PARF schedule ${rebate.newSchedule ? "after" : "before"} Budget 2026: ${Math.round(rebate.rate * 100)}% of ARF, ${
                Number.isFinite(rebate.cap)
                  ? `capped at ${formatCurrency(rebate.cap)}`
                  : "no cap"
              }`,
        ]
      : [];

  const taxHelp = `Road tax ${formatCurrency(roadTax.base)} a year today, before the age surcharge${
    roadTax.extra > 0
      ? `, plus ${formatCurrency(roadTax.extra)} ${fuel === "electric" ? "Additional Flat Component" : "diesel special tax"}`
      : ""
  }${fuel === "hybrid" ? ". Hybrids pay the higher of the engine and motor figures." : "."}`;

  return (
    <section
      aria-labelledby="renewal-calculator"
      className="flex flex-col gap-5"
    >
      <SectionHead
        caption="Estimates to compare, not a recommendation or financial advice"
        eyebrow="Renewal calculator"
        title={<span id="renewal-calculator">Renew or deregister?</span>}
      />
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
        <form
          aria-label="Your car"
          className="flex flex-col gap-5 lg:col-span-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <span className="text-muted text-sm">
            All on your vehicle log card
          </span>

          <Segment
            aria-label="COE category"
            className="max-md:w-full"
            onSelectionChange={(key) => {
              setCategory(key as RenewalCategory);
              track("category");
            }}
            selectedKey={category}
            size="md"
            variant="ghost"
          >
            {CATEGORIES.map(({ id, label }) => (
              <Segment.Item className="max-md:flex-1" id={id} key={id}>
                {label}
              </Segment.Item>
            ))}
          </Segment>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-3">
              <Field htmlFor="renewal-registration" label="Registration date">
                <Input
                  aria-describedby="renewal-dates"
                  id="renewal-registration"
                  onBlur={() => track("registration")}
                  max={format(startOfToday(), "yyyy-MM-dd")}
                  onChange={(event) => changeRegistration(event.target.value)}
                  type="date"
                  value={registrationInput}
                />
              </Field>
              <Field htmlFor="renewal-expiry" label="COE expiry date">
                <Input
                  aria-describedby="renewal-expiry-help renewal-dates"
                  aria-invalid={!datesValid}
                  id="renewal-expiry"
                  onBlur={() => track("expiry")}
                  onChange={(event) => {
                    setExpiryInput(event.target.value);
                    setExpiryEdited(true);
                  }}
                  type="date"
                  value={expiryInput}
                />
              </Field>
            </div>
            {datesValid ? (
              <>
                <span
                  className={cn(
                    "text-xs",
                    filledInPast ? "text-warning" : "text-muted",
                  )}
                  id="renewal-expiry-help"
                >
                  {expiryHelp}
                </span>
                <ul
                  aria-label="Worked out from your dates"
                  className="flex flex-col gap-1.5"
                  id="renewal-dates"
                >
                  {derived.map((fact) => (
                    <li
                      className="flex items-start gap-2 text-muted-strong text-sm"
                      key={fact}
                    >
                      <Check
                        aria-hidden
                        className="mt-1 size-3.5 shrink-0 text-accent"
                        strokeWidth={2.5}
                      />
                      {fact}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p
                className="text-danger text-sm"
                id="renewal-dates"
                role="alert"
              >
                The expiry date must be after the registration date.
              </p>
            )}
          </div>

          {history?.renewedBefore ? null : (
            <Field htmlFor="renewal-arf" label="ARF paid">
              <Input
                id="renewal-arf"
                onBlur={() => track("arf")}
                inputMode="numeric"
                onChange={(event) => setArfInput(event.target.value)}
                placeholder="e.g. 30,000"
                type="text"
                value={arfInput}
              />
            </Field>
          )}

          <div className="flex flex-col gap-3">
            <Segment
              aria-describedby="renewal-tax-help"
              aria-label="Fuel type"
              className="w-full"
              onSelectionChange={(key) => {
                setFuel(key as FuelType);
                track("fuel");
              }}
              selectedKey={fuel}
              size="md"
              variant="ghost"
            >
              {FUELS.map(({ id, label }) => (
                <Segment.Item className="flex-1 px-2" id={id} key={id}>
                  {label}
                </Segment.Item>
              ))}
            </Segment>
            <div className="grid grid-cols-2 gap-3">
              {fuel === "electric" ? null : (
                <Field htmlFor="renewal-cc" label="Engine capacity (cc)">
                  <Input
                    id="renewal-cc"
                    onBlur={() => track("engine_capacity")}
                    inputMode="numeric"
                    onChange={(event) => setCcInput(event.target.value)}
                    type="text"
                    value={ccInput}
                  />
                </Field>
              )}
              {fuel === "electric" || fuel === "hybrid" ? (
                <Field
                  htmlFor="renewal-kw"
                  label={
                    fuel === "hybrid" ? "Motor power (kW)" : "Power rating (kW)"
                  }
                >
                  <Input
                    id="renewal-kw"
                    onBlur={() => track("power_rating")}
                    inputMode="numeric"
                    onChange={(event) => setKwInput(event.target.value)}
                    type="text"
                    value={kwInput}
                  />
                </Field>
              ) : null}
            </div>
            <span className="text-muted text-xs" id="renewal-tax-help">
              {taxHelp}
            </span>
          </div>
        </form>
        <div className="min-w-0 lg:col-span-7">
          {history && rebate && expiry ? (
            <RenewalResults
              category={category}
              expiry={expiry}
              history={history}
              rates={rates}
              rebate={rebate}
              roadTax={roadTaxInput}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
