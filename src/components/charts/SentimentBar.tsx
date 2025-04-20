"use client";

// 1️⃣ Register necessary Chart.js components
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

// 2️⃣ Import the React wrapper
import { Bar } from "react-chartjs-2";

export default function SentimentBar({ data }: { data: Record<string, number> }) {
  return (
    <Bar
      data={{
        labels: Object.keys(data),
        datasets: [
          {
            label: "Review Count",
            data: Object.values(data),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      }}
      options={{
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      }}
    />
  );
}
