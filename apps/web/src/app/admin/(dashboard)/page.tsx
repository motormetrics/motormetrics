import { Button, Card, Chip } from "@heroui/react";
import { WorkflowMonitor } from "@web/app/admin/components/workflow-monitor";
import { Database, RefreshCw, Server, Settings, Wrench } from "lucide-react";
import Link from "next/link";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Card.Header className="flex flex-row items-center justify-between pb-2">
            <Card.Title className="font-medium text-sm">
              System Status
            </Card.Title>
            <Server className="size-4 text-muted" />
          </Card.Header>
          <Card.Content>
            <div className="flex items-center gap-2">
              <Chip color="success" variant="primary">
                Operational
              </Chip>
            </div>
            <p className="mt-2 text-muted text-xs">
              All systems running normally
            </p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header className="flex flex-row items-center justify-between pb-2">
            <Card.Title className="font-medium text-sm">
              Maintenance Mode
            </Card.Title>
            <Wrench className="size-4 text-muted" />
          </Card.Header>
          <Card.Content>
            <div className="flex items-center gap-2">
              <Chip>Inactive</Chip>
            </div>
            <p className="mt-2 text-muted text-xs">Services running normally</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header className="flex flex-row items-center justify-between pb-2">
            <Card.Title className="font-medium text-sm">Database</Card.Title>
            <Database className="size-4 text-muted" />
          </Card.Header>
          <Card.Content>
            <div className="flex items-center gap-2">
              <Chip color="success" variant="primary">
                Connected
              </Chip>
            </div>
            <p className="mt-2 text-muted text-xs">
              PostgreSQL connection active
            </p>
          </Card.Content>
        </Card>
      </div>

      <WorkflowMonitor />

      <Card>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="flex h-20 flex-col gap-2">
              <RefreshCw className="size-6" />
              <div className="text-center">
                <div className="font-medium">Trigger Data Update</div>
                <div className="text-muted text-xs">
                  Update car registration data
                </div>
              </div>
            </Button>

            <Button variant="outline" className="flex h-20 flex-col gap-2">
              <Database className="size-6" />
              <div className="text-center">
                <div className="font-medium">Manage Data</div>
                <div className="text-muted text-xs">
                  View and edit data records
                </div>
              </div>
            </Button>

            <Button variant="outline" className="flex h-20 flex-col gap-2">
              <Server className="size-6" />
              <div className="text-center">
                <div className="font-medium">System Logs</div>
                <div className="text-muted text-xs">View application logs</div>
              </div>
            </Button>

            <Link href="/settings/maintenance">
              <Button
                variant="outline"
                className="flex h-20 w-full flex-col gap-2"
              >
                <Wrench className="size-6" />
                <div className="text-center">
                  <div className="font-medium">Maintenance Mode</div>
                  <div className="text-muted text-xs">
                    Configure maintenance settings
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/settings">
              <Button
                variant="outline"
                className="flex h-20 w-full flex-col gap-2"
              >
                <Settings className="size-6" />
                <div className="text-center">
                  <div className="font-medium">Settings</div>
                  <div className="text-muted text-xs">System configuration</div>
                </div>
              </Button>
            </Link>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;
