import { Card } from "@heroui/react";
import { AnnouncementForm } from "@web/app/admin/components/announcement-form";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/content"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Content Management
        </Link>
      </div>

      <div>
        <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight">
          <MessageSquare className="size-8" />
          Announcements
        </h1>
        <p className="text-muted-foreground">
          Manage site-wide announcements that appear at the top of the website.
        </p>
      </div>

      <AnnouncementForm />

      {/* Instructions */}
      <Card>
        <Card.Header>
          <Card.Title>Instructions</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4 text-muted-foreground text-sm">
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">1.</span>
            <span>
              Toggle the announcement on or off using the Enable/Disable button.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">2.</span>
            <span>Enter your announcement text in the input field.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">3.</span>
            <span>Preview how it will look on the website before saving.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">4.</span>
            <span>
              Click &quot;Save Changes&quot; to apply the announcement to the
              live website.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">Note:</span>
            <span>
              Changes may take a few minutes to appear on the website due to
              caching.
            </span>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
