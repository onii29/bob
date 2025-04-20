// src/components/charts/SentimentBar.tsx
"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SentimentBar({ data }: { data: Record<string, number> }) {
  return (
    <Bar
      data={{
        labels: Object.keys(data),
        datasets: [{
          label: "Review Count",
          data: Object.values(data),
          backgroundColor: "rgba(54,162,235,0.5)",
          borderColor: "rgba(54,162,235,1)",
          borderWidth: 1,
          barPercentage: 0.6,     // narrower bars
          categoryPercentage: 0.8 // more padding
        }],
      }}
      options={{
        responsive: true,
        scales: {
          x: {
            offset: true         // center bars on labels
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          },
        },
      }}
    />
  );
}
