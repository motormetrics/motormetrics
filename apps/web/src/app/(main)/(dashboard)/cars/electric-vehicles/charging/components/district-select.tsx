"use client";

import {
  ComboBox,
  Header,
  Input,
  Label,
  ListBox,
  Separator,
} from "@heroui/react";
import {
  POSTAL_DISTRICTS,
  type PostalRegion,
} from "@web/config/postal-districts";
import { MapPin } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";

const ALL_SINGAPORE = "all";
const REGION_ORDER: PostalRegion[] = [
  "Central",
  "East",
  "North-East",
  "North",
  "West",
];

/** District filter shared by every list on the charging page. */
export function DistrictSelect({ district }: { district: string }) {
  const [, setDistrict] = useQueryState(
    "district",
    parseAsString.withDefault("").withOptions({ shallow: false }),
  );

  return (
    <ComboBox
      selectedKey={district || ALL_SINGAPORE}
      onSelectionChange={(key) => {
        const value = key === ALL_SINGAPORE || key == null ? "" : String(key);
        posthog.capture("dashboard_filter_changed", {
          filter: "district",
          value: value || ALL_SINGAPORE,
        });
        setDistrict(value);
      }}
    >
      <Label className="sr-only">District</Label>
      <ComboBox.InputGroup className="relative">
        <MapPin
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted"
        />
        <Input className="pl-10" placeholder="All Singapore" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id={ALL_SINGAPORE} textValue="All Singapore">
            All Singapore
            <ListBox.ItemIndicator />
          </ListBox.Item>
          {REGION_ORDER.map((region) => (
            <ListBox.Section key={region}>
              <Separator />
              <Header>{region}</Header>
              {POSTAL_DISTRICTS.filter((item) => item.region === region).map(
                (item) => (
                  <ListBox.Item
                    id={item.slug}
                    key={item.slug}
                    textValue={item.name}
                  >
                    {item.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ),
              )}
            </ListBox.Section>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
