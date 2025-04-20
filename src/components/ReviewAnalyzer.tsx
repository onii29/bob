"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// how many rows to parse
const CSV_PREVIEW_LIMIT = 100;
// how long to wait before aborting fetch
const FETCH_TIMEOUT = 60000;

// 1) Wrap Papa.parse in a Promise so we can await it
function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      preview: CSV_PREVIEW_LIMIT,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

// 2) A simple fetch with timeout/abort
async function fetchWithTimeout(input: RequestInfo, init: RequestInit & { timeout?: number } = {}) {
  const { timeout = FETCH_TIMEOUT, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(input, { ...rest, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export default function ReviewAnalyzer() {
  console.log("🛠️ ReviewAnalyzer mounted");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState<any>(null);  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleAnalyze = async () => {
    console.log("🔍 handleAnalyze fired, file =", file);
    if (!file) {
      toast({ title: "Error", description: "Please upload a CSV first", variant: "destructive" });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setProgress("Parsing CSV…");
      const data = await parseCSV(file);
      console.log("✅ CSV parsed:", data.length, "rows");

      setProgress("Extracting reviews…");
      const reviews = data.map((r: any) => r.Review);
      console.log("➡️ Reviews sample:", reviews.slice(0, 5));

      setProgress("Analyzing sentiments…");
      
      console.log("🔗 Sending fetch…");
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviews }),
        });
        console.log("📬 Response status:", res.status);
        const text = await res.text();
        console.log("📄 Response body:", text);
        if (!res.ok) {
          const message = `HTTP ${res.status}`;
          console.error("❌ Full error in handleAnalyze:", message);
          toast({ title: "Error", description: message, variant: "destructive" });
          throw new Error(message);
        }

        console.log("📑 Parsing response...");
        console.log("📄 Raw response text:", text);

        try {
          const result = JSON.parse(text);
          console.log("📑 analysis result:", result);
          setResults(result);
          setProgress("Rendering results");
        } catch (parseError) {
          console.error("❌ JSON parsing error:", parseError);
        }
    } catch (err: any) {
      console.error("❌ handleAnalyze error:", err);
      const msg = err.message || "An error occurred";
      

      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
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
      />

      <Button
        onClick={() => {
          console.log("🔘 Button clicked");
          handleAnalyze();
        }} 
        disabled={!file || loading}
      >
        {loading ? progress : "Analyze Reviews"}
      </Button>

            {results && (
        <pre className="mt-4 p-4 bg-gray-100">
          {JSON.stringify(results, null, 2)}
        </pre>
      )}

      {error && <p className="text-red-600">{error}</p>}

      {results && (
        <div className="space-y-6">
          <h3>Sentiment Distribution</h3>
          {/* <SentimentBar data={results.sentimentCounts} /> */}

          <h3>Insight Length Histogram</h3>
          {/* <InsightHistogram data={results.insightLengths} /> */}

          <h3>Delighters</h3>
          <pre>{results.delightersSummary}</pre>

          <h3>Detractors</h3>
          <pre>{results.detractorsSummary}</pre>
        </div>
      )}
    </div>
  );
}
