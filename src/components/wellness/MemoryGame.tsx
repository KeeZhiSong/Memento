"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import MemoryCard from "./MemoryCard";

const EMOJIS = ["🍎", "🌻", "🐱", "🦋", "🐢", "🌈"];
const STORAGE_KEY = "memento-memory-game";

interface Card {
  id: number;
  emoji: string;
  pairId: number;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createDeck(): Card[] {
  const pairs = EMOJIS.flatMap((emoji, i) => [
    { id: i * 2, emoji, pairId: i },
    { id: i * 2 + 1, emoji, pairId: i },
  ]);
  return shuffle(pairs);
}

function loadBestScore(): number | null {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? Number(val) : null;
  } catch {
    return null;
  }
}

function saveBestScore(score: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
  } catch {}
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(() => createDeck());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setBestScore(loadBestScore());
  }, []);

  const handleCardClick = useCallback(
    (index: number) => {
      if (isChecking) return;
      if (flippedIndices.includes(index)) return;
      if (matchedPairIds.has(cards[index].pairId)) return;

      const newFlipped = [...flippedIndices, index];
      setFlippedIndices(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        setIsChecking(true);

        const [first, second] = newFlipped;
        if (cards[first].pairId === cards[second].pairId) {
          // Match found
          const newMatched = new Set(matchedPairIds);
          newMatched.add(cards[first].pairId);
          setMatchedPairIds(newMatched);
          setFlippedIndices([]);
          setIsChecking(false);

          if (newMatched.size === EMOJIS.length) {
            const finalMoves = moves + 1;
            setIsComplete(true);
            const currentBest = loadBestScore();
            if (currentBest === null || finalMoves < currentBest) {
              saveBestScore(finalMoves);
              setBestScore(finalMoves);
            }
          }
        } else {
          // No match — flip back after delay
          setTimeout(() => {
            setFlippedIndices([]);
            setIsChecking(false);
          }, 1000);
        }
      }
    },
    [cards, flippedIndices, matchedPairIds, moves, isChecking]
  );

  function handlePlayAgain() {
    setCards(createDeck());
    setFlippedIndices([]);
    setMatchedPairIds(new Set());
    setMoves(0);
    setIsComplete(false);
    setIsChecking(false);
  }

  return (
    <div className="h-[100dvh] overflow-y-auto bg-cream-50 pt-24 px-5 pb-10">
      <div className="max-w-md mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/wellness"
            className="glass rounded-full px-4 py-2 text-sm font-semibold text-navy active:scale-95 transition-transform"
          >
            ← Back
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold text-navy">
            <span>Moves: {moves}</span>
            {bestScore !== null && (
              <span className="text-navy/50">Best: {bestScore}</span>
            )}
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card, index) => (
            <MemoryCard
              key={card.id}
              emoji={card.emoji}
              isFlipped={flippedIndices.includes(index)}
              isMatched={matchedPairIds.has(card.pairId)}
              onClick={() => handleCardClick(index)}
              disabled={isChecking || flippedIndices.length >= 2}
            />
          ))}
        </div>
      </div>

      {/* Win Overlay */}
      {isComplete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/40 backdrop-blur-sm">
          <div className="glass-heavy rounded-3xl p-8 mx-6 text-center max-w-sm w-full">
            <span className="text-5xl block mb-4">🎉</span>
            <h2 className="text-2xl font-bold text-navy mb-2">Well Done!</h2>
            <p className="text-navy/70 mb-1">
              You matched all pairs in <span className="font-bold text-navy">{moves}</span> moves
            </p>
            {bestScore !== null && (
              <p className="text-sm text-navy/50 mb-6">
                Your best: {bestScore} moves
              </p>
            )}
            <button
              onClick={handlePlayAgain}
              className="glass rounded-full px-8 py-3 font-semibold text-navy active:scale-95 transition-transform min-h-12"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
