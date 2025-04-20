// src/app/api/sentiment/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { review } = await request.json();
    console.log("🔑 Sentiment got review:", review);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `
You are a sentiment classifier for a clothing brand.
• If the customer says anything negative, critical, or suggests an improvement, return Negative.
• If the review is purely positive, return Positive.
• Otherwise return Neutral.
Respond with exactly one word: Positive, Negative, or Neutral.

Review: ${review}
    `.trim();

    console.log("📝 Sentiment prompt:", prompt.replace(/\n/g, " "));
    const resp = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const sentiment = resp.choices[0].message.content.trim();
    console.log("📤 Sentiment response:", sentiment);

    return new NextResponse(sentiment, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("🔥 /api/sentiment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
