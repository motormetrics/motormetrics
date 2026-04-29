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
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Status
            <Badge variant={currentAnnouncement ? "default" : "secondary"}>
              {currentAnnouncement ? "Active" : "No Announcement"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Current announcement displayed on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentAnnouncement ? (
            <div className="rounded-md border bg-primary p-4 text-center text-primary-foreground">
              {currentAnnouncement}
            </div>
          ) : (
            <div className="rounded-md border bg-muted p-4 text-center text-muted-foreground">
              No announcement is currently active
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Announcement Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Announcement</CardTitle>
          <CardDescription>
            Create or modify the announcement that will be displayed to users
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <Label
              htmlFor="enable-announcement"
              className="font-medium text-base"
            >
              Enable Announcement
            </Label>
            <Button
              variant={isEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleEnabled}
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="announcement-text">Announcement Text</Label>
            <Input
              id="announcement-text"
              placeholder="Enter your announcement message..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="text-base"
              disabled={!isEnabled}
            />
            <p className="text-muted-foreground text-sm">
              Keep it concise and clear. This will appear at the top of every
              page.
            </p>
          </div>

          {/* Preview */}
          {isEnabled && announcementText && (
            <div className="flex flex-col gap-2">
              <Label>Preview</Label>
              <div className="rounded-md border bg-primary p-4 text-center text-primary-foreground">
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
              onClick={handleSave}
              disabled={isSaving || (isEnabled && !announcementText.trim())}
              className="flex items-center gap-2"
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
