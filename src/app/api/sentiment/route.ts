// src/app/api/sentiment/route.ts
import Groq from "groq-sdk";

export async function POST(req: Request) {
  const { review } = await req.json();

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const prompt = `
You are a sentiment classifier for a clothing brand.
Given one customer review, respond with exactly one token: Positive, Negative, or Neutral.
Remember to respond with just the sentiment tag—no extra words.

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
