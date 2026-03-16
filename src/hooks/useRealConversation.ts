"use client";
// Note: stores conversation state in user's browser
// Data is lost on refresh, but allows for faster interactions without waiting for backend response every time

import { useCallback, useEffect, useRef, useState } from "react";
import { MicVAD, utils } from "@ricky0123/vad-web";
import { AvatarEvent } from "@/types/avatar";
import { ConversationMessage } from "@/types/conversation";
import { GREETING_TEXT } from "@/lib/mock-data";
import { VAD_REDEMPTION_MS } from "@/lib/constants";
import { getOrCreateSessionId } from "@/lib/client-session";
import { useLanguage } from "@/hooks/useLanguage";

interface UseRealConversationOptions {
  dispatch: (event: AvatarEvent) => void; // sends action command
}

let messageIdCounter = 0;
function nextMessageId() {
  return `msg-${++messageIdCounter}`;
}

export function useRealConversation({ dispatch }: UseRealConversationOptions) {
  const [bubbleText, setBubbleText] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [summary, setSummary] = useState<string>("No summary yet.");
  const greetingDone = useRef(false);
  const sessionIdRef = useRef(getOrCreateSessionId());
  const greetingPlaybackAttemptedRef = useRef(false);
  const completionModeRef = useRef<"audio" | "bubble">("bubble");
  const activeSpeechKindRef = useRef<"greeting" | "speaking" | null>(null);
  const playbackTokenRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const { language } = useLanguage();

  // Lazy VAD instance (created on first mic press)
  const vadRef = useRef<MicVAD | null>(null);
  const vadInitializingRef = useRef(false);
  const [vadListening, setVadListening] = useState(false);

  // Refs for callbacks that the VAD needs (avoids stale closures)
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const summaryRef = useRef(summary);
  summaryRef.current = summary;
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  const finishAssistantSpeech = useCallback(
    (kind: "greeting" | "speaking") => {
      if (activeSpeechKindRef.current !== kind) return;

      activeSpeechKindRef.current = null;
      completionModeRef.current = "bubble";

      if (kind === "greeting") {
        dispatch({ type: "GREETING_DONE" });
        return;
      }

      dispatch({ type: "SPEAKING_DONE" });
    },
    [dispatch]
  );

  const cleanupAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const playAssistantAudio = useCallback(
    async (text: string, kind: "greeting" | "speaking") => {
      activeSpeechKindRef.current = kind;
      completionModeRef.current = "bubble";

      const token = ++playbackTokenRef.current;

      try {
        cleanupAudio();

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language }),
        });

        if (!response.ok) {
          let errorMessage = `TTS request failed: ${response.status}`;
          try {
            const data = (await response.json()) as { error?: string };
            errorMessage = data.error ?? errorMessage;
          } catch {
            // Fall back to the status-based message if JSON parsing fails.
          }
          throw new Error(errorMessage);
        }

        const audioBlob = await response.blob();
        if (!audioBlob.size) {
          throw new Error("TTS response was empty");
        }

        if (playbackTokenRef.current !== token) return;

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audioUrlRef.current = audioUrl;
        audioRef.current = audio;
        completionModeRef.current = "audio";

        audio.onended = () => {
          if (playbackTokenRef.current !== token) return;
          cleanupAudio();
          finishAssistantSpeech(kind);
        };

        audio.onerror = () => {
          if (playbackTokenRef.current !== token) return;
          cleanupAudio();
          completionModeRef.current = "bubble";
        };

        await audio.play();
      } catch (error) {
        console.error("Audio playback failed", error);
        if (playbackTokenRef.current === token) {
          cleanupAudio();
          completionModeRef.current = "bubble";
        }
      }
    },
    [cleanupAudio, finishAssistantSpeech, language]
  );

  // Load summary from LocalStorage on mount
  useEffect(() => {
    const savedSummary = localStorage.getItem("memento_summary");
    if (savedSummary) setSummary(savedSummary);
  }, []);

  // Greeting logic
  useEffect(() => {
    if (greetingDone.current) return;

    greetingDone.current = true;
    const timer = setTimeout(() => {
      setBubbleText(GREETING_TEXT);
      setMessages([
        {
          id: nextMessageId(),
          role: "assistant",
          text: GREETING_TEXT, // TODO: vary the greeting based on time of day or randomly select from a list
          timestamp: Date.now(),
        },
      ]);
      activeSpeechKindRef.current = "greeting";
      completionModeRef.current = "bubble";
      dispatch({ type: "START_GREETING" });
    }, 800); // 800 ms

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Create the VAD instance lazily (only on first mic press)
  const initVAD = useCallback(async () => {
    if (vadRef.current || vadInitializingRef.current) return vadRef.current;
    vadInitializingRef.current = true;

    try {
      const instance = await MicVAD.new({
        redemptionMs: VAD_REDEMPTION_MS,

        baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web/dist/",
        onnxWASMBasePath: "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/",

        onVADMisfire: () => {
          console.log("[VAD] Misfire (false positive)");
        },

        onSpeechStart: () => {
          playbackTokenRef.current += 1;
          // cleanup audio inline
          const a = audioRef.current;
          if (a) { a.pause(); a.src = ""; audioRef.current = null; }
          if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
          completionModeRef.current = "bubble";
          activeSpeechKindRef.current = null;

          setBubbleText("");
          dispatchRef.current({ type: "START_LISTENING" });
        },

        onSpeechEnd: async (audio) => {
          console.log("[VAD] Speech ended! Starting processing...");
          vadRef.current?.pause();
          setVadListening(false);

          dispatchRef.current({ type: "STOP_LISTENING" });
          dispatchRef.current({ type: "START_THINKING" });
          setBubbleText("...");

          try {
            const wavBuffer = utils.encodeWAV(audio);
            const audioBlob = new Blob([wavBuffer], { type: "audio/wav" });

            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.wav");
            formData.append("sessionId", sessionIdRef.current);
            formData.append("history", JSON.stringify(messagesRef.current));
            formData.append("summary", summaryRef.current);

            console.log("Sending audio, previous convo history, and summary to backend for processing...");

            const response = await fetch("/api/process-audio", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            const userTranscript = data.userText;
            const aiReply = data.aiText;

            if (data.summary) {
              setSummary(data.summary);
              localStorage.setItem("memento_summary", data.summary);
              console.log("Updated summary received from backend:\n", data.summary, "\n-------------------");
            }
            setMessages((prev) => [
              ...prev,
              {
                id: nextMessageId(),
                role: "user",
                text: userTranscript,
                timestamp: Date.now(),
              },
              {
                id: nextMessageId(),
                role: "assistant",
                text: aiReply,
                timestamp: Date.now() + 1,
              },
            ]);

            setBubbleText(aiReply);
            dispatchRef.current({ type: "START_SPEAKING", text: aiReply });
            // Play TTS - inline to avoid stale closure
            activeSpeechKindRef.current = "speaking";
            completionModeRef.current = "bubble";
            const token = ++playbackTokenRef.current;
            try {
              const ttsResponse = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: aiReply, language: "en" }),
              });
              if (ttsResponse.ok) {
                const ttsBlob = await ttsResponse.blob();
                if (ttsBlob.size && playbackTokenRef.current === token) {
                  const url = URL.createObjectURL(ttsBlob);
                  const el = new Audio(url);
                  audioUrlRef.current = url;
                  audioRef.current = el;
                  completionModeRef.current = "audio";
                  el.onended = () => {
                    if (playbackTokenRef.current !== token) return;
                    el.pause(); el.src = ""; audioRef.current = null;
                    URL.revokeObjectURL(url); audioUrlRef.current = null;
                    if (activeSpeechKindRef.current === "speaking") {
                      activeSpeechKindRef.current = null;
                      completionModeRef.current = "bubble";
                      dispatchRef.current({ type: "SPEAKING_DONE" });
                    }
                  };
                  el.onerror = () => {
                    if (playbackTokenRef.current === token) completionModeRef.current = "bubble";
                  };
                  await el.play();
                }
              }
            } catch (ttsErr) {
              console.error("TTS playback failed", ttsErr);
              completionModeRef.current = "bubble";
            }
          } catch (error) {
            console.error("Server request failed", error);
            setBubbleText(
              "I'm sorry, I couldn't process your voice right now. Please try speaking again.",
            );
            dispatchRef.current({ type: "SPEAKING_DONE" });
          }
        },
      });

      vadRef.current = instance;
      vadInitializingRef.current = false;
      return instance;
    } catch (error) {
      vadInitializingRef.current = false;
      console.error("Failed to initialize VAD:", error);
      throw error;
    }
  }, []);

  const addAssistantMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextMessageId(),
        role: "assistant",
        text,
        timestamp: Date.now(),
      },
    ]);
    setBubbleText(text);
    dispatch({ type: "START_SPEAKING", text });
  }, [dispatch]);

  const handleMicPress = useCallback(async () => {
    if (
      !greetingPlaybackAttemptedRef.current &&
      activeSpeechKindRef.current === "greeting" &&
      bubbleText === GREETING_TEXT
    ) {
      greetingPlaybackAttemptedRef.current = true;
      void playAssistantAudio(GREETING_TEXT, "greeting");
      return;
    }

    // If VAD is already running, pause it
    if (vadRef.current && vadListening) {
      vadRef.current.pause();
      setVadListening(false);
      return;
    }

    // Initialize VAD on first use, then start
    try {
      setBubbleText("Starting microphone...");
      const vad = await initVAD();
      if (vad) {
        vad.start();
        setVadListening(true);
        setBubbleText("");
      }
    } catch (error) {
      console.error("Microphone failed to start:", error);
      setBubbleText("Microphone access is not available. Please allow microphone permissions and reload the page.");
      dispatch({ type: "START_SPEAKING", text: "Microphone access is not available." });
      setTimeout(() => dispatch({ type: "SPEAKING_DONE" }), 3000);
    }
  }, [bubbleText, playAssistantAudio, initVAD, vadListening, dispatch]);

  // Same cleanup callbacks so HomeScreen doesn't break
  const handleGreetingComplete = useCallback(() => {
    if (
      completionModeRef.current === "bubble" &&
      activeSpeechKindRef.current === "greeting"
    ) {
      setTimeout(() => {
        if (
          completionModeRef.current === "bubble" &&
          activeSpeechKindRef.current === "greeting"
        ) {
          finishAssistantSpeech("greeting");
        }
      }, 2000);
    }
  }, [finishAssistantSpeech]);

  const handleSpeakingComplete = useCallback(() => {
    if (
      completionModeRef.current === "bubble" &&
      activeSpeechKindRef.current === "speaking"
    ) {
      setTimeout(() => {
        if (
          completionModeRef.current === "bubble" &&
          activeSpeechKindRef.current === "speaking"
        ) {
          finishAssistantSpeech("speaking");
        }
      }, 2000);
    }
  }, [finishAssistantSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      vadRef.current?.pause();
      vadRef.current?.destroy();
      vadRef.current = null;
    };
  }, [cleanupAudio]);

  // Return the EXACT same shape as the mock hook
  return {
    bubbleText,
    messages,
    sessionId: sessionIdRef.current,
    handleMicPress,
    handleGreetingComplete,
    handleSpeakingComplete,
    addAssistantMessage,
  };
}
