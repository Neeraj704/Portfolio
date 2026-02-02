import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("[Chat API] Missing GEMINI_API_KEY");
      return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using verified working model for 2026
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: "You are Neeraj AI, a helpful assistant for Neeraj's portfolio. You are knowledgeable about Neeraj's work experience, projects, and skills based on the context provided. Answer questions about Neeraj concisely and professionally. If you don't know something, ask the user to contact Neeraj directly.",
    });

    // Format history
    // Google SDK expects { role: 'user' | 'model', parts: [...] }
    const validHistory = (messages as Message[])
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

    // Separate last message
    const lastMessage = validHistory[validHistory.length - 1];
    const history = validHistory.slice(0, validHistory.length - 1);

    console.log(`[Chat API] Starting chat with ${history.length} history items`);

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessageStream(lastMessage.parts[0].text);
    
    // Create the stream using Vercel AI helper
    const stream = GoogleGenerativeAIStream(result);

    // Return using StreamingTextResponse which handles headers suitable for useChat
    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("[Gemini Chat Route Error]", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", detail: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
