// src/app/api/sentiment/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  // Parse the incoming JSON
  const { review } = await req.json();

  // Build the prompt
  const prompt = `
You are a sentiment classifier for a clothing brand.
Given one customer review, respond with exactly one token: Positive, Negative, or Neutral.
Remember to respond with just the sentiment tag—no extra words.

Review: ${review}
  `.trim();

  // Call the Groq API
  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });

  // Extract and return the sentiment
  const sentiment = resp.choices[0].message.content.trim();
  return new Response(sentiment, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
