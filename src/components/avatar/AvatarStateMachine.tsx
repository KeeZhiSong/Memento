"use client";

import { createContext, ReactNode, useCallback, useReducer } from "react";
import {
  avatarReducer,
  initialAvatarContext,
} from "@/lib/avatar-state-machine";
import { AvatarContext, AvatarEvent } from "@/types/avatar";

interface AvatarStateMachineContextValue {
  context: AvatarContext;
  dispatch: (event: AvatarEvent) => void;
}

export const AvatarStateMachineContext =
  createContext<AvatarStateMachineContextValue>({
    context: initialAvatarContext,
    dispatch: () => {},
  });

export default function AvatarStateMachineProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [context, rawDispatch] = useReducer(avatarReducer, initialAvatarContext);

  const dispatch = useCallback((event: AvatarEvent) => {
    rawDispatch(event);
  }, []);

  return (
    <AvatarStateMachineContext.Provider value={{ context, dispatch }}>
      {children}
    </AvatarStateMachineContext.Provider>
  );
}
