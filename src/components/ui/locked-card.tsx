"use client";

import { useState } from "react";
import { Lock, Check, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeatureKey = "analytics" | "custom_domain";

interface LockedCardProps {
  title: React.ReactNode;
  description: string;
  featureKey: FeatureKey;
  userId: string;
  initialJoined?: boolean;
  unlockButtonText?: string;
  joinedText?: string;
  children: React.ReactNode;
  className?: string;
}

export function LockedCard({
  title,
  description,
  featureKey,
  userId,
  initialJoined = false,
  unlockButtonText = "Unlock Visitor Data",
  joinedText = "You're on the waitlist!",
  children,
  className,
}: LockedCardProps) {
  const [isJoined, setIsJoined] = useState(initialJoined);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinWaitlist = async () => {
    if (isJoined || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: featureKey,
          userId,
        }),
      });

      if (response.ok) {
        setIsJoined(true);
      }
    } catch (error) {
      console.error("Failed to join waitlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {/* Blurred content */}
        <div className="blur-[6px] pointer-events-none select-none">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="text-center space-y-3">
            {isJoined ? (
              <div className="flex items-center gap-2 text-primary font-medium">
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                {joinedText}
              </div>
            ) : (
              <Button
                onClick={handleJoinWaitlist}
                disabled={isLoading}
                variant="default"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                {unlockButtonText}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
