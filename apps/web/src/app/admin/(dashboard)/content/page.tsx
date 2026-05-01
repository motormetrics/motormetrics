import { Card } from "@heroui/react";
import { FileText, MessageSquare } from "lucide-react";
import Link from "next/link";

const Page = () => (
  <div className="flex flex-col gap-6">
    <div>
      <h1 className="font-bold text-3xl tracking-tight">Content Management</h1>
      <p className="text-muted">
        Manage website content, announcements, and user-facing information.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Link href="/content/announcements" className="group">
        <Card className="h-full transition-colors hover:bg-surface-secondary/50">
          <Card.Header>
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5 text-primary" />
              <Card.Title className="text-lg">Announcements</Card.Title>
            </div>
            <Card.Description>
              Manage site-wide announcements displayed to users
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <p className="text-muted text-sm">
              Create, edit, and schedule announcements that appear on the main
              website.
            </p>
          </Card.Content>
        </Card>
      </Link>

      <Link href="/admin/content/blog" className="group">
        <Card className="h-full transition-colors hover:bg-surface-secondary/50">
          <Card.Header>
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <Card.Title className="text-lg">Blog Posts</Card.Title>
            </div>
            <Card.Description>
              Manage blog content and articles
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <p className="text-muted text-sm">
              Create, view, and regenerate blog posts from market data.
            </p>
          </Card.Content>
        </Card>
      </Link>

      <Card className="h-full opacity-50">
        <Card.Header>
          <Card.Title className="text-lg">Banners</Card.Title>
          <Card.Description>Coming soon</Card.Description>
        </Card.Header>
        <Card.Content>
          <p className="text-muted text-sm">
            Manage promotional banners and notices.
          </p>
        </Card.Content>
      </Card>
    </div>
  </div>
);

export default Page;
