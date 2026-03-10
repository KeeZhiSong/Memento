"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface BackgroundOption {
  id: string;
  label: string;
  webp: string;
  png: string;
}

export const BACKGROUNDS: BackgroundOption[] = [
  {
    id: "living-room",
    label: "Living Room",
    webp: "/assets/images/bg-living-room.webp",
    png: "/assets/images/bg-living-room.png",
  },
  {
    id: "playground",
    label: "Playground",
    webp: "/assets/images/bg-playground.webp",
    png: "/assets/images/bg-playground.png",
  },
];

const STORAGE_KEY = "memento-background";

interface BackgroundContextValue {
  background: BackgroundOption;
  setBackground: (id: string) => void;
}

const BackgroundContext = createContext<BackgroundContextValue>({
  background: BACKGROUNDS[0],
  setBackground: () => {},
});

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [background, setBackgroundState] = useState<BackgroundOption>(BACKGROUNDS[0]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = BACKGROUNDS.find((b) => b.id === saved);
      if (found) setBackgroundState(found);
    }
  }, []);

  const setBackground = (id: string) => {
    const found = BACKGROUNDS.find((b) => b.id === id);
    if (found) {
      setBackgroundState(found);
      localStorage.setItem(STORAGE_KEY, id);
    }
  };

  return (
    <BackgroundContext.Provider value={{ background, setBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  return useContext(BackgroundContext);
}
