// books_frontend/src/components/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import FilterSection from './FilterSection';
import RoyaltiesSummary from './RoyaltiesSummary';
import SummaryChart from './SummaryChart';
import { setRange } from './utils';
import { formatDate } from './utils';

function DashboardPage() {
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
    fetch(`http://localhost:8000/daily-sales?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}${titleParam}`)
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
  }, [startDate, endDate, groupBy, selectedBook]);

  if (loading) {
    return <div className="app-container">Loading...</div>;
  }

  return (
    <>
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
        setGroupBy={setGroupBy}
        books={books}
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
      />
      {/* Royalties Summary Section */}
      <RoyaltiesSummary
        totalRoyalties={totalRoyalties}
        startDate={startDate}
        endDate={endDate}
      />
      {/* Chart Section */}
      <SummaryChart data={data} />
    </>
  );
}

export default DashboardPage;