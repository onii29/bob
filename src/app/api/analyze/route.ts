// src/app/api/analyze/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Sleep helper to throttle requests
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// 1 API call every 4 000 ms → 15/min
const RATE_LIMIT_DELAY = 4000;

export async function POST(req: Request) {
  try {
    const { reviews } = await req.json();
    if (!Array.isArray(reviews)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const sentimentCounts: Record<string, number> = {
      Positive: 0,
      Neutral: 0,
      Negative: 0,
    };
    const positiveInsights: string[] = [];
    const negativeInsights: string[] = [];
    const insightLengths: number[] = [];

    // 1️⃣ Classify reviews one-by-one
    for (const review of reviews) {
      // Build prompt
      const classPrompt = `
You are a sentiment classifier.
Return exactly one token: Positive, Negative, or Neutral.
Review: ${review}
      `.trim();

      // Call Groq
      const classResp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: classPrompt }],
      });
      const sentiment = classResp.choices[0].message.content.trim();
      sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;

      // Throttle
      await sleep(RATE_LIMIT_DELAY);
    }

    // 2️⃣ Extract insights one-by-one
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      // Determine sentiment from counts? Better to store labels above in parallel array
      // For simplicity, you could repeat classification or maintain labels array above.
      // Assume you stored them in `labels[i]`:
      // const sentiment = labels[i];
      // Here, for demo, let's reclassify (or use stored labels)
      const sentiment = Object.entries(sentimentCounts)
        .sort((a,b) => b[1]-a[1])[0][0]; // placeholder

      if (sentiment === "Neutral") continue;

      const insightPrompt = `
You are an AI that turns reviews into 1–2 sentence actionable insights.
If positive: what went well.
If negative: what went wrong + one improvement suggestion.
Review: ${review}
      `.trim();

      const insightResp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: insightPrompt }],
      });
      const insight = insightResp.choices[0].message.content.trim();

      if (insight) {
        insightLengths.push(insight.split(" ").length);
        if (sentiment === "Positive") positiveInsights.push(insight);
        else negativeInsights.push(insight);
      }

      // Throttle
      await sleep(RATE_LIMIT_DELAY);
    }

    // 3️⃣ Summarize Delighters
    let delightersSummary = "No positive insights to summarize.";
    if (positiveInsights.length) {
      await sleep(RATE_LIMIT_DELAY);
      const resp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `
Summarize these positive insights in up to 5 bullet points:
${positiveInsights.map(i=>`- ${i}`).join("\n")}
          `.trim(),
        }],
      });
      delightersSummary = resp.choices[0].message.content.trim();
    }

    // 4️⃣ Summarize Detractors
    let detractorsSummary = "No negative insights to summarize.";
    if (negativeInsights.length) {
      await sleep(RATE_LIMIT_DELAY);
      const resp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `
Summarize these negative insights in up to 5 bullet points:
${negativeInsights.map(i=>`- ${i}`).join("\n")}
          `.trim(),
        }],
      });
      detractorsSummary = resp.choices[0].message.content.trim();
    }

    return NextResponse.json({
      sentimentCounts,
      insightLengths,
      delightersSummary,
      detractorsSummary,
    });
  } catch (err: any) {
    console.error("/api/analyze error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
