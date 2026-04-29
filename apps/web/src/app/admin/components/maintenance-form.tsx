import type { MaintenanceConfig } from "@web/app/admin/actions/maintenance";
import { MaintenanceFormClient } from "./maintenance-form.client";

interface MaintenanceFormProps {
  initialConfig: MaintenanceConfig;
}

const MAINTENANCE_FORM_LABELS = {
  currentStatus: {
    title: "Current Status",
    description: "Current maintenance status for the web application",
    underMaintenance: "Under Maintenance",
    normalOperation: "Normal Operation",
    webApplication: "Web Application",
    maintenanceMode: "Maintenance Mode",
    onlineOperational: "Online & Operational",
    activeMessagePrefix: "Active Message:",
  },
  configuration: {
    title: "Maintenance Configuration",
    description: "Configure when and how maintenance mode will be activated",
    enableToggle: {
      label: "Enable Maintenance Mode",
      description: "Activate maintenance mode for selected services",
    },
    messageInput: {
      label: "Maintenance Message",
      placeholder: "Enter the message users will see during maintenance...",
      helpText:
        "This message will be displayed to users when they try to access services under maintenance.",
    },
    serviceScope: {
      label: "Service Scope",
      description:
        "Maintenance mode affects the web application only (motormetrics.app). The API (api.motormetrics.app) remains operational.",
    },
    preview: {
      label: "Preview",
      title: "Site Under Maintenance",
    },
    validation: {
      messageRequired:
        "Maintenance message is required when maintenance mode is enabled.",
    },
    saveButton: {
      saving: "Saving...",
      default: "Save Configuration",
    },
  },
  toasts: {
    success: "Maintenance settings updated successfully!",
    error: "Failed to save maintenance settings.",
  },
} as const;

export function MaintenanceForm({ initialConfig }: MaintenanceFormProps) {
  return (
    <MaintenanceFormClient
      initialConfig={initialConfig}
      labels={MAINTENANCE_FORM_LABELS}
    />
  );
}
