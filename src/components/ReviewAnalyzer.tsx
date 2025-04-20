// src/components/ReviewAnalyzer.tsx
"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SentimentBar from "@/components/charts/SentimentBar";

const RATE_LIMIT = 4000; // one call per 4s (~15/min)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ReviewAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState<{
    sentimentCounts: Record<string, number>;
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
      // 1️⃣ Parse CSV (first 100 rows)
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

      // 2️⃣ Prepare accumulators
      const counts: Record<string, number> = { Positive: 0, Neutral: 0, Negative: 0 };
      const positiveInsights: string[] = [];
      const negativeInsights: string[] = [];

      // 3️⃣ Classify & extract one by one
      for (const review of reviews) {
        // 🔍 Sentiment
        setProgress("Classifying sentiment…");
        await sleep(RATE_LIMIT);
        const sentiment = await fetch("/api/sentiment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review }),
        }).then((r) => r.text());

        // 📊 Log classification
        console.log("📝 Review → Sentiment:", { review, sentiment });

        counts[sentiment] = (counts[sentiment] || 0) + 1;

        // 💡 Insight
        if (sentiment !== "Neutral") {
          setProgress("Extracting insight…");
          await sleep(RATE_LIMIT);
          const insight = await fetch("/api/insight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ review, sentiment }),
          }).then((r) => r.text());

          // 📥 Log returned insight
          console.log("💡 Insight for", sentiment, ":", insight);

          if (insight) {
            if (sentiment === "Positive") positiveInsights.push(insight);
            else negativeInsights.push(insight);
          }
        }
      }

      // 🗒️ Log accumulators before summarizing
      console.log("✅ positiveInsights:", positiveInsights);
      console.log("✅ negativeInsights:", negativeInsights);
      console.log("✅ sentimentCounts:", counts);

      // 4️⃣ Summarize Delighters
      setProgress("Summarizing Delighters…");
      await sleep(RATE_LIMIT);
      const delightersSummary = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Delighters", insights: positiveInsights }),
      }).then((r) => r.text());

      // 5️⃣ Summarize Detractors
      setProgress("Summarizing Detractors…");
      await sleep(RATE_LIMIT);
      const detractorsSummary = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Detractors", insights: negativeInsights }),
      }).then((r) => r.text());

      // 6️⃣ Done
      setResults({ sentimentCounts: counts, delightersSummary, detractorsSummary });
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
      <input
        id="csv-file"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block"
      />

      {error && <p className="text-red-600">{error}</p>}

      <Button onClick={handleAnalyze} disabled={!file || loading}>
        {loading ? progress : "Analyze Reviews"}
      </Button>

      {results && (
        <div className="space-y-6 mt-6">
          <h3 className="text-lg font-medium">Sentiment Distribution</h3>
          <SentimentBar data={results.sentimentCounts} />

          <h3 className="text-lg font-medium">Delighters</h3>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {results.delightersSummary}
          </pre>

          <h3 className="text-lg font-medium">Detractors</h3>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {results.detractorsSummary || "No detractors found."}
          </pre>
        </div>
      )}
    </div>
  );
}
