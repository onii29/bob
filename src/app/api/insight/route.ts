// src/app/api/insight/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { review, sentiment } = await req.json();
    console.log("🔑 Insight got:", { review, sentiment });

    if (sentiment === "Neutral") {
      return new NextResponse("", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt =
      sentiment === "Positive"
        ? `
You are extracting a single, concise insight from a POSITIVE clothing-brand review.
1–2 sentences on what the brand did well.

Review: ${review}
        `.trim()
        : `
You are extracting a single, concise insight from a NEGATIVE clothing-brand review.
1–2 sentences on what went wrong and a concrete fix.

Review: ${review}
        `.trim();

    console.log("📝 Insight prompt:", prompt.replace(/\n/g, " "));
    const resp = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const insight = resp.choices[0].message.content.trim();
    console.log("📤 Insight response:", insight);

    return new NextResponse(insight, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("🔥 /api/insight error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
