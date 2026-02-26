import { KanaItem } from './types';

export const KANA_GROUPS = [
  "Vowels",
  "K-series",
  "S-series",
  "T-series",
  "N-series",
  "H-series",
  "M-series",
  "Y-series",
  "R-series",
  "W-series",
  "G-series",
  "Z-series",
  "D-series",
  "B-series",
  "P-series"
];

const rawHiragana: Record<string, string[]> = {
  "Vowels": ["あ", "い", "う", "え", "お"],
  "K-series": ["か", "き", "く", "け", "こ"],
  "S-series": ["さ", "し", "す", "せ", "そ"],
  "T-series": ["た", "ち", "つ", "て", "と"],
  "N-series": ["な", "に", "ぬ", "ね", "の"],
  "H-series": ["は", "ひ", "ふ", "へ", "ほ"],
  "M-series": ["ま", "み", "む", "め", "も"],
  "Y-series": ["や", "ゆ", "よ"],
  "R-series": ["ら", "り", "る", "れ", "ろ"],
  "W-series": ["わ", "を", "ん"],
  "G-series": ["が", "ぎ", "ぐ", "げ", "ご"],
  "Z-series": ["ざ", "じ", "ず", "ぜ", "ぞ"],
  "D-series": ["だ", "ぢ", "づ", "で", "ど"],
  "B-series": ["ば", "び", "ぶ", "べ", "ぼ"],
  "P-series": ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"]
};

const rawKatakana: Record<string, string[]> = {
  "Vowels": ["ア", "イ", "ウ", "エ", "オ"],
  "K-series": ["カ", "キ", "ク", "ケ", "コ"],
  "S-series": ["サ", "シ", "ス", "セ", "ソ"],
  "T-series": ["タ", "チ", "ツ", "テ", "ト"],
  "N-series": ["ナ", "ニ", "ヌ", "ネ", "ノ"],
  "H-series": ["ハ", "ヒ", "フ", "ヘ", "ホ"],
  "M-series": ["マ", "ミ", "ム", "メ", "モ"],
  "Y-series": ["ヤ", "ユ", "ヨ"],
  "R-series": ["ラ", "リ", "ル", "レ", "ロ"],
  "W-series": ["ワ", "ヲ", "ン"],
  "G-series": ["ガ", "ギ", "グ", "ゲ", "ゴ"],
  "Z-series": ["ザ", "ジ", "ズ", "ゼ", "ゾ"],
  "D-series": ["ダ", "ヂ", "ヅ", "デ", "ド"],
  "B-series": ["バ", "ビ", "ブ", "ベ", "ボ"],
  "P-series": ["パ", "ピ", "プ", "ペ", "ポ"]
};

const romajiMap: Record<string, string> = {
  // Hiragana
  "あ": "a","い": "i","う": "u","え": "e","お": "o",
  "か": "ka","き": "ki","く": "ku","け": "ke","こ": "ko",
  "さ": "sa","し": "shi","す": "su","せ": "se","そ": "so",
  "た": "ta","ち": "chi","つ": "tsu","て": "te","と": "to",
  "な": "na","に": "ni","ぬ": "nu","ね": "ne","の": "no",
  "は": "ha","ひ": "hi","ふ": "fu","へ": "he","ほ": "ho",
  "ま": "ma","み": "mi","む": "mu","め": "me","も": "mo",
  "や": "ya","ゆ": "yu","よ": "yo",
  "ら": "ra","り": "ri","る": "ru","れ": "re","ろ": "ro",
  "わ": "wa","を": "wo","ん": "n",
  "が": "ga","ぎ": "gi","ぐ": "gu","げ": "ge","ご": "go",
  "ざ": "za","じ": "ji","ず": "zu","ぜ": "ze","ぞ": "zo",
  "だ": "da","ぢ": "ji","づ": "zu","で": "de","ど": "do",
  "ば": "ba","び": "bi","ぶ": "bu","べ": "be","ぼ": "bo",
  "ぱ": "pa","ぴ": "pi","ぷ": "pu","ぺ": "pe","ぽ": "po",

  // Katakana
  "ア": "a","イ": "i","ウ": "u","エ": "e","オ": "o",
  "カ": "ka","キ": "ki","ク": "ku","ケ": "ke","コ": "ko",
  "サ": "sa","シ": "shi","ス": "su","セ": "se","ソ": "so",
  "タ": "ta","チ": "chi","ツ": "tsu","テ": "te","ト": "to",
  "ナ": "na","ニ": "ni","ヌ": "nu","ネ": "ne","ノ": "no",
  "ハ": "ha","ヒ": "hi","フ": "fu","ヘ": "he","ホ": "ho",
  "マ": "ma","ミ": "mi","ム": "mu","メ": "me","モ": "mo",
  "ヤ": "ya","ユ": "yu","ヨ": "yo",
  "ラ": "ra","リ": "ri","ル": "ru","レ": "re","ロ": "ro",
  "ワ": "wa","ヲ": "wo","ン": "n",
  "ガ": "ga","ギ": "gi","グ": "gu","ゲ": "ge","ゴ": "go",
  "ザ": "za","ジ": "ji","ズ": "zu","ゼ": "ze","ゾ": "zo",
  "ダ": "da","ヂ": "ji","ヅ": "zu","デ": "de","ド": "do",
  "バ": "ba","ビ": "bi","ブ": "bu","ベ": "be","ボ": "bo",
  "パ": "pa","ピ": "pi","プ": "pu","ペ": "pe","ポ": "po"
};

export const ALL_KANA: KanaItem[] = [];

Object.entries(rawHiragana).forEach(([group, chars]) => {
  chars.forEach(char => {
    ALL_KANA.push({ char, romaji: romajiMap[char] || "?", group, type: 'hiragana' });
  });
});

Object.entries(rawKatakana).forEach(([group, chars]) => {
  chars.forEach(char => {
    ALL_KANA.push({ char, romaji: romajiMap[char] || "?", group, type: 'katakana' });
  });
});
