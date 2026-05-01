import { Card } from "@heroui/react";
import { getMaintenanceConfig } from "@web/app/admin/actions/maintenance";
import { MaintenanceForm } from "@web/app/admin/components/maintenance-form";
import { ArrowLeft, Wrench } from "lucide-react";
import Link from "next/link";

export default async function MaintenancePage() {
  const config = await getMaintenanceConfig();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 text-default-500 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Settings
        </Link>
      </div>

      <div>
        <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight">
          <Wrench className="size-8" />
          Maintenance Mode
        </h1>
        <p className="text-default-500">
          Configure maintenance mode settings to temporarily disable services
          during updates and repairs.
        </p>
      </div>

      <MaintenanceForm initialConfig={config} />

      {/* Instructions */}
      <Card>
        <Card.Header>
          <Card.Title>Instructions & Important Notes</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4 text-default-500 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">⚠️</span>
            <span>
              <strong>Immediate Effect:</strong> Changes take effect within 30
              seconds via Edge Config synchronization.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">🌐</span>
            <span>
              <strong>Website Maintenance:</strong> Redirects all web pages to a
              maintenance page with your custom message.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">🔌</span>
            <span>
              <strong>API Status:</strong> The API remains operational during
              web maintenance mode for external clients.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">🔄</span>
            <span>
              <strong>Auto-Refresh:</strong> Users on the maintenance page are
              automatically redirected when maintenance mode is disabled.
            </span>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
