export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export interface ConversationScenario {
  userPrompt: string;
  response: string;
}
