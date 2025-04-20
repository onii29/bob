"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ReviewAnalyzer() {
  const [file, setFile] = useState<File|null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] || null);
  }

  async function handleAnalyze() {
    if (!file) {
      toast({ title: "Error", description: "Upload a CSV first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setProgress("Parsing CSV…");

    Papa.parse(file, {
      header: true,
      preview: 100,
      complete: async ({ data }) => {
        setProgress("Extracting reviews…");
        const reviews = data.map((r:any) => r.Review);

        setProgress("Analyzing sentiments…");
        try {
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reviews }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          setProgress("Fetching analysis…");
          const json = await res.json();
          setResults(json);
          setProgress("Rendering results");
          toast({ title: "Success", description: "Analysis complete" });
        } catch (err:any) {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      },
      error: (err:any) => {
        setLoading(false);
        toast({ title: "Parse Error", description: err.message, variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="csv">Choose CSV</Label>
      <input id="csv" type="file" accept=".csv" onChange={handleFileChange} />

      <Button onClick={handleAnalyze} disabled={!file || loading}>
        {loading ? progress : "Analyze Reviews"}
      </Button>

      {results && (
        <div className="space-y-6">
          <div>
            <h3>Sentiment Distribution</h3>
            {/*<SentimentBar data={results.sentimentCounts}/>*/}
          </div>
          <div>
            <h3>Insight Length Histogram</h3>
           {/* <InsightHistogram data={results.insightLengths}/>*/}
          </div>
          <div>
            <h3>Delighters</h3>
            <pre>{results.delightersSummary}</pre>
          </div>
          <div>
            <h3>Detractors</h3>
            <pre>{results.detractorsSummary}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
