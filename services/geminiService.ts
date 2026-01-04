
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Product, ChatMessage } from "../types";

// Fix: Follow @google/genai guidelines for model initialization and direct content generation
export const getShoppingAdvice = async (
  query: string,
  products: Product[],
  history: ChatMessage[],
  userOrders: any[] = []
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "I'm sorry, I cannot help right now as the AI service is not configured.";
  }

  // Always use a named parameter for apiKey and use process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Format order history for the AI context
  const orderContext = userOrders.length > 0 
    ? `The user has previously bought these beauty products: ${JSON.stringify(userOrders.map(o => ({ date: o.date, items: o.items.map((i: any) => i.name) })))}. Use this history to suggest matching skincare or makeup items.` 
    : "The user has no previous order history.";

  try {
    // Fix: Directly await ai.models.generateContent with model name and prompt
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: `You are the Beauty & Skincare Consultant for NAYAVISH COSMETICS. 
        You are an expert in Ayurvedic formulations, skin types, and hair care.
        Our current product catalog includes: ${JSON.stringify(products)}.
        ${orderContext}
        Answer questions about skin concerns (acne, dry skin), hair fall, or makeup shades.
        If the user asks for a suggestion based on their previous order, analyze their history (e.g., if they bought shampoo, suggest a conditioner or hair mask).
        Keep responses helpful, gentle, and focused on natural beauty. Emphasize that our products are handmade and chemical-free.`,
        temperature: 0.7,
      }
    });

    // Fix: Access .text property directly (not a method)
    return response.text || "I'm not sure which product matches that. Would you like to try our Kumkumadi Serum?";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm having a little trouble connecting to the beauty desk. Please try again in a moment.";
  }
};
