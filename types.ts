
export type KanaType = 'hiragana' | 'katakana';
export type StudyMode = 'char-first' | 'romaji-first';

export interface KanaItem {
  char: string;
  romaji: string;
  group: string;
  type: KanaType;
}

export interface AIHelp {
  mnemonic: string;
  examples: { word: string; meaning: string }[];
}
