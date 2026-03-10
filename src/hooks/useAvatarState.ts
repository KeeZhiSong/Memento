"use client";

import { useContext } from "react";
import { AvatarStateMachineContext } from "@/components/avatar/AvatarStateMachine";

export function useAvatarState() {
  const { context, dispatch } = useContext(AvatarStateMachineContext);
  return { ...context, dispatch };
}
