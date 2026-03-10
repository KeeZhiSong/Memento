"use client";

import { useEffect, useState } from "react";
import { TYPEWRITER_SPEED } from "@/lib/constants";

interface SpeechBubbleProps {
  text: string;
  isVisible: boolean;
  typewriter?: boolean;
  onComplete?: () => void;
}

export default function SpeechBubble({
  text,
  isVisible,
  typewriter = true,
  onComplete,
}: SpeechBubbleProps) {
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isVisible || !text) {
      setDisplayed("");
      setIsTyping(false);
      return;
    }

    if (!typewriter) {
      setDisplayed(text);
      return;
    }

    setDisplayed("");
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        onComplete?.();
      }
    }, TYPEWRITER_SPEED);

    return () => clearInterval(interval);
  }, [text, isVisible, typewriter, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="animate-[bubble-appear_0.4s_ease-out_forwards]">
      <div className="glass-heavy rounded-2xl px-5 py-4 shadow-lg">
        <p className="text-base leading-relaxed text-navy font-medium">
          {displayed}
          {isTyping && (
            <span className="inline-block w-0.5 h-4 bg-navy/60 ml-0.5 align-middle animate-[typewriter-cursor_0.8s_step-end_infinite]" />
          )}
        </p>
      </div>
    </div>
  );
}
