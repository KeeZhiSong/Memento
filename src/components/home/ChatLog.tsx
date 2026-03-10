"use client";

import { useEffect, useRef, useState } from "react";
import { ConversationMessage } from "@/types/conversation";

interface ChatLogProps {
  isOpen: boolean;
  messages: ConversationMessage[];
  onClose: () => void;
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function ChatLog({ isOpen, messages, onClose }: ChatLogProps) {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (animateIn && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [animateIn, messages.length]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(44, 62, 80, 0.4)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: animateIn ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative flex flex-col rounded-t-3xl overflow-hidden safe-bottom transition-transform duration-300 ease-out"
        style={{
          height: "85%",
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          borderBottom: "none",
          transform: animateIn ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-navy/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-1">
          <h2 className="text-lg font-bold text-navy">Chat Log</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-navy/60 active:scale-90 transition-transform"
            style={{ background: "rgba(44, 62, 80, 0.08)" }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-navy/10" />

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-navy/40 text-sm font-medium">No messages yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-3"
                    style={
                      msg.role === "assistant"
                        ? {
                            background: "rgba(255, 255, 255, 0.6)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                          }
                        : {
                            background: "linear-gradient(135deg, rgba(91, 158, 166, 0.25), rgba(245, 166, 184, 0.25))",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 255, 255, 0.25)",
                          }
                    }
                  >
                    <p className={`text-sm leading-relaxed ${msg.role === "assistant" ? "text-navy" : "text-navy"}`}>
                      {msg.text}
                    </p>
                  </div>
                  <span className="text-[11px] text-navy/35 mt-1 px-1 font-medium">
                    {msg.role === "assistant" ? "Memento" : "You"} · {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
