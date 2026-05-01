import { Card, Chip, Separator } from "@heroui/react";
import {
  AlertTriangle,
  Bell,
  Database,
  Globe,
  Lock,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";

const SettingsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight">
          <Settings className="size-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage system settings and configuration options.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Maintenance Settings */}
        <Link href="/settings/maintenance">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <Card.Header>
              <Card.Title className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="size-5" />
                  Maintenance Mode
                </div>
                <Chip>Inactive</Chip>
              </Card.Title>
              <Card.Description>
                Enable maintenance mode to temporarily disable site access for
                updates and repairs.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-green-600">Normal Operation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Last Maintenance:
                  </span>
                  <span>Never</span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </Link>

        {/* Site Configuration */}
        <Card className="cursor-pointer opacity-60">
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <Globe className="size-5" />
              Site Configuration
            </Card.Title>
            <Card.Description>
              Manage global site settings, domains, and basic configuration.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment:</span>
                <span>Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Domain:</span>
                <span>motormetrics.app</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Database Settings */}
        <Card className="cursor-pointer opacity-60">
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <Database className="size-5" />
              Database Settings
            </Card.Title>
            <Card.Description>
              Configure database connections, backup schedules, and data
              retention policies.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connection:</span>
                <span className="text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Backup:</span>
                <span>2 hours ago</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Security Settings */}
        <Card className="cursor-pointer opacity-60">
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <Lock className="size-5" />
              Security Settings
            </Card.Title>
            <Card.Description>
              Manage authentication, API keys, rate limiting, and security
              policies.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">2FA Required:</span>
                <span className="text-green-600">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Rate Limit:</span>
                <span>1000/hour</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* User Management */}
        <Card className="cursor-pointer opacity-60">
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <Users className="size-5" />
              User Management
            </Card.Title>
            <Card.Description>
              Configure user roles, permissions, and access control settings.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Users:</span>
                <span>3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admin Users:</span>
                <span>1</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Notifications */}
        <Card className="cursor-pointer opacity-60">
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <Bell className="size-5" />
              Notifications
            </Card.Title>
            <Card.Description>
              Configure email alerts, webhooks, and notification preferences.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email Alerts:</span>
                <span className="text-green-600">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Webhooks:</span>
                <span>2 configured</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      <Separator />

      <Card>
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Important Notes
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4 text-muted-foreground text-sm">
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">⚠️</span>
            <span>
              Changes to critical settings may require system restart and can
              affect site availability.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">🔒</span>
            <span>
              All configuration changes are logged and require admin privileges.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">💾</span>
            <span>
              Always backup your current configuration before making significant
              changes.
            </span>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default SettingsPage;
