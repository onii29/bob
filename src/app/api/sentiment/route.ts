// src/app/api/sentiment/route.ts

import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1) Read the incoming review text
  const { review } = await request.json();

  // 2) Initialize Groq client
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // 3) Build the prompt
  const prompt = `
You are a sentiment classifier for a clothing brand.

• If the customer says anything negative, critical, or suggests an improvement, return Negative.
• If the everything in the customer review is positive only then retun Positive
• Otherwise, return Neutral.

Respond with exactly one word: Positive, Negative, or Neutral. No extra words.

Review: ${review}
`.trim();

  // 4) Call the LLM
  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
  });

  // 5) Extract the answer and return as plain text
  const sentiment = resp.choices[0].message.content.trim();
  return new NextResponse(sentiment, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}