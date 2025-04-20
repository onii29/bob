// src/app/api/sentiment/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { review } = await req.json();
  const prompt = `
You are a sentiment classifier.
Given a single customer review, respond with exactly one of these tokens:
- Positive
- Negative
- Neutral

Remember to respond with just the sentiment tag without any pre or post explanation.

Review: ${review}
  `.trim();

  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });
  const sentiment = resp.choices[0].message.content.trim();
  return new Response(sentiment, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
