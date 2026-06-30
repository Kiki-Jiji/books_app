// books_frontend/src/components/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import FilterSection from './FilterSection';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { setRange, formatDate } from './utils';

const TEAL = '#17929d';
const ORANGE = '#f58231';

function KpiCard({ label, value, sub }) {
  return (
    <div style={{
      flex: '1 1 150px',
      minWidth: '140px',
      background: '#fff',
      border: '1px solid #e2e2e2',
      borderRadius: '8px',
      padding: '14px 16px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: '#222' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function AnalyticsPage() {
  // Default to the last 365 days so the full dataset is visible on load
  // (the 7-day default used elsewhere would show almost no ad data).
  const initial = setRange(365);

  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [groupBy, setGroupBy] = useState('week');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = `http://localhost:8000/ad-spend-vs-royalties?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}`;
    fetch(url)
      .then((res) => res.json())
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, [startDate, endDate, groupBy]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // --- Totals for KPI cards ---
  const totalRoyalty = data.reduce((s, d) => s + (d.royalty || 0), 0);
  const totalCost = data.reduce((s, d) => s + (d.ad_cost || 0), 0);
  const totalImpressions = data.reduce((s, d) => s + (d.impressions || 0), 0);
  const totalClicks = data.reduce((s, d) => s + (d.clicks || 0), 0);
  const spendPct = totalRoyalty > 0 ? (totalCost / totalRoyalty) * 100 : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const gbp = (v) => `£${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <h2>Ad Spend vs Royalties</h2>
      <FilterSection
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        setRange={(days) => {
          const r = setRange(days);
          setStartDate(r.startDate);
          setEndDate(r.endDate);
        }}
        setGroupBy={setGroupBy}
      />

      {/* KPI cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', margin: '16px 0' }}>
        <KpiCard label="Total royalties" value={gbp(totalRoyalty)} />
        <KpiCard label="Total ad spend" value={gbp(totalCost)} />
        <KpiCard label="Ad spend % of royalties" value={`${spendPct.toFixed(1)}%`} />
        <KpiCard label="Impressions" value={totalImpressions.toLocaleString()} sub="data ends ~Apr 8" />
        <KpiCard label="Clicks" value={totalClicks.toLocaleString()} sub="data ends ~Apr 8" />
        <KpiCard label="CTR" value={`${ctr.toFixed(2)}%`} sub="clicks ÷ impressions" />
      </div>

      {/* Composed chart: ad spend bars (right axis) + royalties line (left axis) */}
      <div className="chart-section">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="date" stroke="#666" style={{ fontSize: '14px' }} />
            <YAxis
              yAxisId="left"
              stroke="#666"
              style={{ fontSize: '14px' }}
              label={{ value: 'Royalties (£)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#666"
              style={{ fontSize: '14px' }}
              label={{ value: 'Ad spend (£)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              formatter={(value) => `£${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
            />
            <Legend />
            <Bar yAxisId="right" dataKey="ad_cost" name="Ad spend" fill={ORANGE} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="royalty"
              name="Royalties"
              stroke={TEAL}
              strokeWidth={3}
              dot={false}
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
          Amazon's conversion fields (sales/purchases attributed to ads) are empty in this data, so this
          chart shows ad spend <em>alongside</em> royalties over time — a cost-and-earnings comparison, not
          attributed return on ad spend (ROAS). Impressions and clicks are only recorded through early April.
        </p>
      </div>
    </div>
  );
}

export default AnalyticsPage;
