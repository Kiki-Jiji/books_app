// books_frontend/src/utils.js
export const setRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  
  return {
    startDate: formatDate(start),
    endDate: formatDate(end)
  };
};

export const formatDate = (date) => date.toISOString().split('T')[0];