// books_frontend/src/components/SummaryChart.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990'];

function SummaryChart({ data, seriesKeys }) {
  const [hidden, setHidden] = useState(new Set());

  // Reset hidden lines when seriesKeys change
  useEffect(() => {
    setHidden(new Set());
  }, [seriesKeys]);

  const handleLegendClick = (entry) => {
    const key = entry.dataKey;
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', padding: '8px 0' }}>
        {payload.map((entry) => (
          <span
            key={entry.dataKey}
            onClick={() => handleLegendClick(entry)}
            style={{
              cursor: 'pointer',
              color: hidden.has(entry.dataKey) ? '#ccc' : entry.color,
              textDecoration: hidden.has(entry.dataKey) ? 'line-through' : 'none',
              fontSize: '13px',
            }}
          >
            ● {entry.value}
          </span>
        ))}
      </div>
    );
  };

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
          {seriesKeys ? (
            <>
              <Legend content={renderLegend} />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#17929d"
                strokeWidth={4}
                dot={false}
                isAnimationActive={true}
                hide={hidden.has('total')}
              />
              {seriesKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={true}
                  hide={hidden.has(key)}
                />
              ))}
            </>
          ) : (
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#17929d"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SummaryChart;