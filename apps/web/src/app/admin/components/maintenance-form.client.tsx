"use client";

import { Badge } from "@motormetrics/ui/components/badge";
import { Button } from "@motormetrics/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@motormetrics/ui/components/card";
import { Input } from "@motormetrics/ui/components/input";
import { Label } from "@motormetrics/ui/components/label";
import { Separator } from "@motormetrics/ui/components/separator";
import { Switch } from "@motormetrics/ui/components/switch";
import {
  type MaintenanceConfig,
  updateMaintenanceConfig,
} from "@web/app/admin/actions/maintenance";
import { AlertCircle, Globe, Save, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MaintenanceFormLabels {
  currentStatus: {
    title: string;
    description: string;
    underMaintenance: string;
    normalOperation: string;
    webApplication: string;
    maintenanceMode: string;
    onlineOperational: string;
    activeMessagePrefix: string;
  };
  configuration: {
    title: string;
    description: string;
    enableToggle: {
      label: string;
      description: string;
    };
    messageInput: {
      label: string;
      placeholder: string;
      helpText: string;
    };
    serviceScope: {
      label: string;
      description: string;
    };
    preview: {
      label: string;
      title: string;
    };
    validation: {
      messageRequired: string;
    };
    saveButton: {
      saving: string;
      default: string;
    };
  };
  toasts: {
    success: string;
    error: string;
  };
}

interface MaintenanceFormClientProps {
  initialConfig: MaintenanceConfig;
  labels: MaintenanceFormLabels;
}

export function MaintenanceFormClient({
  initialConfig,
  labels,
}: MaintenanceFormClientProps) {
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
        toast.success(labels.toasts.success);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Failed to save maintenance settings:", error);
      toast.error(error instanceof Error ? error.message : labels.toasts.error);
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
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {labels.currentStatus.title}
            <Badge variant={isMaintenanceEnabled ? "destructive" : "default"}>
              {isMaintenanceEnabled
                ? labels.currentStatus.underMaintenance
                : labels.currentStatus.normalOperation}
            </Badge>
          </CardTitle>
          <CardDescription>{labels.currentStatus.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg border p-6">
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Globe className="size-6" />
              </div>
              <div className="font-medium text-lg">
                {labels.currentStatus.webApplication}
              </div>
              <Badge
                variant="outline"
                className={
                  isMaintenanceEnabled
                    ? "mt-2 bg-orange-50 text-orange-700"
                    : "mt-2 bg-green-50 text-green-700"
                }
              >
                {isMaintenanceEnabled
                  ? labels.currentStatus.maintenanceMode
                  : labels.currentStatus.onlineOperational}
              </Badge>
            </div>
          </div>
          {isMaintenanceEnabled && maintenanceMessage && (
            <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 p-3">
              <p className="text-orange-800 text-sm">
                <strong>{labels.currentStatus.activeMessagePrefix}</strong>{" "}
                {maintenanceMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Maintenance Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{labels.configuration.title}</CardTitle>
          <CardDescription>{labels.configuration.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="maintenance-toggle"
                className="font-medium text-base"
              >
                {labels.configuration.enableToggle.label}
              </Label>
              <p className="text-muted-foreground text-sm">
                {labels.configuration.enableToggle.description}
              </p>
            </div>
            <Switch
              id="maintenance-toggle"
              checked={isMaintenanceEnabled}
              onCheckedChange={setIsMaintenanceEnabled}
            />
          </div>

          {isMaintenanceEnabled && (
            <>
              {/* Maintenance Message */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="maintenance-message">
                  {labels.configuration.messageInput.label}
                </Label>
                <Input
                  id="maintenance-message"
                  placeholder={labels.configuration.messageInput.placeholder}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="text-base"
                />
                <p className="text-muted-foreground text-sm">
                  {labels.configuration.messageInput.helpText}
                </p>
              </div>

              {/* Service Scope Info */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Globe className="size-4" />
                  <Label className="font-medium text-base">
                    {labels.configuration.serviceScope.label}
                  </Label>
                </div>
                <p className="text-muted-foreground text-sm">
                  {labels.configuration.serviceScope.description}
                </p>
              </div>

              {/* Preview */}
              {maintenanceMessage.trim() && (
                <div className="flex flex-col gap-2">
                  <Label>{labels.configuration.preview.label}</Label>
                  <div className="rounded-md border border-orange-200 bg-orange-50 p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-orange-800">
                      <Wrench className="size-5" />
                      <strong>{labels.configuration.preview.title}</strong>
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
                    {labels.configuration.validation.messageRequired}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || !isFormValid()}
              className="flex items-center gap-2"
            >
              <Save className="size-4" />
              {isSaving
                ? labels.configuration.saveButton.saving
                : labels.configuration.saveButton.default}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
