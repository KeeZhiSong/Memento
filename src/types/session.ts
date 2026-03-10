export type SessionPhase =
  | "idle"            // No session, mic button shows "tap to talk"
  | "connecting"      // Fetching token + connecting to LiveKit
  | "active"          // LiveKit room connected, agent present
  | "disconnecting";  // Tearing down session

export const IDLE_TIMEOUT_MS = 30_000;
