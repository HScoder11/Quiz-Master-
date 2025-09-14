
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { QuizQuestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "The quiz question.",
    },
    options: {
      type: Type.OBJECT,
      properties: {
        A: { type: Type.STRING, description: "Option A" },
        B: { type: Type.STRING, description: "Option B" },
        C: { type: Type.STRING, description: "Option C" },
        D: { type: Type.STRING, description: "Option D" },
      },
      required: ["A", "B", "C", "D"],
    },
    correctAnswer: {
      type: Type.STRING,
      description: "The letter of the correct answer (A, B, C, or D).",
    },
    explanation: {
      type: Type.STRING,
      description: "A brief explanation of why the correct answer is correct.",
    },
  },
  required: ["question", "options", "correctAnswer", "explanation"],
};

export function startQuizSession(): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are an AI Quiz Master. Your role is to create an interactive quiz. The user will provide a topic and difficulty. Generate interesting questions one by one based on their requests. Always keep your tone encouraging and supportive. You must respond ONLY with a single, valid JSON object for each question, adhering to the provided schema. Do not include any other text, greetings, or markdown formatting.`,
      responseMimeType: "application/json",
      responseSchema: quizQuestionSchema,
    },
  });
  return chat;
}

export async function getNextQuestion(chat: Chat, message: string): Promise<QuizQuestion> {
  try {
    const response = await chat.sendMessage({ message });
    const jsonText = response.text.trim();
    // In rare cases, the API might still wrap the JSON in markdown.
    const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
    const parsed = JSON.parse(cleanedJsonText);
    
    // Basic validation
    if (
      !parsed.question ||
      !parsed.options ||
      !parsed.correctAnswer ||
      !parsed.explanation
    ) {
      throw new Error("Received incomplete question data from API.");
    }

    return parsed as QuizQuestion;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to get a valid question from the AI. The response might not be valid JSON.");
  }
}
