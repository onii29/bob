import Groq from "groq-sdk";

export async function POST(req: Request) {
  const { role, insights } = await req.json() as {
    role: "Delighters" | "Detractors";
    insights: string[];
  };

  const bullets = insights.map((i) => `- ${i}`).join("\n");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const prompt = role === "Delighters"
    ? `
You are summarizing what customers love about a clothing brand.
Format as bullet points, Make sure not to make more than 5 bullet points so stick to the point and do not halucinate

Insights:
${bullets}
    `.trim()
    : `
You are summarizing what needs improvement for a clothing brand.
Format as bullet points with actionable recommendations. Make sure not to make more than 5 bullet points so stick to the point and do not halucinate

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
