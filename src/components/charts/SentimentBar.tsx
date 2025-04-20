import { Bar } from "react-chartjs-2";

export default function SentimentBar({ data }: { data: Record<string, number> }) {
  return (
    <Bar
      data={{
        labels: Object.keys(data),
        datasets: [{ label: "Count", data: Object.values(data) }],
      }}
      options={{ responsive: true }}
    />
  );
}

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
ChartJS.register(CategoryScale,LinearScale,BarElement);
