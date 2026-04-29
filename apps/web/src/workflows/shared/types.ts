export type WorkflowEventType =
  | "step:start"
  | "step:complete"
  | "step:error"
  | "data:processed"
  | "post:generated"
  | "cache:revalidated";

export interface WorkflowEvent {
  type: WorkflowEventType;
  step: string;
  timestamp: number;
  data?: Record<string, unknown>;
}
