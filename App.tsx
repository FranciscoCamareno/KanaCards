import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_KANA, KANA_GROUPS } from './constants';
import { KanaItem, AIHelp, KanaType, StudyMode } from './types';

import Flashcard from './components/Flashcard';
import StrokeOrderViewer from './components/StrokeOrderViewer';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const DIACRITIC_GROUPS = [
  "G-series (ga, gi, gu, ge, go)",
  "Z-series (za, ji, zu, ze, zo)",
  "D-series (da, ji, zu, de, do)",
  "B-series (ba, bi, bu, be, bo)",
  "P-series (pa, pi, pu, pe, po)"
];

type ViewState = 'welcome' | 'charts' | 'study';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('welcome');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set([KANA_GROUPS[0]]));
  const [selectedTypes, setSelectedTypes] = useState<Set<KanaType>>(new Set(['hiragana']));
  const [studyMode, setStudyMode] = useState<StudyMode>('char-first');
  const [strokePreviewChar, setStrokePreviewChar] = useState<string | null>(null);
  
  const [currentItem, setCurrentItem] = useState<KanaItem | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiHelp, setAiHelp] = useState<AIHelp | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  
  const [studyQueue, setStudyQueue] = useState<KanaItem[]>([]);
  const [seenCount, setSeenCount] = useState(0);

  // Pool of filtered characters based on user selection
  const pool = useMemo(() => {
    return ALL_KANA.filter(item => 
      selectedGroups.has(item.group) && selectedTypes.has(item.type)
    );
  }, [selectedGroups, selectedTypes]);

  const hasDiacriticsEnabled = useMemo(() => {
    return DIACRITIC_GROUPS.some(group => selectedGroups.has(group));
  }, [selectedGroups]);

  const startNewRound = useCallback((sourcePool: KanaItem[]) => {
    if (sourcePool.length === 0) {
      setCurrentItem(null);
      setStudyQueue([]);
      setSeenCount(0);
      return;
    }
    const shuffled = shuffleArray(sourcePool);
    setCurrentItem(shuffled[0]);
    setStudyQueue(shuffled.slice(1));
    setSeenCount(1);
    setIsFlipped(false);
    setAiHelp(null);
  }, []);

  useEffect(() => {
    if (view === 'study' && pool.length > 0) {
      startNewRound(pool);
    }
  }, [view, pool.length]);

  const handleRandomize = useCallback(() => {
    if (pool.length === 0) return;
    
    setIsFlipped(false);
    setAiHelp(null);

    if (studyQueue.length > 0) {
      const nextItem = studyQueue[0];
      setCurrentItem(nextItem);
      setStudyQueue(prev => prev.slice(1));
      setSeenCount(prev => prev + 1);
    } else {
      // Restart shuffled deck if cards ran out
      startNewRound(pool);
    }
  }, [pool, studyQueue, startNewRound]);

  const handleFlip = async () => {
    const newFlipState = !isFlipped;
    setIsFlipped(newFlipState);
    
    if (newFlipState && currentItem && !aiHelp && !isLoadingAi) {
      setIsLoadingAi(true);
      try {
        const help = await getKanaMnemonics(currentItem.char, currentItem.romaji);
        setAiHelp(help);
      } catch (err) {
        console.error("Mnemonic fetch failed", err);
      } finally {
        setIsLoadingAi(false);
      }
    }
  };

  const toggleGroup = (group: string) => {
    const next = new Set(selectedGroups);
    if (next.has(group)) {
      if (next.size > 1) next.delete(group);
    } else {
      next.add(group);
    }
    setSelectedGroups(next);
  };

  const toggleType = (type: KanaType) => {
    const next = new Set(selectedTypes);
    if (next.has(type)) {
      if (next.size > 1) next.delete(type);
    } else {
      next.add(type);
    }
    setSelectedTypes(next);
  };

  const toggleDiacritics = () => {
    const next = new Set(selectedGroups);
    if (hasDiacriticsEnabled) {
      DIACRITIC_GROUPS.forEach(g => next.delete(g));
    } else {
      DIACRITIC_GROUPS.forEach(g => next.add(g));
    }
    setSelectedGroups(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100">
      <main className="flex-grow">
        {view === 'welcome' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-5xl font-bold mb-8 shadow-2xl shadow-indigo-200">あ</div>
            <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
              Kana<span className="text-indigo-600">Cards</span>
            </h1>
            <p className="text-slate-500 text-lg mb-12 max-w-md">
              Your 100% <span className="text-indigo-600">FREE</span> website to learn Japanese.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button 
                onClick={() => setView('charts')}
                className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl shadow-sm hover:border-indigo-200 transition-all font-semibold"
              >
                View Charts
              </button>
              <button 
                onClick={() => setView('study')}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all font-bold"
              >
                Start Studying
              </button>
            </div>
          </div>
        )}

        {view === 'charts' && (
          <div className="max-w-4xl mx-auto py-12 px-6 animate-in slide-in-from-bottom duration-500">
            <button onClick={() => setView('welcome')} className="mb-8 text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to home
            </button>
            <div className="space-y-12">
              {(['hiragana', 'katakana'] as const).map(type => (
                <section key={type} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h2 className="text-2xl font-bold mb-8 text-indigo-600 capitalize">{type}</h2>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
                    {ALL_KANA.filter(k => k.type === type && !DIACRITIC_GROUPS.includes(k.group)).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setStrokePreviewChar(item.char)}
                        className="flex flex-col items-center p-3 rounded-xl hover:bg-indigo-50 transition-colors group cursor-pointer"
                      >
                        <span className="text-3xl font-bold text-slate-800 group-hover:scale-110 transition-transform">{item.char}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase">{item.romaji}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {strokePreviewChar && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
                <div
                  className="absolute inset-0 bg-slate-900/50"
                  onClick={() => setStrokePreviewChar(null)}
                />
                <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="text-slate-400 text-xs font-black uppercase tracking-widest">Stroke Order</div>
                      <div className="text-4xl font-extrabold text-slate-800">{strokePreviewChar}</div>
                    </div>
                    <button
                      onClick={() => setStrokePreviewChar(null)}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                      aria-label="Close"
                    >
                      Close
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                    <StrokeOrderViewer character={strokePreviewChar} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'study' && (
          <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-8">
              <button onClick={() => setView('welcome')} className="text-slate-400 hover:text-slate-600 font-bold">Exit</button>
              <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-black">
                {seenCount} / {pool.length}
              </div>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </div>

            {showSettings && (
              <div className="w-full bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 mb-8 animate-in zoom-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">Systems</h3>
                    <div className="flex gap-3">
                      {(['hiragana', 'katakana'] as KanaType[]).map(type => (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${selectedTypes.has(type) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-200'}`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>

                    <h3 className="text-xs font-black text-slate-400 uppercase mt-8 mb-4 tracking-widest">Mode</h3>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setStudyMode('char-first')}
                        className={`text-left px-4 py-3 rounded-xl font-bold border-2 transition-all ${studyMode === 'char-first' ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                      >
                        Character → Romaji
                      </button>
                      <button
                        onClick={() => setStudyMode('romaji-first')}
                        className={`text-left px-4 py-3 rounded-xl font-bold border-2 transition-all ${studyMode === 'romaji-first' ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                      >
                        Romaji → Character
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">Groups</h3>
                    <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-2">

                    {/*
                      <button
                        onClick={toggleDiacritics}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${hasDiacriticsEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                      >
                        Include All Diacritics
                      </button>
                      */}
                      {KANA_GROUPS.filter(g => !DIACRITIC_GROUPS.includes(g)).map(group => (
                        <button
                          key={group}
                          onClick={() => toggleGroup(group)}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedGroups.has(group) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-12 w-full max-w-sm">
              <Flashcard 
                item={currentItem}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                aiHelp={aiHelp}
                isLoadingAi={isLoadingAi}
                studyMode={studyMode}
              />

              <button 
                onClick={handleRandomize}
                disabled={pool.length === 0}
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Next Character
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-slate-200/60 mt-12">
        <div className="text-center md:text-left space-y-1">
          <p className="font-black text-slate-700 text-lg tracking-tight">Kana<span className="text-indigo-600">Cards</span></p>
          <p className="text-slate-400 text-sm">by FCamareno</p>
        </div>
        <a
        href="https://ko-fi.com/C0C11T8OVK"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <img
          src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
          alt="Buy Me a Coffee on Ko-fi"
          style={{ height: 36, border: 0 }}
        />
      </a>
      </footer>
    </div>
  );
};

export default App;