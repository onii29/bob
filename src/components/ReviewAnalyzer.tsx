"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ReviewAnalyzer() {
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
    if (!file) {
      toast({ title: "Error", description: "Please upload a CSV first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setError(null);

    try {
      setProgress("Parsing CSV…");
      const data: any[] = await new Promise((resolve, reject) =>
        Papa.parse(file, {
          header: true,
          preview: 100,
          complete: ({ data }) => resolve(data),
          error: (err) => reject(err),
        })
      );
      setProgress("Extracting reviews…");
      const reviews = data.map((r) => r.Review);

      setProgress("Analyzing sentiments…");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews }),
      });

      setProgress("Fetching analysis…");
      const text = await res.text();
      console.log("📝 Analysis text:\n", text);
      setResults(text);
      
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      setProgress("Rendering results");
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

      <Button type="button" onClick={handleAnalyze} disabled={!file || loading}>
        {loading ? progress : "Analyze Reviews"}
      </Button>

      {results && (
        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
          {results}
          </pre>
      )}
    </div>
  );
}
