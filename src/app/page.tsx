"use client";

import React, { useState, useEffect, useRef } from 'react';

const wordPairs = [
  ["kot", "cat"],
  ["pies", "dog"],
  ["dom", "house"],
  ["jabłko", "apple"],
  ["samochód", "car"],
  ["drzewo", "tree"],
  ["krzesło", "chair"],
  ["woda", "water"],
  ["słońce", "sun"],
  ["księżyc", "moon"],
  ["chleb", "bread"],
  ["ser", "cheese"],
  ["telefon", "phone"],
  ["komputer", "computer"],
  ["okno", "window"],
  ["drzwi", "door"],
  ["biurko", "desk"],
  ["długopis", "pen"],
  ["papier", "paper"],
  ["książka", "book"]
];

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

const WordMatching = () => {
  const [gamePairs, setGamePairs] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [incorrect, setIncorrect] = useState([]);
  const currentIndexRef = useRef(0);

  const loadInitialPairs = () => {
    const pairs = wordPairs.slice(currentIndexRef.current, currentIndexRef.current + 7);
    currentIndexRef.current += 7;
    const formatted = pairs.flatMap((pair, i) => [
      { id: `pl-${i + currentIndexRef.current}`, word: pair[0], lang: 'pl', pair },
      { id: `en-${i + currentIndexRef.current}`, word: pair[1], lang: 'en', pair }
    ]);
    setGamePairs(shuffleArray(formatted));
  };

  useEffect(() => {
    loadInitialPairs();
  }, []);

  const handleClick = (item) => {
    if (matchedIds.includes(item.id) || incorrect.includes(item.id)) return;

    if (selected.length === 0) {
      setSelected([item]);
    } else if (selected.length === 1) {
      const first = selected[0];
      if (first.lang === item.lang) {
        setSelected([item]);
        return;
      }

      if (first.pair[0] === item.pair[0] && first.pair[1] === item.pair[1]) {
        setMatchedIds(prev => [...prev, first.id, item.id]);
        setSelected([]);
      } else {
        setIncorrect([first.id, item.id]);
        setTimeout(() => {
          setIncorrect([]);
          setSelected([]);
        }, 1000);
      }
    }
  };

  const getClass = (item) => {
    const isSelected = selected.some(sel => sel.id === item.id);
    const isMatched = matchedIds.includes(item.id);
    const isIncorrect = incorrect.includes(item.id);

    if (isMatched) return 'bg-green-500 text-white invisible';
    if (isIncorrect) return 'bg-red-500 text-white';
    if (isSelected) return 'bg-blue-500 text-white';
    return 'bg-gray-900 text-white hover:bg-gray-800'; // tło ciemne, tekst biały
  };

  const leftItems = gamePairs.filter(p => p.lang === 'pl');
  const rightItems = gamePairs.filter(p => p.lang === 'en');

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="grid grid-cols-2 gap-16">
        <div className="grid grid-rows-7 gap-4">
          {leftItems.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border border-gray-700 shadow-md text-center cursor-pointer transition-colors duration-300 ${getClass(item)}`}
              onClick={() => handleClick(item)}
            >
              {item.word}
            </div>
          ))}
        </div>
        <div className="grid grid-rows-7 gap-4">
          {rightItems.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border border-gray-700 shadow-md text-center cursor-pointer transition-colors duration-300 ${getClass(item)}`}
              onClick={() => handleClick(item)}
            >
              {item.word}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordMatching;
