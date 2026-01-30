import { KanaItem } from './types';

export const KANA_GROUPS = [
  "Vowels (a, i, u, e, o)",
  "K-series (ka, ki, ku, ke, ko)",
  "S-series (sa, shi, su, se, so)",
  "T-series (ta, chi, tsu, te, to)",
  "N-series (na, ni, nu, ne, no)",
  "H-series (ha, hi, fu, he, ho)",
  "M-series (ma, mi, mu, me, mo)",
  "Y-series (ya, yu, yo)",
  "R-series (ra, ri, ru, re, ro)",
  "W-series (wa, wo, n)",
  "G-series (ga, gi, gu, ge, go)",
  "Z-series (za, ji, zu, ze, zo)",
  "D-series (da, ji, zu, de, do)",
  "B-series (ba, bi, bu, be, bo)",
  "P-series (pa, pi, pu, pe, po)"
];

const rawHiragana: Record<string, string[]> = {
  "Vowels (a, i, u, e, o)": ["あ", "い", "う", "え", "お"],
  "K-series (ka, ki, ku, ke, ko)": ["か", "き", "く", "け", "こ"],
  "S-series (sa, shi, su, se, so)": ["さ", "し", "す", "せ", "そ"],
  "T-series (ta, chi, tsu, te, to)": ["た", "ち", "つ", "て", "と"],
  "N-series (na, ni, nu, ne, no)": ["な", "に", "ぬ", "ね", "の"],
  "H-series (ha, hi, fu, he, ho)": ["は", "ひ", "ふ", "へ", "ほ"],
  "M-series (ma, mi, mu, me, mo)": ["ま", "み", "む", "め", "も"],
  "Y-series (ya, yu, yo)": ["や", "ゆ", "よ"],
  "R-series (ra, ri, ru, re, ro)": ["ら", "り", "る", "れ", "ろ"],
  "W-series (wa, wo, n)": ["わ", "を", "ん"],
  "G-series (ga, gi, gu, ge, go)": ["が", "ぎ", "ぐ", "げ", "ご"],
  "Z-series (za, ji, zu, ze, zo)": ["ざ", "じ", "ず", "ぜ", "ぞ"],
  "D-series (da, ji, zu, de, do)": ["だ", "ぢ", "づ", "で", "ど"],
  "B-series (ba, bi, bu, be, bo)": ["ば", "び", "ぶ", "べ", "ぼ"],
  "P-series (pa, pi, pu, pe, po)": ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"]
};

const rawKatakana: Record<string, string[]> = {
  "Vowels (a, i, u, e, o)": ["ア", "イ", "ウ", "エ", "オ"],
  "K-series (ka, ki, ku, ke, ko)": ["カ", "キ", "ク", "ケ", "コ"],
  "S-series (sa, shi, su, se, so)": ["サ", "シ", "ス", "セ", "ソ"],
  "T-series (ta, chi, tsu, te, to)": ["タ", "チ", "ツ", "テ", "ト"],
  "N-series (na, ni, nu, ne, no)": ["ナ", "ニ", "ヌ", "ネ", "ノ"],
  "H-series (ha, hi, fu, he, ho)": ["ハ", "ヒ", "フ", "ヘ", "ホ"],
  "M-series (ma, mi, mu, me, mo)": ["マ", "ミ", "ム", "メ", "モ"],
  "Y-series (ya, yu, yo)": ["ヤ", "ユ", "ヨ"],
  "R-series (ra, ri, ru, re, ro)": ["ラ", "リ", "ル", "レ", "ロ"],
  "W-series (wa, wo, n)": ["ワ", "ヲ", "ン"],
  "G-series (ga, gi, gu, ge, go)": ["ガ", "ギ", "グ", "ゲ", "ゴ"],
  "Z-series (za, ji, zu, ze, zo)": ["ザ", "ジ", "ズ", "ゼ", "ゾ"],
  "D-series (da, ji, zu, de, do)": ["ダ", "ヂ", "ヅ", "デ", "ド"],
  "B-series (ba, bi, bu, be, bo)": ["バ", "ビ", "ブ", "ベ", "ボ"],
  "P-series (pa, pi, pu, pe, po)": ["パ", "ピ", "プ", "ペ", "ポ"]
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