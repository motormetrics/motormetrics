import { Button, Card, Text } from "@heroui/react";
import { Mail } from "lucide-react";
import { cacheLife } from "next/cache";

export async function CtaSection() {
  "use cache";
  cacheLife("days");

  return (
    <section id="contact" className="scroll-mt-20 py-20 lg:py-28">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <Text type="body-sm" weight="medium">
              Get in Touch
            </Text>
            <Text type="h2">Ready to reach car enthusiasts?</Text>
            <Text type="body">
              Drop us an email to discuss how we can help promote your product
              to our audience.
            </Text>
          </div>

          {/* Contact card */}
          <Card className="w-full max-w-md border-border shadow-sm">
            <Card.Content className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-xl bg-accent/10 p-3">
                <Mail className="size-6 text-accent" />
              </div>
              <Text type="h4">Email Us</Text>
              <Text type="body-sm" color="muted">
                For enquiries, proposals, and custom packages
              </Text>
              <a
                href="mailto:advertise@motormetrics.app"
                className="mt-2 no-underline"
              >
                <Button variant="primary" className="rounded-full">
                  advertise@motormetrics.app
                </Button>
              </a>
            </Card.Content>
          </Card>
        </div>
      </div>
    </section>
  );
}
