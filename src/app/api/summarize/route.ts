// src/app/api/summarize/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { role, insights } = await req.json() as {
    role: "Delighters" | "Detractors";
    insights: string[];
  };

  const bullets = insights.map(i => `- ${i}`).join("\n");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const prompt = `
You are summarizing a list of actionable insights from customer reviews of a clothing brand.
Output each item exactly as one bullet point (“- ”) with NO heading, NO title.

${bullets}
  `.trim();

  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });
  const summary = resp.choices[0].message.content.trim();
  return new NextResponse(summary, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
