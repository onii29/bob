"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function InsightHistogram({ data }: { data: number[] }) {
  // bucket into ranges of 5 words
  const buckets = data.reduce((acc, len) => {
    const key = `≤${Math.ceil(len / 5) * 5}`;
    acc[key] = (acc[key] || 0) + 1;
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
