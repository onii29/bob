"use client";
import { Bar } from "react-chartjs-2";

export default function InsightHistogram({ data }: { data: number[] }) {
  const buckets = data.reduce((acc, len) => {
    const key = `${Math.ceil(len/5)*5}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Bar
      data={{
        labels: Object.keys(buckets),
        datasets: [{
          label: "# of Insights",
          data: Object.values(buckets),
          backgroundColor: "rgba(255, 159, 64, 0.5)",
          borderColor:   "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        }],
      }}
      options={{
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }}
    />
  );
}
