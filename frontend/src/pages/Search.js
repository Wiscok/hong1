import React, { useState } from 'react';
import './Search.css'; 

function FinancialDataForm() {
  // 사용자가 입력한 데이터를 저장하는 상태 값
  const [corpCode, setCorpCode] = useState('');
  const [year, setYear] = useState('');
  const [report, setReport] = useState('');
  const [subject, setSubject] = useState('');
  const [filteredData, setFilteredData] = useState([]); // 필터링된 데이터를 저장
  const [error, setError] = useState(null); // 에러 상태 저장

  // 입력 필드가 변경될 때 상태를 업데이트하는 함수
  const handleInputChange = (e, setter) => {
    setter(e.target.value);
  };

  // 폼 제출 시 호출되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = { corpCode, year, report, subject }; // 사용자 입력 데이터

    try {
      // Django 서버에 POST 요청을 보냄
      const response = await fetch('http://localhost:8000/api/financial-data/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData), // 요청 데이터 JSON 형태로 전송
      });

      if (response.ok) {
        const data = await response.json(); // 서버로부터 받은 응답 데이터
        setFilteredData(data); // 필터링된 데이터 저장
        setError(null); // 에러 상태 초기화
      } else {
        throw new Error('일치하는 정보가 없습니다');
      }
    } catch (error) {
      setError(error.message); // 에러 발생 시 에러 메시지 설정
      setFilteredData([]); // 데이터 초기화
    }
  };

  return (
    <div className="container">
      <h1>원하는 재무정보를 검색해보세요!</h1>
      <form onSubmit={handleSubmit}>
        {/* 각 입력 필드에 값이 변경되면 handleInputChange 함수가 호출됨 */}
        <input type="text" placeholder="회사코드입력" value={corpCode} onChange={(e) => handleInputChange(e, setCorpCode)} required />
        <input type="text" placeholder="사업연도입력" value={year} onChange={(e) => handleInputChange(e, setYear)} required />
        <input type="text" placeholder="보고서 코드입력" value={report} onChange={(e) => handleInputChange(e, setReport)} required />
        <input type="text" placeholder="계정과목 입력" value={subject} onChange={(e) => handleInputChange(e, setSubject)} required />
        <button type="submit">데이터 조회</button>  {/* 버튼 클릭 시 API 호출 */}
      </form>

      {/* 에러 발생 시 에러 메시지 출력 */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* 필터링된 데이터가 있을 경우 화면에 출력 */}
      {filteredData.length > 0 && (
        <div>
          <h2>Filtered Data:</h2>
          <ul>
            {filteredData.map((item, index) => (
              <li key={index}>
                <strong>기업명:</strong> {item.corp_name} <br />
                <strong>사업연도:</strong> {item.year} <br />
                <strong>계정과목:</strong> {item.account} <br />
                <strong>결과값:</strong> {item.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 데이터가 없고 에러도 없는 경우 표시 */}
      {filteredData.length === 0 && !error && <p>No data found for the selected account.</p>}
    </div>
  );
}

export default FinancialDataForm;