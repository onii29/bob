// src/app/api/summarize/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { role, insights } = await req.json();
  const bullets = (insights as string[])
    .map((i) => `- ${i}`)
    .join("\n");

  const prompt = `
You are summarizing a list of ${role.toLowerCase()} insights for a business owner.

Instructions:
• Format as up to 5 bullet points (each starting with "- ").
• No extra text.

Insights:
${bullets}
  `.trim();

  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });
  const summary = resp.choices[0].message.content.trim();
  return new Response(summary, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
