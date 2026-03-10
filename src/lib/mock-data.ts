import { ConversationScenario } from "@/types/conversation";

export const GREETING_TEXT =
  "Good morning! It's lovely to see you today. How are you feeling?";

export const MOCK_SCENARIOS: ConversationScenario[] = [
  {
    userPrompt: "I'm feeling good today",
    response:
      "That's wonderful to hear! Your daughter Sarah called earlier — she said she'll visit this Saturday for lunch. Would you like me to remind you on Friday evening?",
  },
  {
    userPrompt: "What do I have today?",
    response:
      "You have a doctor's appointment at 2pm with Dr. Tan at Mount Elizabeth. After that, your grandson Marcus has his piano recital at 5pm. Shall I set reminders?",
  },
  {
    userPrompt: "Tell me something nice",
    response:
      "Did you know that your garden roses are in bloom right now? Your neighbour Mrs. Lee mentioned they look beautiful. Maybe we could take a look after breakfast?",
  },
  {
    userPrompt: "I can't remember where I put my glasses",
    response:
      "No worries at all! Last time you mentioned putting them on the bedside table. Would you like me to help you check a few usual spots?",
  },
];

export const MOCK_USER_PROFILE = {
  name: "Ah Ma",
  preferredLanguage: "en",
  greeting: "Good morning",
};

export const MOCK_REMINDERS = [
  { id: "1", text: "Take morning medication", time: "8:00 AM", done: false },
  { id: "2", text: "Doctor appointment — Dr. Tan", time: "2:00 PM", done: false },
  { id: "3", text: "Marcus's piano recital", time: "5:00 PM", done: false },
];

export const MOCK_SCHEDULE = [
  { id: "1", title: "Breakfast", time: "7:30 AM", type: "routine" as const },
  { id: "2", title: "Morning walk", time: "9:00 AM", type: "activity" as const },
  { id: "3", title: "Dr. Tan appointment", time: "2:00 PM", type: "medical" as const },
  { id: "4", title: "Piano recital", time: "5:00 PM", type: "family" as const },
  { id: "5", title: "Dinner with family", time: "7:00 PM", type: "family" as const },
];

export const MOCK_WELLNESS_ACTIVITIES = [
  { id: "1", title: "Memory Game", description: "Match pairs of familiar objects", icon: "puzzle" as const, color: "teal" as const },
  { id: "2", title: "Story Time", description: "Continue a story together with Memento", icon: "book" as const, color: "warm-pink" as const },
  { id: "3", title: "Sing Along", description: "Sing classic favourites with lyrics on screen", icon: "music" as const, color: "sage" as const },
];

export const MOCK_WELLNESS_STREAK = { days: 5, message: "You've chatted for 5 days in a row!" };
