"use client";

import {
  Button,
  Card,
  Chip,
  Input,
  Label,
  Separator,
  Switch,
  TextField,
} from "@heroui/react";
import { updateMaintenanceConfig } from "@web/app/admin/actions/maintenance";
import type { MaintenanceConfig } from "@web/lib/maintenance";
import { AlertCircle, Globe, Save, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MaintenanceFormProps {
  initialConfig: MaintenanceConfig;
}

export function MaintenanceForm({ initialConfig }: MaintenanceFormProps) {
  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState(
    initialConfig.enabled,
  );
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    initialConfig.message ||
      "We're currently performing scheduled maintenance. Please check back soon!",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateMaintenanceConfig({
        enabled: isMaintenanceEnabled,
        message: maintenanceMessage,
      });

      if (result.success) {
        toast.success("Maintenance settings updated successfully!");
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Failed to save maintenance settings:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save maintenance settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    if (!isMaintenanceEnabled) return true;
    return maintenanceMessage.trim();
  };

  return (
    <>
      {/* Current Status */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center justify-between">
            Current Status
            <Chip
              color={isMaintenanceEnabled ? "danger" : "success"}
              variant="primary"
            >
              {isMaintenanceEnabled ? "Under Maintenance" : "Normal Operation"}
            </Chip>
          </Card.Title>
          <Card.Description>
            Current maintenance status for the web application
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center justify-center rounded-lg border p-6">
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Globe className="size-6" />
              </div>
              <div className="font-medium text-lg">Web Application</div>
              <Chip
                variant="secondary"
                color={isMaintenanceEnabled ? "warning" : "success"}
                className={
                  isMaintenanceEnabled
                    ? "mt-2 bg-orange-50 text-orange-700"
                    : "mt-2 bg-green-50 text-green-700"
                }
              >
                {isMaintenanceEnabled
                  ? "Maintenance Mode"
                  : "Online & Operational"}
              </Chip>
            </div>
          </div>
          {isMaintenanceEnabled && maintenanceMessage && (
            <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 p-3">
              <p className="text-orange-800 text-sm">
                <strong>Active Message:</strong> {maintenanceMessage}
              </p>
            </div>
          )}
        </Card.Content>
      </Card>

      <Separator />

      {/* Maintenance Configuration */}
      <Card>
        <Card.Header>
          <Card.Title>Maintenance Configuration</Card.Title>
          <Card.Description>
            Configure when and how maintenance mode will be activated
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="maintenance-toggle"
                className="font-medium text-base"
              >
                Enable Maintenance Mode
              </Label>
              <p className="text-muted text-sm">
                Activate maintenance mode for selected services
              </p>
            </div>
            <Switch
              aria-label="Enable Maintenance Mode"
              isSelected={isMaintenanceEnabled}
              onChange={setIsMaintenanceEnabled}
            >
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Content>
            </Switch>
          </div>

          {isMaintenanceEnabled && (
            <>
              {/* Maintenance Message */}
              <TextField className="flex flex-col gap-2">
                <Label>Maintenance Message</Label>
                <Input
                  name="maintenance-message"
                  placeholder="Enter the message users will see during maintenance..."
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="text-base"
                />
                <p className="text-muted text-sm">
                  This message will be displayed to users when they try to
                  access services under maintenance.
                </p>
              </TextField>

              {/* Service Scope Info */}
              <div className="rounded-lg border bg-surface/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Globe className="size-4" />
                  <Label className="font-medium text-base">Service Scope</Label>
                </div>
                <p className="text-muted text-sm">
                  Maintenance mode affects the web application only
                  (motormetrics.app). The API (api.motormetrics.app) remains
                  operational.
                </p>
              </div>

              {/* Preview */}
              {maintenanceMessage.trim() && (
                <div className="flex flex-col gap-2">
                  <Label>Preview</Label>
                  <div className="rounded-md border border-orange-200 bg-orange-50 p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-orange-800">
                      <Wrench className="size-5" />
                      <strong>Site Under Maintenance</strong>
                    </div>
                    <p className="mt-2 text-orange-700">{maintenanceMessage}</p>
                  </div>
                </div>
              )}

              {/* Validation Warnings */}
              {isMaintenanceEnabled && !maintenanceMessage.trim() && (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
                  <AlertCircle className="size-4" />
                  <span className="text-sm">
                    Maintenance message is required when maintenance mode is
                    enabled.
                  </span>
                </div>
              )}
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onPress={handleSave}
              isDisabled={isSaving || !isFormValid()}
              className="flex items-center gap-2"
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </>
  );
}
