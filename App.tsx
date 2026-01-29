import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_KANA, KANA_GROUPS } from './constants';
import { KanaItem, AIHelp, KanaType, StudyMode } from './types';
import { getKanaMnemonics } from './services/geminiService';
import Flashcard from './components/Flashcard';

// Fisher-Yates shuffle algorithm for fair distribution
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

const App: React.FC = () => {
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set([KANA_GROUPS[0]]));
  const [selectedTypes, setSelectedTypes] = useState<Set<KanaType>>(new Set(['hiragana', 'katakana']));
  const [studyMode, setStudyMode] = useState<StudyMode>('char-first');
  
  const [currentItem, setCurrentItem] = useState<KanaItem | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiHelp, setAiHelp] = useState<AIHelp | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [studyQueue, setStudyQueue] = useState<KanaItem[]>([]);
  const [seenCount, setSeenCount] = useState(0);

  // Filter the base pool based on selected groups and types
  const pool = useMemo(() => {
    return ALL_KANA.filter(item => 
      selectedGroups.has(item.group) && selectedTypes.has(item.type)
    );
  }, [selectedGroups, selectedTypes]);

  // Check if diacritics are currently enabled (if any diacritic group is in selectedGroups)
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

  // Reset and reshuffle when the pool selection changes
  useEffect(() => {
    startNewRound(pool);
  }, [pool, startNewRound]);

  const handleRandomize = useCallback(() => {
    if (pool.length === 0) return;

    setIsFlipped(false);
    setAiHelp(null);

    if (studyQueue.length > 0) {
      // Get next item from current shuffled queue
      const nextItem = studyQueue[0];
      setCurrentItem(nextItem);
      setStudyQueue(prev => prev.slice(1));
      setSeenCount(prev => prev + 1);
    } else {
      // Queue empty, start a fresh shuffled round
      startNewRound(pool);
    }
  }, [pool, studyQueue, startNewRound]);

  const handleFlip = async () => {
    const newFlipState = !isFlipped;
    setIsFlipped(newFlipState);

    // Only load AI mnemonic if flipping to answer and we don't have it yet
    if (newFlipState && currentItem && !aiHelp && !isLoadingAi) {
      setIsLoadingAi(true);
      try {
        const help = await getKanaMnemonics(currentItem.char, currentItem.romaji);
        setAiHelp(help);
      } catch (err) {
        console.error("Failed to fetch mnemonics", err);
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
      // Remove all diacritics
      DIACRITIC_GROUPS.forEach(g => next.delete(g));
      // Ensure at least one group remains if we just cleared everything
      if (next.size === 0) next.add(KANA_GROUPS[0]);
    } else {
      // Add all diacritics
      DIACRITIC_GROUPS.forEach(g => next.add(g));
    }
    setSelectedGroups(next);
  };

  const selectAllGroups = () => {
    const all = new Set([...KANA_GROUPS]);
    setSelectedGroups(all);
  };
  
  const deselectAllGroups = () => setSelectedGroups(new Set([KANA_GROUPS[0]]));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kana<span className="text-indigo-600">Cards</span></h1>
          <p className="text-slate-500 text-sm">Flashcards Inteligentes de Japonés</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progreso</span>
             <span className="text-sm font-semibold text-indigo-600">{seenCount} / {pool.length}</span>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-2xl shadow-sm border transition-all ${showSettings ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            title="Configuración de Estudio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center relative">
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 mb-8 z-10 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Type Selection */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Sistemas</h3>
                <div className="flex gap-2">
                  {(['hiragana', 'katakana'] as KanaType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all capitalize font-medium text-sm ${selectedTypes.has(type) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Mode */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Modo</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStudyMode('char-first')}
                    className={`flex-1 py-2 rounded-xl border-2 transition-all font-medium text-xs ${studyMode === 'char-first' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    Kana Primero
                  </button>
                  <button
                    onClick={() => setStudyMode('romaji-first')}
                    className={`flex-1 py-2 rounded-xl border-2 transition-all font-medium text-xs ${studyMode === 'romaji-first' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    Romaji Primero
                  </button>
                </div>
              </div>

              {/* Diacritics Toggle */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Diacríticos</h3>
                <button
                  onClick={toggleDiacritics}
                  className={`w-full py-2 rounded-xl border-2 transition-all font-medium text-sm flex items-center justify-center gap-2 ${hasDiacriticsEnabled ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  {hasDiacriticsEnabled ? 'Tenten/Maru ON' : 'Tenten/Maru OFF'}
                </button>
              </div>

              {/* Selection Controls */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Atajos</h3>
                <div className="flex flex-col gap-2">
                  <button onClick={selectAllGroups} className="text-sm bg-slate-50 py-1 px-3 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors text-left font-medium">Seleccionar Todo</button>
                  <button onClick={deselectAllGroups} className="text-sm bg-slate-50 py-1 px-3 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors text-left font-medium">Limpiar Todo</button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Series Individuales</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {KANA_GROUPS.map(group => (
                  <button
                    key={group}
                    onClick={() => toggleGroup(group)}
                    className={`text-xs p-2 rounded-lg border transition-all text-center truncate ${selectedGroups.has(group) ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                  >
                    {group.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
            >
              Listo para Estudiar
            </button>
          </div>
        )}

        {/* Flashcard Area */}
        <div className="flex flex-col items-center gap-12 w-full">
          <Flashcard 
            item={currentItem} 
            isFlipped={isFlipped} 
            onFlip={handleFlip}
            aiHelp={aiHelp}
            isLoadingAi={isLoadingAi}
            studyMode={studyMode}
          />

          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <button 
              onClick={handleRandomize}
              disabled={pool.length === 0}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl shadow-xl shadow-indigo-100 text-xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              {seenCount === pool.length ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reiniciar Mazo
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Siguiente
                </>
              )}
            </button>
            <div className="flex justify-between w-full px-2">
              <p className="text-slate-400 text-xs font-medium">
                Mazo: {pool.length} ítems
              </p>
              <p className="text-indigo-500 text-xs font-bold uppercase tracking-widest">
                Vistos: {seenCount} / {pool.length}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto pt-12 text-slate-400 text-sm pb-4 flex flex-col items-center gap-1">
        <p>by FCamareno</p>
      </footer>
    </div>
  );
};

export default App;