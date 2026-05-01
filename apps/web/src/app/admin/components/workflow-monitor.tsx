"use client";

import { Button, Card, Chip } from "@heroui/react";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface WorkflowType {
  id: string;
  name: string;
  description: string;
}

const WORKFLOW_TYPES: WorkflowType[] = [
  { id: "cars", name: "Cars", description: "Car registration data" },
  { id: "coe", name: "COE", description: "COE bidding results" },
  {
    id: "deregistrations",
    name: "Deregistrations",
    description: "Vehicle deregistration statistics",
  },
  {
    id: "vehicle-population",
    name: "Vehicle Population",
    description: "Vehicle population data",
  },
  {
    id: "car-population",
    name: "Car Population",
    description: "Car population breakdown",
  },
  { id: "car-costs", name: "Car Costs", description: "Car cost update data" },
  {
    id: "electric-vehicles",
    name: "Electric Vehicles",
    description: "Electric vehicle registrations",
  },
];

type WorkflowStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

interface WorkflowRunInfo {
  runId: string;
  status: WorkflowStatus;
  workflowName?: string;
  createdAt?: string;
  completedAt?: string;
}

interface WorkflowState {
  lastRun: WorkflowRunInfo | null;
  triggering: boolean;
}

function getStatusVariant(status: WorkflowStatus): {
  color: "default" | "success" | "warning" | "danger";
  variant: "primary" | "secondary";
} {
  switch (status) {
    case "completed":
      return { color: "success", variant: "primary" };
    case "running":
    case "pending":
      return { color: "warning", variant: "secondary" };
    case "failed":
      return { color: "danger", variant: "primary" };
    case "cancelled":
      return { color: "default", variant: "secondary" };
  }
}

export function WorkflowMonitor() {
  const [workflows, setWorkflows] = useState<Record<string, WorkflowState>>(
    () =>
      Object.fromEntries(
        WORKFLOW_TYPES.map((w) => [w.id, { lastRun: null, triggering: false }]),
      ),
  );
  const [polling, setPolling] = useState(false);

  const checkRunStatus = useCallback(
    async (_workflowId: string, runId: string) => {
      try {
        const response = await fetch(
          `/api/admin/workflows?runId=${encodeURIComponent(runId)}`,
        );
        if (!response.ok) return null;
        return (await response.json()) as WorkflowRunInfo;
      } catch {
        return null;
      }
    },
    [],
  );

  const triggerWorkflow = useCallback(
    async (workflowId: string) => {
      setWorkflows((prev) => ({
        ...prev,
        [workflowId]: { ...prev[workflowId], triggering: true },
      }));

      try {
        const response = await fetch(`/api/workflows/${workflowId}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to trigger workflow: ${response.statusText}`);
        }

        const data = await response.json();
        const runId = data.runId as string;

        setWorkflows((prev) => ({
          ...prev,
          [workflowId]: {
            triggering: false,
            lastRun: { runId, status: "pending" },
          },
        }));

        toast.success(
          `${WORKFLOW_TYPES.find((w) => w.id === workflowId)?.name} workflow triggered`,
        );

        // Poll for status updates
        const interval = setInterval(async () => {
          const info = await checkRunStatus(workflowId, runId);
          if (info) {
            setWorkflows((prev) => ({
              ...prev,
              [workflowId]: { ...prev[workflowId], lastRun: info },
            }));
            if (
              info.status === "completed" ||
              info.status === "failed" ||
              info.status === "cancelled"
            ) {
              clearInterval(interval);
            }
          }
        }, 3000);

        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
      } catch (error) {
        setWorkflows((prev) => ({
          ...prev,
          [workflowId]: { ...prev[workflowId], triggering: false },
        }));
        toast.error(
          error instanceof Error ? error.message : "Failed to trigger workflow",
        );
      }
    },
    [checkRunStatus],
  );

  const refreshAll = useCallback(async () => {
    setPolling(true);
    const updates: Record<string, WorkflowState> = {};

    await Promise.all(
      WORKFLOW_TYPES.map(async (w) => {
        const current = workflows[w.id];
        if (current?.lastRun?.runId) {
          const info = await checkRunStatus(w.id, current.lastRun.runId);
          if (info) {
            updates[w.id] = { ...current, lastRun: info };
          }
        }
      }),
    );

    if (Object.keys(updates).length > 0) {
      setWorkflows((prev) => ({ ...prev, ...updates }));
    }
    setPolling(false);
  }, [workflows, checkRunStatus]);

  useEffect(() => {
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Card.Title>Workflow Monitor</Card.Title>
            <Card.Description>
              Trigger and monitor data update workflows
            </Card.Description>
          </div>
          <Button
            variant="outline"
            size="sm"
            onPress={refreshAll}
            isDisabled={polling}
          >
            <RefreshCw
              className={`mr-2 size-4 ${polling ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-3">
          {WORKFLOW_TYPES.map((workflow) => {
            const state = workflows[workflow.id];
            return (
              <div
                key={workflow.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{workflow.name}</span>
                    {state?.lastRun &&
                      (() => {
                        const statusVariant = getStatusVariant(
                          state.lastRun.status,
                        );
                        return (
                          <Chip {...statusVariant}>{state.lastRun.status}</Chip>
                        );
                      })()}
                  </div>
                  <span className="text-default-500 text-xs">
                    {workflow.description}
                  </span>
                  {state?.lastRun?.completedAt && (
                    <span className="text-default-500 text-xs">
                      Completed:{" "}
                      {new Date(state.lastRun.completedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => triggerWorkflow(workflow.id)}
                  isDisabled={
                    state?.triggering || state?.lastRun?.status === "running"
                  }
                >
                  {state?.triggering ||
                  state?.lastRun?.status === "running" ||
                  state?.lastRun?.status === "pending" ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 size-4" />
                  )}
                  {state?.triggering ? "Starting..." : "Trigger"}
                </Button>
              </div>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
}
