"use client";

interface PillButtonProps {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

export default function PillButton({
  icon,
  label,
  onClick,
  className = "",
}: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`glass-heavy flex items-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] text-sm font-semibold text-navy transition-transform active:scale-95 ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
