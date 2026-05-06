// books_frontend/src/components/RoyaltiesSummary.jsx
import React from 'react';
import '../App.css';

function RoyaltiesSummary({ totalRoyalties, startDate, endDate }) {
  return (
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
  );
}

export default RoyaltiesSummary;