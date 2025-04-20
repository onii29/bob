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

export default function InsightHistogram({ data }: { data: number[] }) {
  // bucket into ranges of 5 words
  const buckets = data.reduce<Record<string, number>>((acc, len) => {
    const key = `≤${Math.ceil(len / 5) * 5}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <Bar
      data={{
        labels: Object.keys(buckets),
        datasets: [
          {
            label: "# of Insights",
            data: Object.values(buckets),
            backgroundColor: "rgba(255, 159, 64, 0.5)",
            borderColor: "rgba(255, 159, 64, 1)",
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
