import React from 'react';

const ConnectionIndicator = ({ quality }) => {
  const iconMap = {
    excellent: 'bi-wifi',
    good: 'bi-wifi',
    fair: 'bi-wifi-2',
    poor: 'bi-wifi-1'
  };

  return (
    <div className={`connection-quality ${quality}`}>
      <i className={`bi ${iconMap[quality] || 'bi-wifi'}`} />
      <span>{quality}</span>
    </div>
  );
};

export default ConnectionIndicator;