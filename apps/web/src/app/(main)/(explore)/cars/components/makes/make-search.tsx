"use client";

import { ComboBox, Input, Label, ListBox } from "@heroui/react";

import { slugify } from "@motormetrics/utils";
import type { Make } from "@web/types";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import type { Key } from "react";

interface MakeSearchProps {
  makes: Make[];
}

export function MakeSearch({ makes }: MakeSearchProps) {
  const router = useRouter();

  const handleSelectionChange = (key: Key | null) => {
    if (key) {
      posthog.capture("car_make_searched", { make: key as string });
      router.push(`/cars/makes/${slugify(key as string)}`);
    }
  };

  return (
    <ComboBox onSelectionChange={handleSelectionChange}>
      <Label className="sr-only">Search make</Label>
      <ComboBox.InputGroup>
        <Search className="ml-3 size-4 text-muted" />
        <Input placeholder="Search make..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {makes.map((make) => {
            return (
              <ListBox.Item key={make} id={make} textValue={make}>
                {make}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            );
          })}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
