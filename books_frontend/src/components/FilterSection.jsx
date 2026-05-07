// books_frontend/src/components/FilterSection.jsx
import React from 'react';
import '../App.css';

function FilterSection({ startDate, setStartDate, endDate, setEndDate, setRange, setGroupBy, books, selectedBook, setSelectedBook }) {
  return (
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

        {books && (
          <div className="filter-group">
            <label>Book</label>
            <div className="input-wrapper">
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="book-select"
              >
                <option value="">All Books</option>
                {books.map((b) => (
                  <option key={b.title} value={b.title}>{b.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}
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
        {setGroupBy && (
          <div className="quick-column">
            <span className="quick-label">View</span>
            <button onClick={() => setGroupBy('day')}>Daily</button>
            <button onClick={() => setGroupBy('week')}>Weekly</button>
            <button onClick={() => setGroupBy('month')}>Monthly</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterSection;