// src/app/api/insight/route.ts

import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1) Parse the incoming JSON
  const { review, sentiment } = await req.json();

  // DEBUG: log inputs
  console.log("👉 Insight route got:", { review, sentiment });

  // 2) If neutral sentiment, return an empty string immediately
  if (sentiment === "Neutral") {
    console.log("↩️  Neutral → returning empty insight");
    return NextResponse.text("", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 3) Initialize the Groq client
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // 4) Build a role‑specific prompt
  let prompt: string;
  if (sentiment === "Positive") {
    prompt = `
You are an AI assistant extracting a single, concise, actionable insight from a POSITIVE review of a clothing brand.
Describe in 1–2 sentences exactly what the brand did well.

Review: ${review}
    `.trim();
  } else {
    prompt = `
You are an AI assistant extracting a single, concise, actionable insight from a NEGATIVE review of a clothing brand.
Describe in 1–2 sentences what went wrong and suggest one concrete improvement.

Review: ${review}
    `.trim();
  }

  // DEBUG: log the final prompt
  console.log("📝 Insight prompt:", prompt.replace(/\n/g, " "));

  // 5) Call the LLM
  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });

  // 6) Extract and trim the insight
  const insight = resp.choices[0].message.content.trim();

  // DEBUG: log the raw insight
  console.log("📥 Raw insight:", insight);

  // 7) Return the insight as plain text
  return NextResponse.text(insight, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
