import { AvatarContext, AvatarEvent, AvatarState } from "@/types/avatar";

export const initialAvatarContext: AvatarContext = {
  state: "idle",
  currentText: "",
  displayedText: "",
};

export function avatarReducer(
  context: AvatarContext,
  event: AvatarEvent
): AvatarContext {
  switch (event.type) {
    case "START_GREETING":
      return { ...context, state: "greeting" as AvatarState };

    case "GREETING_DONE":
      return { ...context, state: "idle" as AvatarState };

    case "START_LISTENING":
      if (context.state === "idle" || context.state === "greeting") {
        return {
          ...context,
          state: "listening" as AvatarState,
          currentText: "",
          displayedText: "",
        };
      }
      return context;

    case "STOP_LISTENING":
      if (context.state === "listening") {
        return { ...context, state: "thinking" as AvatarState };
      }
      return context;

    case "START_THINKING":
      return { ...context, state: "thinking" as AvatarState };

    case "START_SPEAKING":
      return {
        ...context,
        state: "speaking" as AvatarState,
        currentText: event.text,
        displayedText: "",
      };

    case "SPEAKING_DONE":
      return { ...context, state: "idle" as AvatarState };

    case "RESET":
      return initialAvatarContext;

    default:
      return context;
  }
}
