// src/components/charts/SentimentBar.tsx
import React from 'react';

interface SentimentBarProps {
  data: Record<string, number>;
}

const SentimentBar: React.FC<SentimentBarProps> = ({ data }) => {
  // Placeholder implementation
  return (
    <div>
      {/* Placeholder for Sentiment Bar Chart */}
      <p>Sentiment Bar Chart Placeholder</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default SentimentBar;
