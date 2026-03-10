"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AvatarState } from "@/types/avatar";

interface AvatarVideoSources {
  webm: string;
  mp4: string;
}

export type ChromakeyMode = "black" | "green";

export interface AvatarOption {
  id: string;
  label: string;
  poster: string;
  chromakey: ChromakeyMode;
  /** Maps each avatar state to a video. If a state is missing, falls back to "idle". */
  videos: Partial<Record<AvatarState, AvatarVideoSources>> & {
    idle: AvatarVideoSources;
  };
}

export const AVATARS: AvatarOption[] = [
  {
    id: "default",
    label: "Memento",
    poster: "/assets/videos/avatar-idle-poster.webp",
    chromakey: "black",
    videos: {
      idle: {
        webm: "/assets/videos/avatar-idle.webm",
        mp4: "/assets/videos/avatar-idle.mp4",
      },
    },
  },
  {
    id: "dog",
    label: "Buddy",
    poster: "/assets/videos/dog-idle-poster.webp",
    chromakey: "green",
    videos: {
      idle: {
        webm: "/assets/videos/dog-idle.webm",
        mp4: "/assets/videos/dog-idle.mp4",
      },
      listening: {
        webm: "/assets/videos/dog-attentive.webm",
        mp4: "/assets/videos/dog-attentive.mp4",
      },
      thinking: {
        webm: "/assets/videos/dog-attentive.webm",
        mp4: "/assets/videos/dog-attentive.mp4",
      },
      greeting: {
        webm: "/assets/videos/dog-happy.webm",
        mp4: "/assets/videos/dog-happy.mp4",
      },
      speaking: {
        webm: "/assets/videos/dog-happy.webm",
        mp4: "/assets/videos/dog-happy.mp4",
      },
    },
  },
];

const STORAGE_KEY = "memento-avatar";

interface AvatarContextValue {
  avatar: AvatarOption;
  setAvatar: (id: string) => void;
}

const AvatarContext = createContext<AvatarContextValue>({
  avatar: AVATARS[0],
  setAvatar: () => {},
});

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatar, setAvatarState] = useState<AvatarOption>(AVATARS[0]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = AVATARS.find((a) => a.id === saved);
      if (found) setAvatarState(found);
    }
  }, []);

  const setAvatar = (id: string) => {
    const found = AVATARS.find((a) => a.id === id);
    if (found) {
      setAvatarState(found);
      localStorage.setItem(STORAGE_KEY, id);
    }
  };

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  return useContext(AvatarContext);
}

/** Resolve the video sources for a given avatar state, falling back to idle. */
export function getVideoForState(
  avatar: AvatarOption,
  state: AvatarState
): AvatarVideoSources {
  return avatar.videos[state] ?? avatar.videos.idle;
}
