// src/app/api/analyze/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const RATE_LIMIT_DELAY = 4000; // 1 call per 4s ~ 15/min

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
  try {
    const { reviews } = await req.json();
    if (!Array.isArray(reviews)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Accumulators
    const sentimentCounts: Record<string, number> = {
      Positive: 0,
      Neutral: 0,
      Negative: 0,
    };
    const labels: string[] = [];
    const positiveInsights: string[] = [];
    const negativeInsights: string[] = [];
    const insightLengths: number[] = [];

    // 1️⃣ Classify each review (one call per review)
    for (const review of reviews) {
      const classPrompt = `
You are a sentiment classifier.  
Given a single customer review, respond with exactly one of these tokens:  
– Positive  
– Negative  
– Neutral  

Remember to respond with just the sentiment tags without any pre or post explanation.
Review: ${review}
      `.trim();

      const classResp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: classPrompt }],
      });
      const sentiment = classResp.choices[0].message.content.trim();
      sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
      labels.push(sentiment);

      await sleep(RATE_LIMIT_DELAY);
    }

    // 2️⃣ Extract an insight per non‑neutral review
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      const sentiment = labels[i];
      if (sentiment === "Neutral") continue;

      const insightPrompt = `
You are an AI assistant that reads customer reviews and produces a short, actionable insight.

Instructions:
• If the review is positive, describe what went well (1–2 sentences).
• If it’s negative, describe the complaint and one concrete improvement suggestion (1–2 sentences).
• Do NOT output anything for neutral reviews—just output an empty string (“”).

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

      await sleep(RATE_LIMIT_DELAY);
    }

    // 3️⃣ Summarize Delighters
    let delightersText = "No positive insights to summarize.";
    if (positiveInsights.length) {
      await sleep(RATE_LIMIT_DELAY);
      const sumResp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `
You are summarizing a list of positive insights.  
Please format as up to 5 bullet points (each starting with "- ").  

Insights:
${positiveInsights.map((i) => `- ${i}`).join("\n")}
          `.trim(),
        }],
      });
      delightersText = sumResp.choices[0].message.content.trim();
    }

    // 4️⃣ Summarize Detractors
    let detractorsText = "No negative insights to summarize.";
    if (negativeInsights.length) {
      await sleep(RATE_LIMIT_DELAY);
      const sumResp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `
You are summarizing a list of negative insights.  
Please format as up to 5 bullet points (each starting with "- ").  

Insights:
${negativeInsights.map((i) => `- ${i}`).join("\n")}
          `.trim(),
        }],
      });
      detractorsText = sumResp.choices[0].message.content.trim();
    }

    // 5️⃣ Build a single plain‑text response
    const output = `
Sentiment Distribution:
Positive: ${sentimentCounts.Positive}
Neutral: ${sentimentCounts.Neutral}
Negative: ${sentimentCounts.Negative}

Delighters:
${delightersText}

Detractors:
${detractorsText}
    `.trim();

    // Return as text/plain
    return new Response(output, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("/api/analyze error:", err);
    return new Response(`Error: ${err.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
