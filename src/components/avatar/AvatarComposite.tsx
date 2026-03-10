"use client";

import { ReactNode, useState } from "react";
import { AvatarState } from "@/types/avatar";
import AvatarVideo from "./AvatarVideo";
import { useBackground } from "@/hooks/useBackground";

interface AvatarCompositeProps {
  state: AvatarState;
  children?: ReactNode;
}

export default function AvatarComposite({ state, children }: AvatarCompositeProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { background } = useBackground();

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Layer 0: Background image */}
      <picture className="absolute inset-0">
        <source srcSet={background.webp} type="image/webp" />
        <img
          src={background.png}
          alt=""
          className="h-full w-full object-cover"
          role="presentation"
        />
      </picture>

      {/* Vignette overlay for depth */}
      <div className="vignette absolute inset-0" />

      {/* Layer 1: Avatar video with canvas chromakey */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center h-[85%]">
        <div
          className={`h-full transition-opacity duration-700 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <AvatarVideo state={state} onLoad={() => setVideoLoaded(true)} />
        </div>
      </div>

      {/* Layer 2: UI overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto h-full">{children}</div>
      </div>
    </div>
  );
}
