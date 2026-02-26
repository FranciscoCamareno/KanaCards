import { GoogleGenAI, Type } from "@google/genai";
import { AIHelp } from "../features/kana/types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getKanaMnemonics(char: string, romaji: string): Promise<AIHelp> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short mnemonic and 3 common example words (in romaji with English translation) for the Japanese character: ${char} (${romaji}). Provide the response in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mnemonic: {
              type: Type.STRING,
              description: "A short, catchy mnemonic to remember the character's shape and sound."
            },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  meaning: { type: Type.STRING }
                },
                required: ["word", "meaning"]
              }
            }
          },
          required: ["mnemonic", "examples"]
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as AIHelp;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      mnemonic: "Keep practicing! You'll master it soon.",
      examples: []
    };
  }
}
