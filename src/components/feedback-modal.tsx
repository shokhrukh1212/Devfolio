"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail?: string | null;
}

export function FeedbackModal({
  open,
  onOpenChange,
  userId,
  userEmail,
}: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("feedback");
  const tToast = useTranslations("toast");

  const handleSubmit = async () => {
    if (!feedbackType || !feedbackText.trim()) {
      toast.error(tToast("feedbackRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          type: feedbackType,
          message: feedbackText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast.success(tToast("feedbackSubmitted"));
      setFeedbackType("");
      setFeedbackText("");
      onOpenChange(false);
    } catch (error) {
      toast.error(tToast("feedbackSubmitFailed"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="feedback-type">{t("typeLabel")}</Label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger id="feedback-type" className="w-full">
                <SelectValue placeholder={t("typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">{t("typeBug")}</SelectItem>
                <SelectItem value="feature">{t("typeFeature")}</SelectItem>
                <SelectItem value="other">{t("typeOther")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="feedback-message">{t("messageLabel")}</Label>
            <Textarea
              id="feedback-message"
              placeholder={t("messagePlaceholder")}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="resize-none min-h-[120px]"
            />
          </div>
        </div>

        {userEmail && (
          <p className="text-xs text-muted-foreground text-center italic">
            {t("emailNote", { email: userEmail })}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("sending")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
