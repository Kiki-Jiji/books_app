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
  const [seriesKeys, setSeriesKeys] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalRoyalties, setTotalRoyalties] = useState(0);
  const [groupBy, setGroupBy] = useState('day');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [groups, setGroups] = useState([]);
  const [bookGroups, setBookGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState('');
  const [filterMode, setFilterMode] = useState('series');

  // --- Fetch book list, groups, and book-group mappings ---
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/books').then(r => r.json()),
      fetch('http://localhost:8000/get_existing_groups').then(r => r.json()),
      fetch('http://localhost:8000/get_book_groups').then(r => r.json()),
    ])
      .then(([booksData, groupsData, bookGroupsData]) => {
        setBooks(booksData);
        setGroups(groupsData);
        const map = {};
        bookGroupsData.forEach(({ book, group_name }) => {
          map[book] = group_name;
        });
        setBookGroups(map);
      })
      .catch(err => console.error('Error loading data:', err));
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    setLoading(true);

    let url;
    if (filterMode === 'series' && selectedGroup) {
      const titlesInGroup = Object.entries(bookGroups)
        .filter(([, group]) => group === selectedGroup)
        .map(([book]) => book);
      const titlesParam = titlesInGroup.map(t => `titles=${encodeURIComponent(t)}`).join('&');
      url = `http://localhost:8000/daily-sales-multiple?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}&${titlesParam}`;
    } else if (filterMode === 'book' && selectedBook) {
      url = `http://localhost:8000/daily-sales?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}&title=${encodeURIComponent(selectedBook)}`;
    } else {
      url = `http://localhost:8000/daily-sales?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(jsonData => {
        let transformedData;
        if (filterMode === 'series' && selectedGroup) {
          // Build merged rows: { date, title1: val, title2: val, ..., total: sum }
          const dateMap = {};
          const titles = jsonData.map(entry => entry.title);
          jsonData.forEach(entry => {
            entry.records.forEach(({ date, royalty }) => {
              if (!dateMap[date]) {
                dateMap[date] = { date, total: 0 };
              }
              dateMap[date][entry.title] = (dateMap[date][entry.title] || 0) + royalty;
              dateMap[date].total += royalty;
            });
          });
          transformedData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
          setSeriesKeys(titles);
        } else {
          transformedData = jsonData.map(item => ({
            date: item.date,
            amount: item.royalty
          }));
          setSeriesKeys(null);
        }
        setData(transformedData);
        const total = (filterMode === 'series' && selectedGroup)
          ? transformedData.reduce((sum, item) => sum + (item.total || 0), 0)
          : transformedData.reduce((sum, item) => sum + item.amount, 0);
        setTotalRoyalties(total);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, [startDate, endDate, groupBy, selectedBook, filterMode, selectedGroup, bookGroups]);

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
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        filterMode={filterMode}
        setFilterMode={setFilterMode}
      />
      {/* Royalties Summary Section */}
      <RoyaltiesSummary
        totalRoyalties={totalRoyalties}
        startDate={startDate}
        endDate={endDate}
      />
      {/* Chart Section */}
      <SummaryChart data={data} seriesKeys={seriesKeys} />
    </>
  );
}

export default DashboardPage;