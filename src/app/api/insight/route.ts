// src/app/api/insight/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { review, sentiment } = await req.json();
  // Skip neutral
  if (sentiment === "Neutral") {
    return new Response("", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const prompt = `
You are an AI assistant that reads customer reviews and produces a short, actionable insight.

Instructions:
• If the review is positive, describe what went well (1–2 sentences).
• If it’s negative, describe the complaint and one concrete improvement suggestion (1–2 sentences).

Review: ${review}
  `.trim();

  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });
  const insight = resp.choices[0].message.content.trim();
  return new Response(insight, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
