"use client";

interface MemoryCardProps {
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  disabled: boolean;
}

export default function MemoryCard({ emoji, isFlipped, isMatched, onClick, disabled }: MemoryCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="aspect-square [perspective:600px] w-full"
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped || isMatched ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Back face (question mark - visible when not flipped) */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl glass flex items-center justify-center active:scale-95 transition-transform">
          <span className="text-3xl font-bold text-navy/40 select-none">?</span>
        </div>

        {/* Front face (emoji - visible when flipped) */}
        <div
          className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl glass-heavy flex items-center justify-center ${
            isMatched ? "ring-2 ring-sage" : ""
          }`}
        >
          <span className="text-4xl select-none">{emoji}</span>
        </div>
      </div>
    </button>
  );
}
