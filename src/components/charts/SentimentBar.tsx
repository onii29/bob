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

// Register the necessary chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SentimentBarProps {
  data: Record<string, number>;
}

export default function SentimentBar({ data }: SentimentBarProps) {
  const labels = Object.keys(data);
  const counts = Object.values(data);

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "Review Count",
            data: counts,
            // you can customize colors here if you like
            // backgroundColor: "rgba(54,162,235,0.5)",
            // borderColor: "rgba(54,162,235,1)",
            borderWidth: 1,
            barPercentage: 0.6,     // width of each bar relative to category
            categoryPercentage: 0.8 // spacing between bars
          },
        ],
      }}
      options={{
        responsive: true,
        scales: {
          x: {
            offset: true,         // center bars under their labels
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,        // show integer ticks
            },
          },
        },
        plugins: {
          legend: {
            display: true,
          },
          title: {
            display: false,
          },
        },
      }}
    />
  );
}
