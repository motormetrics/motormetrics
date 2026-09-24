"use client";

import { Button, Card, Chip } from "@heroui/react";
import { triggerWorkflow as startWorkflow } from "@web/app/admin/actions/workflows";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
    id: "monthly-update",
    name: "Monthly Update",
    description: "The month's single post across all datasets",
  },
  {
    id: "car-population",
    name: "Car Population",
    description: "Car population breakdown",
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
  // Latest state for refreshAll, so its interval is not recreated on every update
  const workflowsRef = useRef(workflows);
  useEffect(() => {
    workflowsRef.current = workflows;
  }, [workflows]);
  // Per-trigger polling timers, cleared on unmount
  const timersRef = useRef<{
    intervals: Set<ReturnType<typeof setInterval>>;
    timeouts: Set<ReturnType<typeof setTimeout>>;
  }>({ intervals: new Set(), timeouts: new Set() });

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const interval of timers.intervals) clearInterval(interval);
      for (const timeout of timers.timeouts) clearTimeout(timeout);
    };
  }, []);

  const checkRunStatus = useCallback(async (runId: string) => {
    try {
      const response = await fetch(
        `/api/admin/workflows?runId=${encodeURIComponent(runId)}`,
      );
      if (!response.ok) return null;
      return (await response.json()) as WorkflowRunInfo;
    } catch {
      return null;
    }
  }, []);

  const triggerWorkflow = useCallback(
    async (workflowId: string) => {
      setWorkflows((prev) => ({
        ...prev,
        [workflowId]: { ...prev[workflowId], triggering: true },
      }));

      try {
        const result = await startWorkflow(workflowId);

        if (!result.success || !result.runId) {
          throw new Error(
            `Failed to trigger workflow: ${result.error ?? "Unknown error"}`,
          );
        }

        const { runId } = result;

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

        const { intervals, timeouts } = timersRef.current;
        const stopPolling = () => {
          clearInterval(interval);
          clearTimeout(timeout);
          intervals.delete(interval);
          timeouts.delete(timeout);
        };

        // Poll for status updates
        const interval = setInterval(async () => {
          const info = await checkRunStatus(runId);
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
              stopPolling();
            }
          }
        }, 3000);

        // Stop polling after 5 minutes
        const timeout = setTimeout(stopPolling, 5 * 60 * 1000);
        intervals.add(interval);
        timeouts.add(timeout);
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
        const current = workflowsRef.current[w.id];
        if (current?.lastRun?.runId) {
          const info = await checkRunStatus(current.lastRun.runId);
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
  }, [checkRunStatus]);

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
                  <span className="text-muted text-xs">
                    {workflow.description}
                  </span>
                  {state?.lastRun?.completedAt && (
                    <span className="text-muted text-xs">
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
