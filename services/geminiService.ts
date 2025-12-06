import { GoogleGenAI, Type } from "@google/genai";
import { SmartParseResult } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client only if the key is available, but don't crash yet if not (handled in UI)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const parseReminderInput = async (input: string): Promise<SmartParseResult | null> => {
  if (!ai) {
    console.error("API Key not found");
    return null;
  }

  const now = new Date();
  const currentTimeString = now.toISOString();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const prompt = `
    Current Date/Time (ISO): ${currentTimeString}
    User Timezone: ${timeZone}
    
    Extract the reminder task content and the intended date/time from the user's input.
    If the user uses relative terms like "tomorrow", "in 5 minutes", or "next friday", calculate the absolute ISO date time based on the Current Date/Time provided.
    If no time is specified, default to 1 hour from the current time.
    Infer a category based on the content.
    
    User Input: "${input}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The main task description",
            },
            dateTime: {
              type: Type.STRING,
              description: "The calculated ISO 8601 date time string",
            },
            category: {
              type: Type.STRING,
              enum: ["work", "personal", "urgent", "health"],
              description: "The inferred category of the task",
            },
          },
          required: ["title", "dateTime", "category"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as SmartParseResult;
  } catch (error) {
    console.error("Error parsing with Gemini:", error);
    return null;
  }
};
