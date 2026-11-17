"use client";

import {
  Button,
  Calendar,
  cn,
  DateField,
  DatePicker,
  Description,
  Input,
  Label,
  Typography,
} from "@heroui/react";
import { RadioButtonGroup, Stepper } from "@heroui-pro/react";
import {
  type CalendarDate,
  getLocalTimeZone,
  parseDate,
  today,
} from "@internationalized/date";
import {
  getFirstCoeExpiry,
  getParfRebate,
  getVehicleHistory,
  type RenewalCategory,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/renewal";
import { RenewalResults } from "@web/app/(main)/(dashboard)/coe/pqp/components/renewal-results";
import type { FuelType } from "@web/app/(main)/(dashboard)/coe/pqp/components/road-tax";
import type { Pqp } from "@web/types/coe";
import { format, isAfter, isValid, parseISO, startOfToday } from "date-fns";
import posthog from "posthog-js";
import { type ReactNode, useState } from "react";
import { I18nProvider } from "react-aria-components";

const STEPS = ["Your COE", "Your car", "Your options"];

const CATEGORIES: {
  description: string;
  id: RenewalCategory;
  label: string;
}[] = [
  {
    description: "Up to 1,600cc and 130bhp, or electric up to 110kW",
    id: "Category A",
    label: "Category A",
  },
  {
    description: "Above 1,600cc or 130bhp, or electric above 110kW",
    id: "Category B",
    label: "Category B",
  },
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

/**
 * A date field with a calendar, holding its value as "yyyy-MM-dd" so the
 * calculator's date maths stays on date-fns.
 */
function DateInput({
  isInvalid,
  label,
  maxValue,
  onBlur,
  onChange,
  value,
}: {
  isInvalid?: boolean;
  label: string;
  maxValue?: CalendarDate;
  onBlur: () => void;
  onChange: (value: string) => void;
  value: string;
}) {
  const parsed = toDate(value) ? parseDate(value) : null;
  // Day first, as Singapore writes dates, whatever the browser's locale.
  return (
    <I18nProvider locale="en-SG">
      <DatePicker
        className="min-w-0"
        isInvalid={isInvalid}
        maxValue={maxValue}
        onBlur={onBlur}
        onChange={(date) => onChange(date ? date.toString() : "")}
        value={parsed}
      >
        <Label>{label}</Label>
        <DateField.Group fullWidth>
          <DateField.Input>
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <Calendar aria-label={label}>
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>
                {(date) => <Calendar.Cell date={date} />}
              </Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody>
                {({ year }) => <Calendar.YearPickerCell year={year} />}
              </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </I18nProvider>
  );
}

/** A text field with the same label as the date fields. */
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
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

/**
 * The renew-or-deregister calculator, in three steps: the COE, the car, then
 * the options. Every field is pre-filled, so the steps can be skipped to see
 * an answer first. Whether the COE was renewed and which PARF schedule
 * applies are worked out from the two dates on the log card.
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
  const [step, setStep] = useState(0);

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

  const results =
    history && rebate && expiry ? (
      <RenewalResults
        category={category}
        expiry={expiry}
        history={history}
        rates={rates}
        rebate={rebate}
        roadTax={roadTaxInput}
      />
    ) : (
      <Typography.Paragraph color="muted">
        Check the dates in the first step to see your options.
      </Typography.Paragraph>
    );

  const goTo = (next: number) => {
    setStep(next);
    track(`step_${next + 1}`);
  };

  return (
    <section
      aria-labelledby="renewal-calculator"
      className="flex max-w-3xl flex-col gap-8"
    >
      <Stepper currentStep={step} onStepChange={goTo}>
        {STEPS.map((title) => (
          <Stepper.Step key={title}>
            <Stepper.Indicator />
            <Stepper.Content>
              <Stepper.Title>{title}</Stepper.Title>
            </Stepper.Content>
            <Stepper.Separator />
          </Stepper.Step>
        ))}
      </Stepper>

      {step === 0 ? (
        <div className="flex flex-col gap-6">
          <RadioButtonGroup
            layout="grid"
            className="grid-cols-1 sm:grid-cols-2"
            name="renewal-category"
            onChange={(value) => {
              setCategory(value as RenewalCategory);
              track("category");
            }}
            value={category}
          >
            <Label className="col-span-full">COE category</Label>
            {CATEGORIES.map(({ description, id, label }) => (
              <RadioButtonGroup.Item key={id} value={id}>
                <RadioButtonGroup.Indicator />
                <RadioButtonGroup.ItemContent>
                  <Label>{label}</Label>
                  <Description>{description}</Description>
                </RadioButtonGroup.ItemContent>
              </RadioButtonGroup.Item>
            ))}
          </RadioButtonGroup>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DateInput
                label="Registration date"
                maxValue={today(getLocalTimeZone())}
                onBlur={() => track("registration")}
                onChange={changeRegistration}
                value={registrationInput}
              />
              <DateInput
                isInvalid={!datesValid}
                label="COE expiry date"
                onBlur={() => track("expiry")}
                onChange={(value) => {
                  setExpiryInput(value);
                  setExpiryEdited(true);
                }}
                value={expiryInput}
              />
            </div>
            {datesValid ? (
              <span
                className={cn(
                  "text-xs",
                  filledInPast ? "text-warning" : "text-muted",
                )}
              >
                {expiryHelp}
              </span>
            ) : (
              <p className="text-danger text-sm" role="alert">
                The expiry date must be after the registration date.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-6">
          <RadioButtonGroup
            layout="grid"
            className="grid-cols-2 sm:grid-cols-4"
            name="renewal-fuel"
            onChange={(value) => {
              setFuel(value as FuelType);
              track("fuel");
            }}
            value={fuel}
          >
            <Label className="col-span-full">Fuel type</Label>
            {FUELS.map(({ id, label }) => (
              <RadioButtonGroup.Item key={id} value={id}>
                <RadioButtonGroup.Indicator />
                <RadioButtonGroup.ItemContent>
                  <Label>{label}</Label>
                </RadioButtonGroup.ItemContent>
              </RadioButtonGroup.Item>
            ))}
          </RadioButtonGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {history?.renewedBefore ? null : (
              <Field htmlFor="renewal-arf" label="ARF paid">
                <Input
                  id="renewal-arf"
                  inputMode="numeric"
                  onBlur={() => track("arf")}
                  onChange={(event) => setArfInput(event.target.value)}
                  placeholder="e.g. 30,000"
                  type="text"
                  value={arfInput}
                />
              </Field>
            )}
            {fuel === "electric" ? null : (
              <Field htmlFor="renewal-cc" label="Engine capacity (cc)">
                <Input
                  id="renewal-cc"
                  inputMode="numeric"
                  onBlur={() => track("engine_capacity")}
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
                  inputMode="numeric"
                  onBlur={() => track("power_rating")}
                  onChange={(event) => setKwInput(event.target.value)}
                  type="text"
                  value={kwInput}
                />
              </Field>
            ) : null}
          </div>
          <span className="text-muted text-xs">
            All on your vehicle log card.
          </span>
        </div>
      ) : null}

      {step === 2 ? <div aria-live="polite">{results}</div> : null}

      <div className="flex items-center justify-between gap-4">
        {step > 0 ? (
          <Button onPress={() => goTo(step - 1)} variant="tertiary">
            Back
          </Button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <Button
            isDisabled={step === 0 && !datesValid}
            onPress={() => goTo(step + 1)}
          >
            {step === STEPS.length - 2 ? "See your options" : "Next"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
