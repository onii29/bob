import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { reviews } = await req.json();
    if (!Array.isArray(reviews)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1) Sentiment counts
    const sentimentCounts:Record<string,number> = { Positive:0, Neutral:0, Negative:0 };
    const insightLengths:number[] = [];
    const insights:string[] = [];

    // 2) Loop & call Groq
    for (const review of reviews) {
      // sentiment
      const sresp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: 
`Analyze the customer review and classify it as Positive, Negative, or Neutral (one word).

Review: ${review}`
        }],
      });
      const sentiment = sresp.choices[0].message.content.trim();
      sentimentCounts[sentiment] = (sentimentCounts[sentiment]||0)+1;

      // insight
      if (sentiment !== "Neutral") {
        const iresp = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content:
`Extract a 2–3 line actionable insight from this review.
If Positive → what they did right.
If Negative → what they did wrong + how to improve.

Review: ${review}`
          }],
        });
        const insight = iresp.choices[0].message.content.trim();
        insights.push(insight);
        insightLengths.push(insight.split(" ").length);
      }
    }

    // 3) Summarize
    async function summarize(list:string[]) {
      const bullets = list.map(x=>`- ${x}`).join("\n");
      const sresp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages:[{ role:"user", content:
`Summarize these insights in bullet points:

${bullets}`
        }],
      });
      return sresp.choices[0].message.content.trim();
    }
    const delighters = await summarize(insights.filter((_,i)=>insightLengths[i]>0));
    const detractors = await summarize(insights.filter((_,i)=>insightLengths[i]>0));

    // 4) Return
    return NextResponse.json({
      sentimentCounts,
      insightLengths,
      delightersSummary: delighters,
      detractorsSummary: detractors,
    });
  } catch (err:any) {
    console.error("analyze error:", err);
    return NextResponse.json({ error: err.message}, { status: 500 });
  }
}
