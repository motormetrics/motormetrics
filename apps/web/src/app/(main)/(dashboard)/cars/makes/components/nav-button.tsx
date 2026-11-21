import { Button, type ButtonProps } from "@heroui/react";
import Form from "next/form";

/**
 * A button that opens `href` through a GET form. The makes index uses it for
 * the detail panel's `?make=` and `?compare=` views and the comparison picks:
 * readers get an ordinary client-side navigation, while the URLs never appear
 * as links in the HTML for a crawler to walk.
 *
 * The form is `display: contents`, so the button lays out as if it stood
 * alone in its row.
 */
export function NavButton({
  href,
  scroll,
  ...props
}: Omit<ButtonProps, "onPress" | "type"> & {
  href: string;
  scroll?: boolean;
}) {
  const [action, query] = href.split("?");

  return (
    <Form action={action} className="contents" scroll={scroll}>
      {[...new URLSearchParams(query)].map(([name, value]) => (
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
