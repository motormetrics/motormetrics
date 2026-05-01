"use client";

import { Alert } from "@heroui/react";

import { Streamdown } from "streamdown";

interface InfoboxProps {
  title: string;
  content: string;
}

export function Infobox({ title, content }: InfoboxProps) {
  return (
    <Alert className="border border-accent/30 px-4 py-3" status="accent">
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>
          <div className="prose prose-sm prose-p:my-0 max-w-none text-foreground">
            <Streamdown>{content}</Streamdown>
          </div>
        </Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
