export type AvatarState = "idle" | "greeting" | "listening" | "thinking" | "speaking";

export type AvatarEvent =
  | { type: "START_GREETING" }
  | { type: "GREETING_DONE" }
  | { type: "START_LISTENING" }
  | { type: "STOP_LISTENING" }
  | { type: "START_THINKING" }
  | { type: "START_SPEAKING"; text: string }
  | { type: "SPEAKING_DONE" }
  | { type: "RESET" };

export interface AvatarContext {
  state: AvatarState;
  currentText: string;
  displayedText: string;
}

export const AVATAR_VIDEO_SPEED: Record<AvatarState, number> = {
  idle: 1,
  greeting: 1,
  listening: 0.8,
  thinking: 0.5,
  speaking: 1,
};
