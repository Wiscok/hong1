import React, { useState } from 'react';
import './Search.css'; 

function FinancialDataForm() {
  // 사용자가 입력한 정보를 저장하는 상태 변수
  const [corpCode, setCorpCode] = useState('');
  const [year, setYear] = useState('');
  const [report, setReport] = useState('');
  const [subject, setSubject] = useState('');
  const [fsDiv, setFsDiv] = useState(''); // fs_div (재무제표 종류) 필드 추가

  // 조회한 데이터와 에러 메시지를 저장하는 상태 변수
  const [mainAccountData, setMainAccountData] = useState([]);
  const [allAccountData, setAllAccountData] = useState([]);
  const [error, setError] = useState(null);

  // 입력값 변경 시 상태 업데이트
  const handleInputChange = (e, setter) => {
    setter(e.target.value);
  };

  // 주요 계정과목 데이터를 조회하는 함수
  const fetchMainAccountData = async () => {
    const query = `corp_code=${corpCode}&bsns_year=${year}&reprt_code=${report}&subject=${subject}`;
    
    try {
      const response = await fetch(`http://localhost:8000/open-dart/get-main-account-data/?${query}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setMainAccountData(data);
        setError(null);
      } else {
        throw new Error('주요 계정과목 데이터를 조회하는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError(error.message);
      setMainAccountData([]);
    }
  };

  // 전체 계정과목 데이터를 조회하는 함수 (fs_div 포함)
  const fetchAllAccountData = async () => {
    const query = `corp_code=${corpCode}&bsns_year=${year}&reprt_code=${report}&fs_div=${fsDiv}`;

    try {
      const response = await fetch(`http://localhost:8000/open-dart/get-all-account-data/?${query}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        // 사용자가 입력한 계정과목으로 데이터 필터링
        const filteredData = data.filter(item => item.account_nm === subject);
        setAllAccountData(filteredData);
        setError(null);
      } else {
        throw new Error('전체 계정과목 데이터를 조회하는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError(error.message);
      setAllAccountData([]);
    }
  };

  // 폼 제출 시 두 가지 조회 함수 호출
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchMainAccountData();
    fetchAllAccountData();
  };

  return (
    <div className="container">
      <h1>원하는 재무정보를 검색해보세요!</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="회사코드 입력" value={corpCode} onChange={(e) => handleInputChange(e, setCorpCode)} required />
        <input type="text" placeholder="사업연도 입력" value={year} onChange={(e) => handleInputChange(e, setYear)} required />
        <input type="text" placeholder="보고서 코드 입력" value={report} onChange={(e) => handleInputChange(e, setReport)} required />
        <input type="text" placeholder="계정과목 입력" value={subject} onChange={(e) => handleInputChange(e, setSubject)} required />
        <input type="text" placeholder="연결/개별 (개별:OFS,연결:CFS)" value={fsDiv} onChange={(e) => handleInputChange(e, setFsDiv)} required />
        <button type="submit">데이터 조회</button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* 주요 계정과목 데이터를 출력 */}
      {mainAccountData.length > 0 && (
        <div>
          <h2>주요 계정 과목 데이터:</h2>
          <ul>
            {mainAccountData.map((item, index) => (
              <li key={index}>
                <strong>기업명:</strong> {item.corp_name} <br />
              <strong>기업코드:</strong> {item.corp_code} <br />
              <strong>사업연도:</strong> {item.bsns_year} <br />
              <strong>{item.account_nm}:</strong> {item.thstrm_amount}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 전체 계정과목 데이터를 출력 */}
      {allAccountData.length > 0 && (
        <div>
          <h2>전체 계정 과목 데이터:</h2>
          <ul>
            {allAccountData.map((item, index) => (
              <li key={index}>
              <strong>기업명:</strong> {item.corp_name} <br />
              <strong>기업코드:</strong> {item.corp_code} <br />
              <strong>사업연도:</strong> {item.bsns_year} <br />
              <strong>{item.account_nm}:</strong> {item.thstrm_amount}
                {/* 금액에 쉼표추가해서 표시 */}
              </li>
            ))}
          </ul>
        </div>
      )}

      {mainAccountData.length === 0 && allAccountData.length === 0 && !error && (
        <p>해당 계정과목의 데이터가 존재하지 않습니다.</p>
      )}
    </div>
  );
}

export default FinancialDataForm;
