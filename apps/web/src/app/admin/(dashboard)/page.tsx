import { Badge } from "@motormetrics/ui/components/badge";
import { Button } from "@motormetrics/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@motormetrics/ui/components/card";
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">System Status</CardTitle>
            <Server className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-green-500">
                Operational
              </Badge>
            </div>
            <p className="mt-2 text-muted-foreground text-xs">
              All systems running normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Maintenance Mode
            </CardTitle>
            <Wrench className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Inactive</Badge>
            </div>
            <p className="mt-2 text-muted-foreground text-xs">
              Services running normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Database</CardTitle>
            <Database className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-green-500">
                Connected
              </Badge>
            </div>
            <p className="mt-2 text-muted-foreground text-xs">
              PostgreSQL connection active
            </p>
          </CardContent>
        </Card>
      </div>

      <WorkflowMonitor />

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="flex h-20 flex-col gap-2">
              <RefreshCw className="size-6" />
              <div className="text-center">
                <div className="font-medium">Trigger Data Update</div>
                <div className="text-muted-foreground text-xs">
                  Update car registration data
                </div>
              </div>
            </Button>

            <Button variant="outline" className="flex h-20 flex-col gap-2">
              <Database className="size-6" />
              <div className="text-center">
                <div className="font-medium">Manage Data</div>
                <div className="text-muted-foreground text-xs">
                  View and edit data records
                </div>
              </div>
            </Button>

            <Button variant="outline" className="flex h-20 flex-col gap-2">
              <Server className="size-6" />
              <div className="text-center">
                <div className="font-medium">System Logs</div>
                <div className="text-muted-foreground text-xs">
                  View application logs
                </div>
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
                  <div className="text-muted-foreground text-xs">
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
                  <div className="text-muted-foreground text-xs">
                    System configuration
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
