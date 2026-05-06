import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import './App.css'

function App() {
  const formatDate = (date) => date.toISOString().split('T')[0];

  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  // --- State ---
  const [startDate, setStartDate] = useState(formatDate(lastWeek));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRoyalties, setTotalRoyalties] = useState(0);
  const [groupBy, setGroupBy] = useState('day');

  // --- Helpers ---
  const setRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  // --- Data Fetching ---
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/daily-sales?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}`)
      .then(res => res.json())
      .then(jsonData => {
        const transformedData = jsonData.map(item => ({
          date: item.date,
          amount: item.royalty
        }));
        setData(transformedData);
        const total = transformedData.reduce((sum, item) => sum + item.amount, 0);
        setTotalRoyalties(total);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, [startDate, endDate, groupBy]);

  if (loading) {
    return <div className="app-container">Loading...</div>
  }

  return (
    <>
      <header className="kdp-header">
        <div className="header-content">
          <span className="kindle-logo">Becky</span>
          <span className="direct-publishing">direct publishing</span>
        </div>
      </header>

      <div className="app-container">
        {/* Filter Section */}
        <div className="date-filter-container">
          <div className="inputs-side">
            <div className="filter-group">
              <label>Start Date</label>
              <div className="input-wrapper">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <div className="input-wrapper">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="quick-select-container">
            {/* Range Column */}
            <div className="quick-column">
              <span className="quick-label">Range</span>
              <button onClick={() => setRange(7)}>Last Week</button>
              <button onClick={() => setRange(30)}>Last Month</button>
              <button onClick={() => setRange(365)}>Last Year</button>
            </div>

            {/* View Column */}
            <div className="quick-column">
              <span className="quick-label">View</span>
              <button onClick={() => setGroupBy('day')}>Daily</button>
              <button onClick={() => setGroupBy('week')}>Weekly</button>
              <button onClick={() => setGroupBy('month')}>Monthly</button>
            </div>
          </div>
        </div>

        {/* Royalties Summary Section */}
        <div className="royalties-container">
          <div className="royalties-main">
            <div className="summary-left">
              <p className="summary-label">Estimated Royalties</p>
              <p className="summary-amount">
                £{totalRoyalties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*
              </p>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-right">
              <p className="summary-info">All 46 books</p>
              <p className="summary-info">
                {startDate} - {endDate}
              </p>
            </div>
          </div>

          <p className="disclaimer">
            This number is rounded and includes estimated subscriptions royalties based on your selections.
          </p>
        </div>

        {/* Chart Section */}
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
      </div>
    </>
  )
}

export default App