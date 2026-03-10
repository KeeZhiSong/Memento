"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AvatarEvent } from "@/types/avatar";
import { ConversationMessage } from "@/types/conversation";
import { GREETING_TEXT, MOCK_SCENARIOS } from "@/lib/mock-data";
import { LISTENING_DURATION, THINKING_DURATION } from "@/lib/constants";

interface UseMockConversationOptions {
  dispatch: (event: AvatarEvent) => void;
}

let messageIdCounter = 0;
function nextMessageId() {
  return `msg-${++messageIdCounter}`;
}

export function useMockConversation({ dispatch }: UseMockConversationOptions) {
  const [bubbleText, setBubbleText] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const scenarioIndex = useRef(0);
  const isBusy = useRef(false);
  const greetingDone = useRef(false);

  // Greeting on mount
  useEffect(() => {
    if (greetingDone.current) return;
    greetingDone.current = true;

    const timer = setTimeout(() => {
      setBubbleText(GREETING_TEXT);
      setMessages([{
        id: nextMessageId(),
        role: "assistant",
        text: GREETING_TEXT,
        timestamp: Date.now(),
      }]);
      dispatch({ type: "START_GREETING" });
    }, 800);

    return () => clearTimeout(timer);
  }, [dispatch]);

  const handleGreetingComplete = useCallback(() => {
    setTimeout(() => {
      dispatch({ type: "GREETING_DONE" });
    }, 2000);
  }, [dispatch]);

  const handleMicPress = useCallback(() => {
    if (isBusy.current) return;
    isBusy.current = true;

    // Start listening
    dispatch({ type: "START_LISTENING" });
    setBubbleText("");

    // After listening duration, start thinking
    setTimeout(() => {
      dispatch({ type: "STOP_LISTENING" });

      // After thinking duration, start speaking
      setTimeout(() => {
        const scenario = MOCK_SCENARIOS[scenarioIndex.current % MOCK_SCENARIOS.length];
        scenarioIndex.current++;

        const now = Date.now();
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId(),
            role: "user",
            text: scenario.userPrompt,
            timestamp: now,
          },
          {
            id: nextMessageId(),
            role: "assistant",
            text: scenario.response,
            timestamp: now + 1,
          },
        ]);

        setBubbleText(scenario.response);
        dispatch({ type: "START_SPEAKING", text: scenario.response });
      }, THINKING_DURATION);
    }, LISTENING_DURATION);
  }, [dispatch]);

  const handleSpeakingComplete = useCallback(() => {
    setTimeout(() => {
      dispatch({ type: "SPEAKING_DONE" });
      isBusy.current = false;
    }, 2000);
  }, [dispatch]);

  return {
    bubbleText,
    messages,
    handleMicPress,
    handleGreetingComplete,
    handleSpeakingComplete,
  };
}
