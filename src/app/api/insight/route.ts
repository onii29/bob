import Groq from "groq-sdk";

export async function POST(req: Request) {
  const { review, sentiment } = await req.json();
  if (sentiment === "Neutral") return new Response("", { status: 200 });

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const prompt = `
You are an AI assistant that extracts a short, actionable insight from a customer review of a clothing brand.
• If positive: 1–2 sentences describing what went well.
• If negative: 1–2 sentences describing the problem and one way the brand can improve.

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
