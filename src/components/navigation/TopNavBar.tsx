"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavTabs } from "@/lib/constants";
import NavIcon from "./NavIcon";
import { useLanguage } from "@/hooks/useLanguage";
import { useMode } from "@/hooks/useMode";
import { useNotifications } from "@/hooks/useNotifications";

const NAV_LABEL_KEYS: Record<string, string> = {
  home: "nav.home",
  dashboard: "nav.dashboard",
  wellness: "nav.wellness",
  reminders: "nav.reminders",
  schedule: "nav.schedule",
  settings: "nav.settings",
};

export default function TopNavBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { mode } = useMode();
  const { count } = useNotifications();
  const tabs = getNavTabs(mode);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 safe-top">
      <div
        className="mx-3 mt-2 flex items-center justify-around rounded-2xl border border-white/60 px-2 py-1.5 shadow-lg backdrop-blur-xl"
        style={{ background: "rgba(255, 255, 255, 0.55)" }}
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const showBadge = tab.id === "dashboard" && count > 0;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[48px] min-h-[48px] justify-center transition-colors ${
                isActive
                  ? "bg-white/70 text-navy"
                  : "text-navy/75 hover:text-navy"
              }`}
            >
              <NavIcon icon={tab.icon} className="w-5 h-5" />
              {showBadge && (
                <span className="absolute top-0.5 right-1 w-4 h-4 rounded-full bg-warm-pink text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
              <span className="text-[10px] font-semibold leading-tight">
                {t(NAV_LABEL_KEYS[tab.id] ?? tab.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
