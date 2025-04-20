// src/components/ReviewAnalyzer.tsx
"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SentimentBar from "@/components/charts/SentimentBar";
import InsightHistogram from "@/components/charts/InsightHistogram";

const RATE_LIMIT = 4000; // ms between requests (~15/min)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ReviewAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [results, setResults] = useState<{
    sentimentCounts: Record<string, number>;
    insightLengths: number[];
    delightersSummary: string;
    detractorsSummary: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please upload a CSV first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setError(null);

    try {
      setProgress("Parsing CSV…");
      const data: any[] = await new Promise((res, rej) =>
        Papa.parse(file, {
          header: true,
          preview: 100,
          complete: ({ data }) => res(data),
          error: (err) => rej(err),
        })
      );
      const reviews = data.map((r) => r.Review as string);

      const counts: Record<string, number> = { Positive: 0, Neutral: 0, Negative: 0 };
      const insightLengths: number[] = [];
      const positiveInsights: string[] = [];
      const negativeInsights: string[] = [];

      // 1️⃣ Sentiment per review
      for (const review of reviews) {
        setProgress("Classifying sentiment…");
        await sleep(RATE_LIMIT);
        const sentiment = await fetch("/api/sentiment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review }),
        }).then((r) => r.text());

        counts[sentiment] = (counts[sentiment] || 0) + 1;

        // 2️⃣ Insight if not neutral
        if (sentiment !== "Neutral") {
          setProgress("Extracting insight…");
          await sleep(RATE_LIMIT);
          const insight = await fetch("/api/insight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ review, sentiment }),
          }).then((r) => r.text());

          if (insight) {
            insightLengths.push(insight.split(" ").length);
            if (sentiment === "Positive") positiveInsights.push(insight);
            else negativeInsights.push(insight);
          }
        }
      }

      // 3️⃣ Summaries
      setProgress("Summarizing delighters…");
      await sleep(RATE_LIMIT);
      const delightersSummary = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Delighters", insights: positiveInsights }),
      }).then((r) => r.text());

      setProgress("Summarizing detractors…");
      await sleep(RATE_LIMIT);
      const detractorsSummary = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Detractors", insights: negativeInsights }),
      }).then((r) => r.text());

      setResults({ sentimentCounts: counts, insightLengths, delightersSummary, detractorsSummary });
      setProgress("Analysis complete");
      toast({ title: "Success", description: "Analysis complete" });
    } catch (err: any) {
      console.error("ReviewAnalyzer error:", err);
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="csv-file">Choose CSV file</Label>
      <input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="block" />

      {error && <p className="text-red-600">{error}</p>}

      <Button onClick={handleAnalyze} disabled={!file || loading}>
        {loading ? progress : "Analyze Reviews"}
      </Button>

      {results && (
        <div className="space-y-6 mt-6">
          <h3 className="text-lg font-medium">Sentiment Distribution</h3>
          <SentimentBar data={results.sentimentCounts} />

          <h3 className="text-lg font-medium">Insight Length Histogram</h3>
          <InsightHistogram data={results.insightLengths} />

          <h3 className="text-lg font-medium">Delighters</h3>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {results.delightersSummary}
          </pre>

          <h3 className="text-lg font-medium">Detractors</h3>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {results.detractorsSummary}
          </pre>
        </div>
      )}
    </div>
  );
}
