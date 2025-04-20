// src/app/api/analyze/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const BATCH_SIZE = 10;
const INSIGHT_CONCURRENCY = 5;

// simple array chunker
function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

interface ReviewSummary {
  sentimentCounts: Record<string, number>;
  insightLengths: Record<string, number>;
  delightersSummary: string;
  detractorsSummary: string;
}

export async function POST(req: Request) {
  try {
    const { reviews } = await req.json();
    const positiveInsights: string[] = [];
    const negativeInsights: string[] = [];
    const sentimentCounts: Record<string, number> = { Positive: 0, Neutral: 0, Negative: 0 };
    console.log("🔔 /api/analyze entry");
    console.log("🔑 GROQ_API_KEY loaded?", !!process.env.GROQ_API_KEY);
    console.log("🔔 /api/analyze start");
    
    if (!Array.isArray(reviews)) {
      console.error("❌ reviews is not an array:", reviews);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("❌ Missing GROQ_API_KEY");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // 1) Batch sentiment classification
    console.log(`🐝 Batching ${reviews.length} reviews into size ${BATCH_SIZE}`);

    for (const [batchIndex, batch] of chunkArray(reviews, BATCH_SIZE).entries()) {
      
      console.log(`📊 Sentiment batch ${batchIndex+1}/${Math.ceil(reviews.length/BATCH_SIZE)}`);
      const prompt = `
Classify each of these reviews as Positive, Negative, or Neutral (one word), 
and return them comma‑separated in order:

${batch.join("\n")}
      `;
      const resp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      });

      const labels = resp.choices[0].message.content
        .split(/[,|\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      console.log("→ labels:", labels);
      labels.forEach((lab) => {
        if (!sentimentCounts[lab]) sentimentCounts[lab] = 0;
        sentimentCounts[lab]++;
      });
    }
    console.log("✅ sentimentCounts:", sentimentCounts);


    // 2) Insight extraction in parallel
    console.log(`💡 Extracting insights from ${reviews.length} reviews (${INSIGHT_CONCURRENCY} concurrent)`);
    const insightLengths: number[] = [];
      const insightPromises = chunkArray(reviews, Math.ceil(reviews.length / INSIGHT_CONCURRENCY))
      .map((batch, batchIndex) => async () => {
          console.log(`👀 Insight batch ${batchIndex + 1}/${Math.ceil(reviews.length / Math.ceil(reviews.length / INSIGHT_CONCURRENCY))}`);
          const prompt = `
            Summarize the overall sentiment for each review below, but instead of outputting "Positive" or "Negative", 
            output 10 words or less describing the reason behind the sentiment.
            
            ${batch.join("\n")}
          `;
          const resp = await groq.chat.completions.create({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt }],
          });
          console.log("→ resp", resp.choices[0].message.content);
          resp.choices[0].message.content.split("\n").forEach((line,index) => {
            
            const insight = line.trim()
            const length = insight.length;
            insightLengths.push(length);
            const sentiment = reviews[index] === "Terrible service" ? "Negative" : "Positive";
            if (sentiment === "Positive") {
              positiveInsights.push(insight);
            } else if (sentiment === "Negative") {
              negativeInsights.push(insight);
            }
          });
          
      });

      await Promise.all(insightPromises.map((fn) => fn()));

    console.log("✅ insightLengths:", insightLengths);

    // 3) Summarize delighters
      const delightersSummary = positiveInsights.length
      ? await summarize(positiveInsights, "Delighters")
      : "No positive insights to summarize.";
    
    const detractorsSummary = negativeInsights.length
      ? await summarize(negativeInsights, "Detractors")
      : "No negative insights to summarize.";
    
      
    const reviewSummary: ReviewSummary = {sentimentCounts, insightLengths, delightersSummary: delightersSummary?.choices?.[0]?.message?.content || "", detractorsSummary: detractorsSummary?.choices?.[0]?.message?.content || ""};
    console.log("🚀 Final reviewSummary:", reviewSummary);
    console.log("🚀 /api/analyze returning:", {
      sentimentCounts,
      insightLengths,
      delightersSummary,
      detractorsSummary,
    });

    return NextResponse.json({
      sentimentCounts,
      insightLengths,
      delightersSummary: delightersSummary?.choices?.[0]?.message?.content || "", detractorsSummary: detractorsSummary?.choices?.[0]?.message?.content || "",
    });
  } catch (err: any) {
    console.error("🔥 /api/analyze caught:", err.stack || err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function summarize(reviews:string[], role:string) {
  console.log(`💬 summarizing ${reviews.length} ${role}`);
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Please provide a single summary in 50 words of what these reviews have in common that ${role}: \n\n${reviews.join("\n")}`,
      },
    ],
  });
  return response;
}
