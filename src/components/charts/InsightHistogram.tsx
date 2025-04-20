// src/components/charts/InsightHistogram.tsx
import { Bar } from "react-chartjs-2";

export default function InsightHistogram({ data }: { data: number[] }) {
  // bucket counts by length, e.g. 1–5,6–10, etc.
  const buckets = data.reduce((acc, len) => {
    const key = `${Math.ceil(len/5)*5}`;
    acc[key] = (acc[key]||0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Bar
      data={{
        labels: Object.keys(buckets),
        datasets: [{ label: "# of Insights", data: Object.values(buckets) }],
      }}
      options={{ responsive: true }}
    />
  );
}



