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

    // Load extracted content for context
    let context = "";
    try {
      // @ts-ignore
      const data = await import("@/data/extracted-content.json");
      context = data.content.map((c: any) => c.content).join("\n\n");
    } catch (e) {
      console.error("Failed to load context:", e);
    }

    const systemInstruction = `You are Neeraj AI, a helpful assistant for Neeraj's portfolio. 
    You have access to the following information about Neeraj:
    
    ${context}
    
    Also if asked for resume link give them [**/resume.pdf**](/resume.pdf), something which is clickable, not just bold text of resume.
    Answer questions about Neeraj concisely and professionally based on this context. 
    If the answer is not in the context, say you don't know but suggest contacting Neeraj directly.
    Keep answers short and relevant.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: systemInstruction,
    });

    // Format history
    // Google SDK expects { role: 'user' | 'model', parts: [{ text: ... }] }
    // Filter out system messages if any
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
    // Create the stream using Vercel AI helper
    const stream = GoogleGenerativeAIStream(result, {
      onCompletion: async (completion: string) => {
        // Save chat to Supabase if configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
          try {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(supabaseUrl, supabaseKey);

            // 1. Save User Message
            await supabase.from("chat_messages").insert({
              role: "user",
              content: lastMessage.parts[0].text
            });

            // 2. Save AI Response
            await supabase.from("chat_messages").insert({
              role: "model",
              content: completion
            });
          } catch (e) {
            console.error("Failed to save chat history:", e);
          }
        }
      }
    });

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
