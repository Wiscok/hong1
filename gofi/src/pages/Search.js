import React, { useState } from 'react';
import './Search.css'; 

function FinancialDataForm() {
  const [corpCode, setCorpCode] = useState('');
  const [year, setYear] = useState('');
  const [report, setReport] = useState('');
  const [subject, setSubject] = useState('');
  const [filteredData, setFilteredData] = useState([]); 
  const [error, setError] = useState(null); 

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = `corp_code=${corpCode}&bsns_year=${year}&reprt_code=${report}&subject=${subject}`;
    
    try {
        const response = await fetch(`http://localhost:8000/open-dart/get-financial-data/?${query}`, { 
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            setFilteredData(data);
            setError(null);
        } else {
            if (response.status === 404) {
                throw new Error('정보를 찾을 수 없습니다.');
            } else {
                throw new Error('서버 오류가 발생했습니다.');
            }
        }
    } catch (error) {
        setError(error.message);
        setFilteredData([]);
    }
  };

  // fs_nm (재무제표 종류)에 따라 데이터를 필터링
  const consolidatedData = filteredData.filter(item => item.fs_nm === '연결재무제표');
  const separateData = filteredData.filter(item => item.fs_nm === '재무제표');

  return (
    <div className="container">
      <h1>원하는 재무정보를 검색해보세요!</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="회사코드 입력" 
          value={corpCode} 
          onChange={(e) => handleInputChange(e, setCorpCode)} 
          required 
        />
        <input 
          type="text" 
          placeholder="사업연도 입력" 
          value={year} 
          onChange={(e) => handleInputChange(e, setYear)} 
          required 
        />
        <input 
          type="text" 
          placeholder="보고서 코드 입력" 
          value={report} 
          onChange={(e) => handleInputChange(e, setReport)} 
          required 
        />
        <input 
          type="text" 
          placeholder="계정과목 입력" 
          value={subject} 
          onChange={(e) => handleInputChange(e, setSubject)} 
          required 
        />
        <button type="submit">데이터 조회</button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* 연결재무제표 결과 출력 */}
      {consolidatedData.length > 0 && (
        <div>
          <h2>연결재무제표 결과:</h2>
          <ul>
            {consolidatedData.map((item, index) => (
              <li key={index}>
                <strong>기업코드:</strong> {item.corp_code} <br />
                <strong>사업연도:</strong> {item.bsns_year} <br />
                <strong>계정과목:</strong> {item.account_nm} <br />
                <strong>결과값:</strong> {item.thstrm_amount}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 단일재무제표 결과 출력 */}
      {separateData.length > 0 && (
        <div>
          <h2>단일재무제표 결과:</h2>
          <ul>
            {separateData.map((item, index) => (
              <li key={index}>
                <strong>기업코드:</strong> {item.corp_code} <br />
                <strong>사업연도:</strong> {item.bsns_year} <br />
                <strong>계정과목:</strong> {item.account_nm} <br />
                <strong>{item.account_nm}:</strong> {item.thstrm_amount}
              </li>
            ))}
          </ul>
        </div>
      )}

      {filteredData.length === 0 && !error && <p>No data found for the selected account.</p>}
    </div>
  );
}

export default FinancialDataForm;