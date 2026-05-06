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
import Header from './components/Header'
import FilterSection from './components/FilterSection'
import RoyaltiesSummary from './components/RoyaltiesSummary'
import SummaryChart from './components/SummaryChart'
import { setRange } from '../utils'
import { formatDate } from '../utils'

function App() {

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
      <Header/>

      <div className="app-container">

      <FilterSection
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        setRange={setRange}
        setGroupBy={setGroupBy}
      />  


        {/* Royalties Summary Section */}
        <RoyaltiesSummary
          totalRoyalties={totalRoyalties}
          startDate={startDate}
          endDate={endDate}
        />

        {/* Chart Section */}
        <SummaryChart data={data} />
      </div>
    </>
  )
}

export default App
             