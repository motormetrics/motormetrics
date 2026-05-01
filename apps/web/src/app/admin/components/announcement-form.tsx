"use client";

import {
  Button,
  Card,
  Chip,
  Input,
  Label,
  Separator,
  TextField,
} from "@heroui/react";
import { AlertCircle, Eye, EyeOff, Save } from "lucide-react";
import { useState } from "react";

export function AnnouncementForm() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Mock current announcement data - replace with actual API call
  const currentAnnouncement = null; // This would come from your API/config

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would make an API call to update the announcement
      // This might involve updating environment variables, database, or config files
      console.log("Saving announcement:", { isEnabled, announcementText });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message (you could use a toast library)
      alert("Announcement updated successfully!");
    } catch (error) {
      console.error("Failed to save announcement:", error);
      alert("Failed to save announcement. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEnabled = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <>
      {/* Current Status */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center justify-between">
            Current Status
            <Chip
              color={currentAnnouncement ? "success" : "default"}
              variant="secondary"
            >
              {currentAnnouncement ? "Active" : "No Announcement"}
            </Chip>
          </Card.Title>
          <Card.Description>
            Current announcement displayed on the website
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {currentAnnouncement ? (
            <div className="rounded-md border bg-accent p-4 text-center text-accent-foreground">
              {currentAnnouncement}
            </div>
          ) : (
            <div className="rounded-md border bg-surface p-4 text-center text-muted">
              No announcement is currently active
            </div>
          )}
        </Card.Content>
      </Card>

      <Separator />

      {/* Announcement Editor */}
      <Card>
        <Card.Header>
          <Card.Title>Edit Announcement</Card.Title>
          <Card.Description>
            Create or modify the announcement that will be displayed to users
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <Label
              htmlFor="enable-announcement"
              className="font-medium text-base"
            >
              Enable Announcement
            </Label>
            <Button
              variant={isEnabled ? "primary" : "outline"}
              size="sm"
              onPress={toggleEnabled}
              className="flex items-center gap-2"
            >
              {isEnabled ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
              {isEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {/* Announcement Text Input */}
          <TextField isDisabled={!isEnabled} className="flex flex-col gap-2">
            <Label>Announcement Text</Label>
            <Input
              name="announcement-text"
              placeholder="Enter your announcement message..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="text-base"
            />
            <p className="text-muted text-sm">
              Keep it concise and clear. This will appear at the top of every
              page.
            </p>
          </TextField>

          {/* Preview */}
          {isEnabled && announcementText && (
            <div className="flex flex-col gap-2">
              <Label>Preview</Label>
              <div className="rounded-md border bg-accent p-4 text-center text-accent-foreground">
                {announcementText}
              </div>
            </div>
          )}

          {/* Warning */}
          {isEnabled && !announcementText.trim() && (
            <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 p-3 text-orange-800">
              <AlertCircle className="size-4" />
              <span className="text-sm">
                Announcement is enabled but no text is provided. Please add
                announcement text or disable it.
              </span>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onPress={handleSave}
              isDisabled={isSaving || (isEnabled && !announcementText.trim())}
              className="flex items-center gap-2"
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </>
  );
}
