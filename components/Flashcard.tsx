
import React from 'react';
import { KanaItem, AIHelp, StudyMode } from '../types';

interface FlashcardProps {
  item: KanaItem | null;
  isFlipped: boolean;
  onFlip: () => void;
  aiHelp: AIHelp | null;
  isLoadingAi: boolean;
  studyMode: StudyMode;
}

const Flashcard: React.FC<FlashcardProps> = ({ item, isFlipped, onFlip, aiHelp, isLoadingAi, studyMode }) => {
  if (!item) {
    return (
      <div className="w-full max-w-sm h-80 flex items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-300">
        <p className="text-slate-400 italic">Select characters and press Randomize</p>
      </div>
    );
  }

  const isCharFirst = studyMode === 'char-first';

  return (
    <div className="w-full max-w-sm h-96 perspective-1000 cursor-pointer group" onClick={onFlip}>
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl border border-slate-100">
          <span className={`${isCharFirst ? 'text-9xl' : 'text-7xl'} font-bold text-slate-800 mb-4`}>
            {isCharFirst ? item.char : item.romaji}
          </span>
          <span className="text-sm uppercase tracking-widest text-indigo-500 font-semibold">
            {isCharFirst ? item.type : 'Romaji'}
          </span>
          <div className="absolute bottom-6 text-slate-300 text-xs animate-pulse">Click to Reveal</div>
        </div>

        {/* Back Side (Answer Side) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-between p-8 bg-indigo-50 rounded-3xl shadow-xl border border-indigo-100">
          <div className="flex flex-col items-center mt-4">
            <span className={`${isCharFirst ? 'text-6xl' : 'text-8xl'} font-bold text-indigo-600`}>
              {isCharFirst ? item.romaji : item.char}
            </span>
            <span className="text-xl text-slate-500 mt-2">
              {isCharFirst ? item.char : item.romaji}
            </span>
          </div>

          <div className="w-full flex flex-col gap-4 text-sm text-slate-700 overflow-y-auto max-h-48 scrollbar-hide">
            {isLoadingAi ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-indigo-400">Loading AI Mnemonic...</span>
              </div>
            ) : aiHelp ? (
              <>
                <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                  <h4 className="font-bold text-indigo-600 mb-1">Mnemonic:</h4>
                  <p className="italic leading-snug">{aiHelp.mnemonic}</p>
                </div>
                {aiHelp.examples.length > 0 && (
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                    <h4 className="font-bold text-indigo-600 mb-1">Examples:</h4>
                    <ul className="space-y-1">
                      {aiHelp.examples.map((ex, i) => (
                        <li key={i}><span className="font-medium">{ex.word}:</span> {ex.meaning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
               <div className="text-center py-4 text-slate-400 text-xs">AI insights only available on flip</div>
            )}
          </div>

          <div className="text-xs text-indigo-300">Tap to flip back</div>
        </div>

      </div>
    </div>
  );
};

export default Flashcard;
