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

export default function SentimentBar({ data }: { data: Record<string, number> }) {
  return (
    <Bar
      data={{
        labels: Object.keys(data),
        datasets: [{ label: "Review Count", data: Object.values(data) }],
      }}
      options={{ responsive: true }}
    />
  );
}
