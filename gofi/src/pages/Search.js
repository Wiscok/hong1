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
    
    // URL에 파라미터로 데이터를 포함해서 GET 요청 보내기
    const query = `corp_code=${corpCode}&bsns_year=${year}&reprt_code=${report}&subject=${subject}`;
    
    try {
        // API endpoint 수정
        const response = await fetch(`http://localhost:8000/open-dart/get-financial-data/?${query}`, { 
            method: 'GET', 
        });

        if (response.ok) {
            const data = await response.json();
            setFilteredData(data);
            setError(null);
        } else {
            // 응답 상태에 따라 구체적인 에러 메시지 설정
            if (response.status === 404) {
                throw new Error('정보를 찾을 수 없습니다.'); // 404 에러에 대한 메시지
            } else {
                throw new Error('서버 오류가 발생했습니다.'); // 다른 오류에 대한 메시지
            }
        }
    } catch (error) {
        setError(error.message);
        setFilteredData([]);
    }
};


  return (
    <div className="container">
      <h1>원하는 재무정보를 검색해보세요!</h1>
      <form onSubmit={handleSubmit}>
        {/* 사용자 입력 폼 */}
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
        <button type="submit">데이터 조회</button>  {/* 버튼 클릭 시 API 요청 */}
      </form>

      {/* 에러 메시지 출력 */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* 필터링된 데이터 출력 */}
      {filteredData.length > 0 && (
        <div>
          <h2>Filtered Data:</h2>
          <ul>
            {filteredData.map((item, index) => (
              <li key={index}>
                <strong>기업명:</strong> {item.corp_name} <br />
                <strong>사업연도:</strong> {item.bsns_year} <br />
                <strong>계정과목:</strong> {item.account_nm} <br />
                <strong>결과값:</strong> {item.thstrm_amount}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 필터링된 데이터가 없을 경우 */}
      {filteredData.length === 0 && !error && <p>No data found for the selected account.</p>}
    </div>
  );
}

export default FinancialDataForm;