// books_frontend/src/components/Weekly.jsx
import React, { useState, useEffect } from 'react';
import FilterSection from './FilterSection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { setRange } from './utils';
import { formatDate } from './utils';

function Weekly() {
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(formatDate(lastWeek));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRoyalties, setTotalRoyalties] = useState(0);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');

  // --- Fetch book list ---
  useEffect(() => {
    fetch('http://localhost:8000/books')
      .then(res => res.json())
      .then(setBooks)
      .catch(err => console.error('Error loading books:', err));
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    setLoading(true);
    const titleParam = selectedBook ? `&title=${encodeURIComponent(selectedBook)}` : '';
    fetch(`http://localhost:8000/get_day_week_sales?start_date=${startDate}&end_date=${endDate}${titleParam}`) // Adjust the endpoint as needed
      .then(res => res.json())
      .then(jsonData => {
        const transformedData = Object.entries(jsonData).map(([day, amount]) => ({
          day,
          amount
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
  }, [startDate, endDate, selectedBook]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Weekly View</h2>
      <FilterSection 
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        setRange={(days) => {
          const { startDate, endDate } = setRange(days);
          setStartDate(startDate);
          setEndDate(endDate);
        }}
        books={books}
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
      />
      {/* Chart Section */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="day"
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
          <Bar
            dataKey="amount"
            fill="#17929d"
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Weekly;