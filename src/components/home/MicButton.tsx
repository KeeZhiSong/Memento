"use client";

import { SessionPhase } from "@/types/session";
import { useLanguage } from "@/hooks/useLanguage";

interface MicButtonProps {
  sessionPhase: SessionPhase;
  isMuted: boolean;
  isListening: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function MicIcon() {
  return (
    <svg
      className="w-7 h-7 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg
      className="w-7 h-7 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
}

export default function MicButton({
  sessionPhase,
  isMuted,
  isListening,
  onPress,
  disabled,
}: MicButtonProps) {
  const { t } = useLanguage();
  const isConnecting = sessionPhase === "connecting";
  const isActive = sessionPhase === "active";

  let bgClass = "glass-dark";
  let extraClass = "";

  if (isConnecting) {
    bgClass = "glass-dark";
  } else if (isActive && isMuted) {
    bgClass = "bg-red-400/60";
  } else if (isActive && isListening) {
    bgClass = "bg-warm-pink";
    extraClass = "animate-[mic-pulse_1.5s_ease-in-out_infinite]";
  } else if (isActive && !isMuted) {
    bgClass = "bg-teal/60";
  }

  const isDisabled = disabled || isConnecting;

  let ariaLabel = t("mic.startTalking");
  if (isConnecting) ariaLabel = t("mic.connecting");
  else if (isActive && isMuted) ariaLabel = t("mic.unmute");
  else if (isActive) ariaLabel = t("mic.mute");

  return (
    <button
      onClick={onPress}
      disabled={isDisabled}
      className={`relative flex items-center justify-center w-[72px] h-[72px] rounded-full transition-all active:scale-95 ${bgClass} ${extraClass} ${isDisabled ? "opacity-50" : ""}`}
      aria-label={ariaLabel}
    >
      {isConnecting ? (
        <Spinner />
      ) : isActive && isMuted ? (
        <MicOffIcon />
      ) : (
        <MicIcon />
      )}
    </button>
  );
}
