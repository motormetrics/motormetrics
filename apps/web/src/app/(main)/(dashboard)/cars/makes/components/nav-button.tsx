import { Button, type ButtonProps } from "@heroui/react";
import Form from "next/form";

/**
 * A button that opens `action` with the query `serialize(values)` builds,
 * through a GET form. The makes index uses it for the detail panel's `?make=`
 * and `?compare=` views and the comparison picks: readers get an ordinary
 * client-side navigation, while the URLs never appear as links in the HTML
 * for a crawler to walk.
 *
 * `serialize` is the route's nuqs serializer, so the hidden fields carry
 * exactly what a link built with it would: defaults dropped, arrays repeated.
 * The form is `display: contents`, so the button lays out as if it stood
 * alone in its row.
 */
export function NavButton<Values>({
  action,
  scroll,
  serialize,
  values,
  ...props
}: Omit<ButtonProps, "onPress" | "type"> & {
  /** The route to open, without a query. */
  action: string;
  scroll?: boolean;
  /** The route's nuqs serializer; `Values` is inferred from `values` alone. */
  serialize: (values: NoInfer<Values>) => string;
  values: Values;
}) {
  return (
    <Form action={action} className="contents" scroll={scroll}>
      {[...new URLSearchParams(serialize(values))].map(([name, value]) => (
        <input
          key={`${name}=${value}`}
          name={name}
          type="hidden"
          value={value}
        />
      ))}
      <Button {...props} type="submit" />
    </Form>
  );
}
