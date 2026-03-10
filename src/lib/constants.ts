import { NavTab } from "@/types/navigation";

export const NAV_TABS: NavTab[] = [
  { id: "home", label: "Home", href: "/home", icon: "home" },
  { id: "wellness", label: "Wellness", href: "/wellness", icon: "heart" },
  { id: "reminders", label: "Reminders", href: "/reminders", icon: "bell" },
  { id: "schedule", label: "Schedule", href: "/schedule", icon: "calendar" },
  { id: "settings", label: "Settings", href: "/settings", icon: "settings" },
];

export const TYPEWRITER_SPEED = 35; // ms per character
export const LISTENING_DURATION = 2000; // ms
export const THINKING_DURATION = 1500; // ms
