"use client";

import { useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { FeedbackModal } from "./feedback-modal";
import { useTranslations } from "next-intl";

interface FloatingFeedbackButtonProps {
  userId: string;
  userEmail?: string | null;
}

export function FloatingFeedbackButton({
  userId,
  userEmail,
}: FloatingFeedbackButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations("common");
  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Tooltip */}
        <div
          className={`bg-foreground text-background text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 ease-out whitespace-nowrap ${
            isHovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          {t("feedback")}
        </div>

        {/* Button */}
        <button
          onClick={() => setShowModal(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
          aria-label="Send feedback"
        >
          <MessageCircleQuestion className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>

      <FeedbackModal
        open={showModal}
        onOpenChange={setShowModal}
        userId={userId}
        userEmail={userEmail}
      />
    </>
  );
}
