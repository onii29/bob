import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const BATCH_SIZE = 10;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function classifyReview(review: string): Promise<string> {
  const prompt = `
You are a sentiment classifier.  
Given a single customer review, respond with exactly one of these tokens:  
- Positive  
- Negative  
- Neutral  

Do NOT include any other text or explanation. Do not use punctuation.  

Review: ${review}
  `.trim();

  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });
  return resp.choices[0].message.content.trim();
}

async function extractInsight(review: string, sentiment: string): Promise<string> {
  const prompt = `
You are an AI assistant that reads customer reviews and produces a short, actionable insight.

Instructions:
• If the review is positive, describe what went well (1–2 sentences).
• If it’s negative, describe the complaint and one concrete improvement suggestion (1–2 sentences).
• Do NOT output anything for neutral reviews—just output an empty string (“”).

Review: ${review}
  `.trim();

  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });
  return resp.choices[0].message.content.trim();
}

async function summarizeInsights(insights: string[], role: "Delighters" | "Detractors"): Promise<string> {
  const bullets = insights.map((i) => `- ${i}`).join("\n");
  const prompt = `
You are summarizing a list of insights for a business owner.

Instructions:
• For ${role}: bullet‑point what the brand is doing right.  
• Do NOT exceed 5 bullet points.  
• Use exactly one dash “- ” per line.

Insights List:
${bullets}
  `.trim();

  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });
  return resp.choices[0].message.content.trim();
}

export async function POST(req: Request) {
  try {
    const { reviews } = await req.json();
    if (!Array.isArray(reviews)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1) classify all reviews in batches
    const sentimentCounts: Record<string, number> = { Positive: 0, Neutral: 0, Negative: 0 };
    const labels: string[] = [];

    for (const batch of chunkArray(reviews, BATCH_SIZE)) {
      // classify each review in the batch in parallel
      const jobs = batch.map((r) => classifyReview(r));
      const results = await Promise.all(jobs);
      results.forEach((label) => {
        sentimentCounts[label] = (sentimentCounts[label] || 0) + 1;
        labels.push(label);
      });
    }

    // 2) extract insights per review
    const positiveInsights: string[] = [];
    const negativeInsights: string[] = [];
    const insightLengths: number[] = [];

    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      const sentiment = labels[i];
      if (sentiment === "Neutral") continue;

      const insight = await extractInsight(review, sentiment);
      if (insight) {
        insightLengths.push(insight.split(" ").length);
        if (sentiment === "Positive") positiveInsights.push(insight);
        else if (sentiment === "Negative") negativeInsights.push(insight);
      }
    }

    // 3) summarize each list
    const delightersSummary = positiveInsights.length
      ? await summarizeInsights(positiveInsights, "Delighters")
      : "No positive insights to summarize.";
    const detractorsSummary = negativeInsights.length
      ? await summarizeInsights(negativeInsights, "Detractors")
      : "No negative insights to summarize.";

    // 4) return full payload
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
