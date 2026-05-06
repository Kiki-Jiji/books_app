// books_frontend/src/components/SummaryChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function SummaryChart({ data }) {
  return (
    <div className="chart-section">
      <h2>Subscriptions royalties are estimated for April 2026.</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="date"
            stroke="#666"
            style={{ fontSize: '14px' }}
          />
          <YAxis
            stroke="#666"
            style={{ fontSize: '14px' }}
            label={{ value: 'Estimated GBP', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value) => `£${value.toFixed(2)}`}
            contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#17929d"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SummaryChart;