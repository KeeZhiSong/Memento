"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  useVoiceAssistant,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { AvatarEvent } from "@/types/avatar";
import { ConversationMessage } from "@/types/conversation";
import { IDLE_TIMEOUT_MS } from "@/types/session";

interface LiveKitVoiceSessionProps {
  dispatch: (event: AvatarEvent) => void;
  onBubbleText: (text: string) => void;
  onMessage: (message: ConversationMessage) => void;
  onIdleTimeout: () => void;
}

let messageIdCounter = 0;
function nextMessageId() {
  return `msg-${++messageIdCounter}`;
}

export default function LiveKitVoiceSession({
  dispatch,
  onBubbleText,
  onMessage,
  onIdleTimeout,
}: LiveKitVoiceSessionProps) {
  const { state, agentTranscriptions } = useVoiceAssistant();

  const prevStateRef = useRef(state);
  const hasSpokenRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTranscriptionLenRef = useRef(0);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const startIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      dispatch({ type: "RESET" });
      onIdleTimeout();
    }, IDLE_TIMEOUT_MS);
  }, [clearIdleTimer, dispatch, onIdleTimeout]);

  // Map agent state transitions to avatar dispatches
  useEffect(() => {
    const prevState = prevStateRef.current;
    prevStateRef.current = state;

    if (prevState === state) return;

    switch (state) {
      case "speaking": {
        clearIdleTimer();
        if (!hasSpokenRef.current) {
          hasSpokenRef.current = true;
          dispatch({ type: "START_GREETING" });
        } else {
          // Get the latest transcription text for the speech bubble
          const latestText = getLatestTranscriptionText(agentTranscriptions);
          if (latestText) {
            onBubbleText(latestText);
            dispatch({ type: "START_SPEAKING", text: latestText });
          }
        }
        break;
      }

      case "listening":
        clearIdleTimer();
        dispatch({ type: "START_LISTENING" });
        onBubbleText("");
        break;

      case "thinking":
        dispatch({ type: "STOP_LISTENING" });
        break;

      case "idle":
        if (prevState === "speaking") {
          dispatch({ type: "SPEAKING_DONE" });
          startIdleTimer();
        }
        break;

      case "disconnected":
      case "failed":
        clearIdleTimer();
        dispatch({ type: "RESET" });
        break;
    }
  }, [state, agentTranscriptions, dispatch, onBubbleText, clearIdleTimer, startIdleTimer]);

  // Watch for new completed transcription segments and push to chat log
  useEffect(() => {
    if (agentTranscriptions.length <= lastTranscriptionLenRef.current) return;

    const newSegments = agentTranscriptions.slice(
      lastTranscriptionLenRef.current
    );
    lastTranscriptionLenRef.current = agentTranscriptions.length;

    // Build text from final segments
    const finalText = newSegments
      .filter((seg) => seg.final)
      .map((seg) => seg.text)
      .join(" ")
      .trim();

    if (finalText) {
      onMessage({
        id: nextMessageId(),
        role: "assistant",
        text: finalText,
        timestamp: Date.now(),
      });

      // For greeting, also set bubble text
      if (hasSpokenRef.current && prevStateRef.current === "speaking") {
        onBubbleText(finalText);
      }
    }
  }, [agentTranscriptions, onMessage, onBubbleText]);

  // Cleanup idle timer on unmount
  useEffect(() => {
    return () => {
      clearIdleTimer();
    };
  }, [clearIdleTimer]);

  return <RoomAudioRenderer />;
}

function getLatestTranscriptionText(
  transcriptions: { text: string; final: boolean }[]
): string {
  // Collect the most recent batch of segments (those that form the current utterance)
  const texts: string[] = [];
  for (let i = transcriptions.length - 1; i >= 0; i--) {
    texts.unshift(transcriptions[i].text);
    if (transcriptions[i].final) break;
  }
  return texts.join(" ").trim();
}
