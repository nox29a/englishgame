"use client"

import { useEffect, useState } from "react";

// Typy

type Word = {
  id: number;
  pl: string;
  en: string;
};

type SlotWord = {
  id: number | null;
  word: string | null;
};

type Difficulty = "easy" | "medium" | "hard";

// Dane

const easyWords: Word[] = [
  { id: 1, pl: "pies", en: "dog" },
  { id: 2, pl: "kot", en: "cat" },
  { id: 3, pl: "dom", en: "house" },
  { id: 4, pl: "woda", en: "water" },
  { id: 5, pl: "chleb", en: "bread" },
  { id: 6, pl: "oko", en: "eye" },
  { id: 7, pl: "ucho", en: "ear" },
  { id: 8, pl: "noga", en: "leg" },
  { id: 9, pl: "dziecko", en: "child" },
  { id: 10, pl: "matka", en: "mother" },
];

const mediumWords: Word[] = [
  { id: 11, pl: "rower", en: "bike" },
  { id: 12, pl: "krzesło", en: "chair" },
  { id: 13, pl: "drzewo", en: "tree" },
  { id: 14, pl: "morze", en: "sea" },
  { id: 15, pl: "samochód", en: "car" },
  { id: 16, pl: "zegarek", en: "watch" },
  { id: 17, pl: "komputer", en: "computer" },
  { id: 18, pl: "szkoła", en: "school" },
  { id: 19, pl: "apteka", en: "pharmacy" },
  { id: 20, pl: "ogród", en: "garden" },
];

const hardWords: Word[] = [
  { id: 21, pl: "przyzwoitość", en: "decency" },
  { id: 22, pl: "samozaparcie", en: "willpower" },
  { id: 23, pl: "odpowiedzialność", en: "responsibility" },
  { id: 24, pl: "wytrzymałość", en: "endurance" },
  { id: 25, pl: "nienawiść", en: "hatred" },
  { id: 26, pl: "zmartwienie", en: "worry" },
  { id: 27, pl: "przeznaczenie", en: "destiny" },
  { id: 28, pl: "szczerość", en: "honesty" },
  { id: 29, pl: "ciekawość", en: "curiosity" },
  { id: 30, pl: "niedoskonałość", en: "imperfection" },
];

const SLOT_COUNT = 5;

// Komponent

export default function WordMatchGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [words, setWords] = useState<Word[]>(easyWords);
  const [plSlots, setPlSlots] = useState<SlotWord[]>(
    Array(SLOT_COUNT).fill({ id: null, word: null })
  );
  const [enSlots, setEnSlots] = useState<SlotWord[]>(
    Array(SLOT_COUNT).fill({ id: null, word: null })
  );
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<{
    side: "pl" | "en";
    slotIndex: number;
    id: number;
  } | null>(null);
  const [error, setError] = useState<{
    side: "pl" | "en";
    slotIndex: number;
  } | null>(null);
  const [correctHighlight, setCorrectHighlight] = useState<
    { plIndex: number; enIndex: number } | null
  >(null);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const shuffleArray = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

  const getEmptySlots = (slots: SlotWord[]) =>
    slots.map((slot, idx) => (slot.id === null ? idx : -1)).filter((i) => i !== -1);

  const addNewPairs = (n: number) => {
    let plCopy = [...plSlots];
    let enCopy = [...enSlots];
    let used = [...usedIds];

    const emptyPlSlots = shuffleArray(getEmptySlots(plCopy));
    const emptyEnSlots = shuffleArray(getEmptySlots(enCopy));
    const slotsToFill = Math.min(emptyPlSlots.length, emptyEnSlots.length, n);
    const candidates = shuffleArray(words.filter((w) => !used.includes(w.id))).slice(
      0,
      slotsToFill
    );

    for (let i = 0; i < slotsToFill; i++) {
      const word = candidates[i];
      plCopy[emptyPlSlots[i]] = { id: word.id, word: word.pl };
      enCopy[emptyEnSlots[i]] = { id: word.id, word: word.en };
      used.push(word.id);
    }

    setPlSlots(plCopy);
    setEnSlots(enCopy);
    setUsedIds(used);
  };

  useEffect(() => {
    setUsedIds([]);
    setPlSlots(Array(SLOT_COUNT).fill({ id: null, word: null }));
    setEnSlots(Array(SLOT_COUNT).fill({ id: null, word: null }));
    setSelected(null);
    setCorrectHighlight(null);
    setError(null);
    setScore(0);
    setStartTime(Date.now());

    setWords(
      difficulty === "easy"
        ? easyWords
        : difficulty === "medium"
        ? mediumWords
        : hardWords
    );

    setTimeout(() => addNewPairs(SLOT_COUNT), 100);
  }, [difficulty]);

  const handleClick = (side: "pl" | "en", slotIndex: number) => {
    const slots = side === "pl" ? plSlots : enSlots;
    const slot = slots[slotIndex];
    if (!slot.id || (error && error.side === side && error.slotIndex === slotIndex) || correctHighlight)
      return;

    if (!selected) {
      setSelected({ side, slotIndex, id: slot.id });
      return;
    }

    if (selected.side === side && selected.slotIndex === slotIndex) {
      setSelected(null);
      return;
    }

    if (selected.id === slot.id && selected.side !== side) {
      const plIndex = side === "pl" ? slotIndex : selected.slotIndex;
      const enIndex = side === "en" ? slotIndex : selected.slotIndex;

      setCorrectHighlight({ plIndex, enIndex });
      setSelected(null);
      setScore((s) => s + 1);

      setTimeout(() => {
        setPlSlots((prev) =>
          prev.map((s, i) => (i === plIndex ? { id: null, word: null } : s))
        );
        setEnSlots((prev) =>
          prev.map((s, i) => (i === enIndex ? { id: null, word: null } : s))
        );
        setCorrectHighlight(null);
        const totalWords =
          plSlots.filter((s) => s.id !== null).length +
          enSlots.filter((s) => s.id !== null).length;
        if (totalWords - 2 < 6) addNewPairs(2);
      }, 500);

      return;
    }

    setError({ side, slotIndex });
    setSelected(null);
    setTimeout(() => setError(null), 1000);
  };

  const getButtonClass = (
    side: "pl" | "en",
    slotIndex: number,
    slot: SlotWord
  ) => {
    let base =
      "px-4 py-2 rounded-xl text-left shadow transition-colors duration-300 cursor-pointer select-none h-12 flex items-center ";

    if (slot.id === null) return base + "bg-transparent cursor-default";

    if (
      correctHighlight &&
      ((side === "pl" && correctHighlight.plIndex === slotIndex) ||
        (side === "en" && correctHighlight.enIndex === slotIndex))
    ) {
      return base + "bg-green-400 text-white";
    }

    if (error && error.side === side && error.slotIndex === slotIndex) {
      return base + "bg-red-400 text-white";
    }

    if (selected && selected.side === side && selected.slotIndex === slotIndex) {
      return base + "bg-blue-400 text-white";
    }

    return base + "bg-gray-700 border border-gray-600 text-white hover:bg-gray-600";
  };

  const gameTime = Math.floor((now - startTime) / 1000);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Trener słówek</h1>

      {/* Poziomy */}
      <div className="mb-6 flex gap-4">
        {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-600 transition-colors duration-200
              ${
                difficulty === level
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            <span>
              {level === "easy"
                ? "⭐"
                : level === "medium"
                ? "⭐⭐"
                : "⭐⭐⭐"}
            </span>
            {level === "easy"
              ? "Łatwy"
              : level === "medium"
              ? "Średni"
              : "Trudny"}
          </button>
        ))}
      </div>

      {/* Plansza */}
      <div className="flex justify-between w-full max-w-4xl gap-6">
        <div className="w-1/2 flex flex-col gap-4">
          {plSlots.map((slot, idx) => (
            <button
              key={"pl" + idx}
              onClick={() => handleClick("pl", idx)}
              className={getButtonClass("pl", idx, slot)}
              disabled={slot.id === null || Boolean(correctHighlight)}
            >
              {slot.word ?? "\u00A0"}
            </button>
          ))}
        </div>
        <div className="w-1/2 flex flex-col gap-4">
          {enSlots.map((slot, idx) => (
            <button
              key={"en" + idx}
              onClick={() => handleClick("en", idx)}
              className={getButtonClass("en", idx, slot)}
              disabled={slot.id === null || Boolean(correctHighlight)}
            >
              {slot.word ?? "\u00A0"}
            </button>
          ))}
        </div>
      </div>

      {/* Statystyki */}
      <div className="mt-8 text-lg text-gray-300">
        <p>
          Punkty: <strong>{score}</strong>
        </p>
        <p>
          Czas gry: <strong>{gameTime}s</strong>
        </p>
      </div>
    </div>
  );
}
