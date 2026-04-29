"use client";

import { Accordion, AccordionItem } from "@heroui/accordion";
import { Alert } from "@heroui/alert";
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
} from "@heroui/autocomplete";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from "@heroui/drawer";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { useDisclosure } from "@heroui/modal";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Progress } from "@heroui/progress";
import { Select, SelectItem } from "@heroui/select";
import { Skeleton } from "@heroui/skeleton";
import { Tab, Tabs } from "@heroui/tabs";
import { addToast } from "@heroui/toast";
import { Tooltip } from "@heroui/tooltip";
import { useState } from "react";

// === DATA ===
const typographyScale = [
  { name: "H1", class: "text-4xl font-semibold", size: "36px" },
  { name: "H2", class: "text-3xl font-semibold", size: "30px" },
  { name: "H3", class: "text-2xl font-medium", size: "24px" },
  { name: "H4", class: "text-xl font-medium", size: "20px" },
  { name: "Body", class: "text-base", size: "16px" },
  { name: "Small", class: "text-sm", size: "14px" },
  { name: "XSmall", class: "text-xs", size: "12px" },
];

const spacingScale = [
  { name: "gap-2", value: "8px", width: 32 },
  { name: "gap-4", value: "16px", width: 64 },
  { name: "gap-6", value: "24px", width: 96 },
  { name: "gap-8", value: "32px", width: 128 },
  { name: "gap-12", value: "48px", width: 192 },
];

const brandColors = [
  {
    name: "Primary",
    token: "primary",
    hex: "#191970",
    usage: "Headers, buttons, key accents",
  },
  {
    name: "Secondary",
    token: "secondary",
    hex: "#708090",
    usage: "Cards, borders, secondary buttons",
  },
  {
    name: "Success",
    token: "success",
    hex: "#22C55E",
    usage: "Positive trends, gains",
  },
  {
    name: "Warning",
    token: "warning",
    hex: "#F59E0B",
    usage: "Caution, alerts",
  },
  { name: "Danger", token: "danger", hex: "#DC2626", usage: "Errors, losses" },
];

const chartColors = [
  {
    name: "Chart 1",
    variable: "--chart-1",
    description: "Primary/top ranking",
  },
  { name: "Chart 2", variable: "--chart-2", description: "Second ranking" },
  { name: "Chart 3", variable: "--chart-3", description: "Third ranking" },
  { name: "Chart 4", variable: "--chart-4", description: "Fourth ranking" },
  { name: "Chart 5", variable: "--chart-5", description: "Fifth ranking" },
  { name: "Chart 6", variable: "--chart-6", description: "Sixth ranking" },
];

const defaultScale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const carMakes = [
  { key: "toyota", label: "Toyota" },
  { key: "honda", label: "Honda" },
  { key: "bmw", label: "BMW" },
  { key: "mercedes", label: "Mercedes-Benz" },
  { key: "audi", label: "Audi" },
];

const coeCategories = [
  { key: "A", label: "Category A - Cars up to 1600cc" },
  { key: "B", label: "Category B - Cars above 1600cc" },
  { key: "C", label: "Category C - Goods Vehicles" },
  { key: "D", label: "Category D - Motorcycles" },
  { key: "E", label: "Category E - Open Category" },
];

export default function ComponentsPreviewPage() {
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const drawerDisclosure = useDisclosure();

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-3xl text-foreground">Design System</h1>
        <p className="text-default-600">
          Navy Blue theme and HeroUI v2 components - design token driven preview
        </p>
      </div>

      {/* Tabbed Navigation */}
      <Tabs
        defaultSelectedKey="colors"
        classNames={{
          tabList: "sticky top-0 z-40 bg-background/80 backdrop-blur-sm",
        }}
      >
        {/* === COLORS TAB === */}
        <Tab key="colors" title="Colors">
          <div className="flex flex-col gap-6 pt-4">
            <h2 className="font-semibold text-2xl">Colors</h2>

            {/* Brand Colors */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Brand Colors</p>
                  <p className="text-default-500 text-sm">
                    Semantic colors from theme configuration
                  </p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-6">
                  {brandColors.map((color) => (
                    <div key={color.name} className="flex items-center gap-3">
                      <div className={`size-12 rounded-lg bg-${color.token}`} />
                      <div>
                        <p className="font-medium text-sm">{color.name}</p>
                        <p className="text-default-500 text-xs">{color.hex}</p>
                        <p className="text-default-400 text-xs">
                          {color.usage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Chart Colors */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Chart Colors</p>
                  <p className="text-default-500 text-sm">
                    Navy Blue gradient for data visualization
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-4">
                  {chartColors.map((color, _index) => (
                    <div key={color.name} className="flex items-center gap-3">
                      <div
                        className="size-10 rounded-lg"
                        style={{ backgroundColor: `var(${color.variable})` }}
                      />
                      <div>
                        <p className="font-medium text-sm">{color.name}</p>
                        <code className="text-default-500 text-xs">
                          {color.variable}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Default Scale */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Default Scale</p>
                  <p className="text-default-500 text-sm">
                    Neutral color scale for UI elements
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {defaultScale.map((shade) => (
                    <div
                      key={shade}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={`size-10 rounded-lg bg-default-${shade}`}
                      />
                      <code className="text-default-500 text-xs">{shade}</code>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* === TYPOGRAPHY TAB === */}
        <Tab key="typography" title="Typography">
          <div className="flex flex-col gap-6 pt-4">
            <h2 className="font-semibold text-2xl">Typography</h2>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Type Scale</p>
                  <p className="text-default-500 text-sm">Font: Geist Sans</p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                {typographyScale.map((type) => (
                  <div key={type.name} className="flex items-center gap-4">
                    <code className="w-16 rounded bg-default-100 px-2 py-1 text-center text-xs">
                      {type.name}
                    </code>
                    <span className={type.class}>The quick brown fox</span>
                    <span className="text-default-400 text-xs">
                      {type.size}
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* === SPACING TAB === */}
        <Tab key="spacing" title="Spacing">
          <div className="flex flex-col gap-6 pt-4">
            <h2 className="font-semibold text-2xl">Spacing</h2>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Spacing Scale</p>
                  <p className="text-default-500 text-sm">
                    Use gap utilities with even numbers
                  </p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                {/* Rules */}
                <Alert color="primary">
                  <div className="flex flex-col gap-1 text-sm">
                    <p>
                      ✓ Use <code>gap-*</code> with even numbers
                    </p>
                    <p>
                      ✗ Avoid <code>space-y-*</code>
                    </p>
                    <p>
                      ✗ Never use <code>margin-top</code>
                    </p>
                  </div>
                </Alert>

                {/* Scale visualization */}
                <div className="flex flex-col gap-4">
                  {spacingScale.map((space) => (
                    <div key={space.name} className="flex items-center gap-4">
                      <code className="w-20 rounded bg-default-100 px-2 py-1 text-center text-xs">
                        {space.name}
                      </code>
                      <div
                        className="h-4 rounded bg-primary"
                        style={{ width: space.width }}
                      />
                      <span className="text-default-400 text-xs">
                        {space.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* === COMPONENTS TAB === */}
        <Tab key="components" title="Components">
          <div className="flex flex-col gap-8 pt-4">
            <h2 className="font-semibold text-2xl">Components</h2>

            {/* Buttons */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Buttons</p>
                  <p className="text-default-500 text-sm">
                    Colors, variants, and sizes
                  </p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-6">
                {/* Colors */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Colors</p>
                  <div className="flex flex-wrap gap-2">
                    <Button color="default">Default</Button>
                    <Button color="primary">Primary</Button>
                    <Button color="secondary">Secondary</Button>
                    <Button color="success">Success</Button>
                    <Button color="warning">Warning</Button>
                    <Button color="danger">Danger</Button>
                  </div>
                </div>

                {/* Variants */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Variants</p>
                  <div className="flex flex-wrap gap-2">
                    <Button color="primary" variant="solid">
                      Solid
                    </Button>
                    <Button color="primary" variant="bordered">
                      Bordered
                    </Button>
                    <Button color="primary" variant="light">
                      Light
                    </Button>
                    <Button color="primary" variant="flat">
                      Flat
                    </Button>
                    <Button color="primary" variant="faded">
                      Faded
                    </Button>
                    <Button color="primary" variant="shadow">
                      Shadow
                    </Button>
                    <Button color="primary" variant="ghost">
                      Ghost
                    </Button>
                  </div>
                </div>

                {/* Sizes */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Sizes</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button color="primary" size="sm">
                      Small
                    </Button>
                    <Button color="primary" size="md">
                      Medium
                    </Button>
                    <Button color="primary" size="lg">
                      Large
                    </Button>
                  </div>
                </div>

                {/* States */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">States</p>
                  <div className="flex flex-wrap gap-2">
                    <Button color="primary" isDisabled>
                      Disabled
                    </Button>
                    <Button color="primary" isLoading>
                      Loading
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Chips */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Chips</p>
                  <p className="text-default-500 text-sm">
                    Status indicators and labels
                  </p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                {/* Colors */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Colors</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip color="default">Default</Chip>
                    <Chip color="primary">Primary</Chip>
                    <Chip color="secondary">Secondary</Chip>
                    <Chip color="success">+5.2%</Chip>
                    <Chip color="warning">Warning</Chip>
                    <Chip color="danger">-2.1%</Chip>
                  </div>
                </div>

                {/* Variants */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Variants</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip color="primary" variant="solid">
                      Solid
                    </Chip>
                    <Chip color="primary" variant="bordered">
                      Bordered
                    </Chip>
                    <Chip color="primary" variant="light">
                      Light
                    </Chip>
                    <Chip color="primary" variant="flat">
                      Flat
                    </Chip>
                    <Chip color="primary" variant="faded">
                      Faded
                    </Chip>
                    <Chip color="primary" variant="shadow">
                      Shadow
                    </Chip>
                    <Chip color="primary" variant="dot">
                      Dot
                    </Chip>
                  </div>
                </div>

                {/* Sizes */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Sizes</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip color="primary" size="sm">
                      Small
                    </Chip>
                    <Chip color="primary" size="md">
                      Medium
                    </Chip>
                    <Chip color="primary" size="lg">
                      Large
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Avatars */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Avatars</p>
                  <p className="text-default-500 text-sm">
                    User profile images with fallback
                  </p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                {/* Sizes */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Sizes</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar size="sm" name="SM" />
                    <Avatar size="md" name="MD" />
                    <Avatar size="lg" name="LG" />
                  </div>
                </div>

                {/* Colors */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Colors</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar color="default" name="DF" />
                    <Avatar color="primary" name="PR" />
                    <Avatar color="secondary" name="SE" />
                    <Avatar color="success" name="SU" />
                    <Avatar color="warning" name="WA" />
                    <Avatar color="danger" name="DA" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Alerts</p>
                  <p className="text-default-500 text-sm">
                    Status messages and notifications
                  </p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <Alert color="default" title="Default Alert">
                  This is a neutral informational message.
                </Alert>
                <Alert color="primary" title="Primary Alert">
                  Highlighted information for the user.
                </Alert>
                <Alert color="success" title="Success">
                  Operation completed successfully.
                </Alert>
                <Alert color="warning" title="Warning">
                  Market volatility is higher than usual.
                </Alert>
                <Alert color="danger" title="Error">
                  Failed to fetch data. Please try again.
                </Alert>
              </CardBody>
            </Card>

            {/* Form Controls */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Form Controls</p>
                  <p className="text-default-500 text-sm">
                    Input fields, selects, and autocomplete
                  </p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-6">
                {/* Input variants */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Input Variants</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Flat"
                      placeholder="Enter value"
                      variant="flat"
                      value={inputValue}
                      onValueChange={setInputValue}
                    />
                    <Input
                      label="Bordered"
                      placeholder="Enter value"
                      variant="bordered"
                    />
                    <Input
                      label="Underlined"
                      placeholder="Enter value"
                      variant="underlined"
                    />
                    <Input
                      label="Faded"
                      placeholder="Enter value"
                      variant="faded"
                    />
                  </div>
                </div>

                {/* Select */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Select</p>
                  <Select
                    label="COE Category"
                    placeholder="Select a category"
                    selectedKeys={selectedMake ? [selectedMake] : []}
                    onSelectionChange={(keys) =>
                      setSelectedMake(Array.from(keys)[0] as string)
                    }
                  >
                    {coeCategories.map((cat) => (
                      <SelectItem key={cat.key}>{cat.label}</SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Autocomplete */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Autocomplete</p>
                  <Autocomplete
                    label="Car Make"
                    placeholder="Search for a make"
                  >
                    <AutocompleteSection title="Popular Makes">
                      {carMakes.map((make) => (
                        <AutocompleteItem key={make.key}>
                          {make.label}
                        </AutocompleteItem>
                      ))}
                    </AutocompleteSection>
                  </Autocomplete>
                </div>
              </CardBody>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Progress</p>
                  <p className="text-default-500 text-sm">
                    Progress bars and indicators
                  </p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                {/* Colors */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Colors</p>
                  <div className="flex flex-col gap-3">
                    <Progress color="default" value={60} />
                    <Progress color="primary" value={60} />
                    <Progress color="secondary" value={60} />
                    <Progress color="success" value={60} />
                    <Progress color="warning" value={60} />
                    <Progress color="danger" value={60} />
                  </div>
                </div>

                {/* Sizes */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Sizes</p>
                  <div className="flex flex-col gap-3">
                    <Progress color="primary" size="sm" value={60} />
                    <Progress color="primary" size="md" value={60} />
                    <Progress color="primary" size="lg" value={60} />
                  </div>
                </div>

                {/* Indeterminate */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Indeterminate</p>
                  <Progress color="primary" isIndeterminate />
                </div>
              </CardBody>
            </Card>

            {/* Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Skeleton</p>
                  <p className="text-default-500 text-sm">
                    Loading placeholders
                  </p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full rounded-lg" />
              </CardBody>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Links</p>
                  <p className="text-default-500 text-sm">
                    Navigation and anchor elements
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap items-center gap-6">
                  <Link href="#" underline="hover">
                    Hover underline
                  </Link>
                  <Link href="#" underline="always">
                    Always underline
                  </Link>
                  <Link href="#" underline="none">
                    No underline
                  </Link>
                  <Link href="#" isDisabled>
                    Disabled
                  </Link>
                  <Link href="#" isExternal>
                    External link
                  </Link>
                </div>
              </CardBody>
            </Card>

            {/* Divider */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Divider</p>
                  <p className="text-default-500 text-sm">Visual separators</p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <p className="text-sm">Content above</p>
                  <Divider />
                  <p className="text-sm">Content below</p>
                </div>
                <div className="flex h-8 items-center gap-4">
                  <span className="text-sm">Item 1</span>
                  <Divider orientation="vertical" />
                  <span className="text-sm">Item 2</span>
                  <Divider orientation="vertical" />
                  <span className="text-sm">Item 3</span>
                </div>
              </CardBody>
            </Card>

            {/* Tooltip */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Tooltip</p>
                  <p className="text-default-500 text-sm">
                    Helpful hints on hover
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-4">
                  <Tooltip content="Default tooltip">
                    <Button variant="bordered">Hover me</Button>
                  </Tooltip>
                  <Tooltip content="Top placement" placement="top">
                    <Button variant="bordered">Top</Button>
                  </Tooltip>
                  <Tooltip content="Bottom placement" placement="bottom">
                    <Button variant="bordered">Bottom</Button>
                  </Tooltip>
                </div>
              </CardBody>
            </Card>

            {/* Popover */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Popover</p>
                  <p className="text-default-500 text-sm">
                    Rich content overlays
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <Popover placement="bottom">
                  <PopoverTrigger>
                    <Button variant="bordered">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="flex flex-col gap-2 p-4">
                      <p className="font-medium">COE Details</p>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex justify-between gap-8">
                          <span className="text-default-500">Category</span>
                          <span>A</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="text-default-500">Premium</span>
                          <span>$106,000</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="text-default-500">Quota</span>
                          <span>1,234</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardBody>
            </Card>

            {/* Drawer */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Drawer</p>
                  <p className="text-default-500 text-sm">Slide-out panels</p>
                </div>
              </CardHeader>
              <CardBody>
                <Button variant="bordered" onPress={drawerDisclosure.onOpen}>
                  Open Drawer
                </Button>
                <Drawer
                  isOpen={drawerDisclosure.isOpen}
                  onOpenChange={drawerDisclosure.onOpenChange}
                  placement="right"
                >
                  <DrawerContent>
                    <DrawerHeader>Drawer Title</DrawerHeader>
                    <DrawerBody>
                      <p className="text-default-600">
                        This is a drawer panel that slides in from the side.
                      </p>
                    </DrawerBody>
                  </DrawerContent>
                </Drawer>
              </CardBody>
            </Card>

            {/* Accordion */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Accordion</p>
                  <p className="text-default-500 text-sm">
                    Collapsible content sections
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <Accordion>
                  <AccordionItem key="1" title="Category A">
                    <p className="text-default-600 text-sm">
                      Cars up to 1600cc and 97kW. Most popular category for
                      small cars.
                    </p>
                  </AccordionItem>
                  <AccordionItem key="2" title="Category B">
                    <p className="text-default-600 text-sm">
                      Cars above 1600cc or 97kW. For larger vehicles and luxury
                      cars.
                    </p>
                  </AccordionItem>
                  <AccordionItem key="3" title="Category E">
                    <p className="text-default-600 text-sm">
                      Open category - can be used for any vehicle type.
                    </p>
                  </AccordionItem>
                </Accordion>
              </CardBody>
            </Card>

            {/* Tabs (nested demo) */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Tabs</p>
                  <p className="text-default-500 text-sm">Tab variants</p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                {/* Variants */}
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Solid</p>
                  <Tabs variant="solid" color="primary">
                    <Tab key="cars" title="Cars" />
                    <Tab key="coe" title="COE" />
                    <Tab key="deregistrations" title="Deregistrations" />
                  </Tabs>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Bordered</p>
                  <Tabs variant="bordered" color="primary">
                    <Tab key="cars" title="Cars" />
                    <Tab key="coe" title="COE" />
                    <Tab key="deregistrations" title="Deregistrations" />
                  </Tabs>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Light</p>
                  <Tabs variant="light" color="primary">
                    <Tab key="cars" title="Cars" />
                    <Tab key="coe" title="COE" />
                    <Tab key="deregistrations" title="Deregistrations" />
                  </Tabs>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm">Underlined</p>
                  <Tabs variant="underlined" color="primary">
                    <Tab key="cars" title="Cars" />
                    <Tab key="coe" title="COE" />
                    <Tab key="deregistrations" title="Deregistrations" />
                  </Tabs>
                </div>
              </CardBody>
            </Card>

            {/* Toast */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Toast</p>
                  <p className="text-default-500 text-sm">
                    Notification messages
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  <Button
                    color="default"
                    onPress={() =>
                      addToast({
                        title: "Default",
                        description: "This is a default toast",
                      })
                    }
                  >
                    Default Toast
                  </Button>
                  <Button
                    color="success"
                    onPress={() =>
                      addToast({
                        title: "Success",
                        description: "Operation completed successfully",
                        color: "success",
                      })
                    }
                  >
                    Success Toast
                  </Button>
                  <Button
                    color="warning"
                    onPress={() =>
                      addToast({
                        title: "Warning",
                        description: "Please review before proceeding",
                        color: "warning",
                      })
                    }
                  >
                    Warning Toast
                  </Button>
                  <Button
                    color="danger"
                    onPress={() =>
                      addToast({
                        title: "Error",
                        description: "Something went wrong",
                        color: "danger",
                      })
                    }
                  >
                    Danger Toast
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Card Examples */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Card Examples</p>
                  <p className="text-default-500 text-sm">Card compositions</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Basic Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">Basic Card</p>
                        <p className="text-default-500 text-sm">Simple card</p>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button size="sm" color="primary">
                        Action
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Metric Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col gap-1">
                        <p className="text-default-500 text-sm">COE Premium</p>
                        <p className="font-bold text-2xl">$106,000</p>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Chip color="success" size="sm">
                        +2.5%
                      </Chip>
                    </CardFooter>
                  </Card>

                  {/* Pressable Card */}
                  <Card isPressable>
                    <CardHeader>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">Pressable Card</p>
                        <p className="text-default-500 text-sm">Click me</p>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-default-600 text-sm">
                        This card is interactive
                      </p>
                    </CardBody>
                  </Card>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
