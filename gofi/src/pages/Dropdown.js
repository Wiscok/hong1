// Dropdown.js
import React from 'react';
import './Dropdown.css'; // 스타일을 위한 별도 파일

function Dropdown({ label, options, value, onChange, required }) {
  return (
    <div className="selection-group">
      <label>{label}:</label>
      <select 
        value={value} 
        onChange={onChange} 
        required={required} 
        className="dropdown"
      >
        <option value="" disabled>선택하세요!</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown;
