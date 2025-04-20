// src/components/ReviewAnalyzer.tsx
// src/components/ReviewAnalyzer.tsx
"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SentimentBar from "@/components/charts/SentimentBar";

const RATE_LIMIT = 4000; // ms between requests (~15/min)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ReviewAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("Loading...");

  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setError(null);
    } else {
      setFile(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      return;
    }
    setLoading(true);
    setError(null);
    setProgress("Loading...");
    let csvData: any[] = [];

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        csvData = results.data;
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
      },
    });

    const chunks = csvData.reduce((acc, _, i) => {
      if (i % 50 === 0) {
        acc.push(csvData.slice(i, i + 50));
      }
      return acc;
    }, [] as any[][]);

    const responses: any[] = [];

    for (const [i, chunk] of chunks.entries()) {
      try {
        const summaryRes = await fetch("/api/summarize", {
          method: "POST",
          body: JSON.stringify({ reviews: chunk }),
        });
        const summaryData = await summaryRes.json();

        // add responses
        responses.push(summaryData);

        setProgress(`Analyzing chunk ${i + 1}/${chunks.length}...`);
      } catch (error) {
        console.error("Error during API call:", error);
        toast({
          variant: "destructive",
          description: `Error on chunk ${i + 1}/${chunks.length}: ${error}`,
        });
      }

      await sleep(RATE_LIMIT);
    }

    // once done
    const sentimentCounts = responses.reduce((acc, res) => {
      res.sentimentCounts.forEach((s: string) => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    const delightersSummary = responses
      .map((res) => res.delighters)
      .flat()
      .join("
");
    const detractorsSummary = responses
      .map((res) => res.detractors)
      .flat()
      .join("\n\n");
    const positiveInsights = responses.map((res) => res.positiveInsights).flat();
    const negativeInsights = responses.map((res) => res.negativeInsights).flat();

    setResults({
      sentimentCounts,
      delightersSummary,
      detractorsSummary,
    });
    setLoading(false);

    console.log("🔍 Final payload:", {
      sentimentCounts: sentimentCounts,
      positiveInsights,
      negativeInsights,
      delightersSummary: delightersSummary,
      detractorsSummary: detractorsSummary,
    });
  };

  return (
    <div className="space-y-6">
      <Label htmlFor="file" className="block">
        Upload a CSV with 'review' column:
      </Label>
      <input type="file" id="file" onChange={handleFileChange} />

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
            {results.detractorsSummary}
          </pre>
        </div>
      )}
    </div>
  );
}

");

    setResults({
      sentimentCounts,
      delightersSummary,
      detractorsSummary,
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Label htmlFor="file" className="block">
        Upload a CSV with 'review' column:
      </Label>
      <input type="file" id="file" onChange={handleFileChange} />

      {error && <p className="text-red-600">{error}</p>}

      <Button onClick={handleAnalyze} disabled={!file || loading}>
        {loading ? "Loading..." : "Analyze Reviews"}
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
            {results.detractorsSummary}
          </pre>
        </div>
      )}
    </div>
  );
}

