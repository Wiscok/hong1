import React, { useState, useRef, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './Search.css';

// Chart.js의 필요한 요소들을 등록
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

function FinancialDataForm() {
  const searchSectionRef = useRef(null); // 스크롤을 위한 ref

  useEffect(() => {
    // 컴포넌트가 마운트되면 특정 섹션으로 스크롤
    searchSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 상태 관리
  const [corpCode, setCorpCode] = useState(''); // 회사 코드
  const [corpName, setCorpName] = useState(''); // 회사 코드
  const [yearRange, setYearRange] = useState(''); // 사업 연도
  const [subject, setSubject] = useState(''); // 계정 과목
  const [report, setReport] = useState(''); // 보고서 유형
  const [fsDiv, setFsDiv] = useState(''); // 재무제표 종류
  const [allAccountData, setAllAccountData] = useState([]); // 계정 데이터 저장
  const [error, setError] = useState(null); // 에러 상태
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [dataFetched, setDataFetched] = useState(false); // 데이터가 fetch되었는지 여부
  const [chartType, setChartType] = useState(''); // 차트 유형
  const [chartReady, setChartReady] = useState(false); // 차트 준비 상태
  const [submittedSubject, setSubmittedSubject] = useState(''); // 제출된 계정 과목

  // 입력값 변경 핸들러
  const handleInputChange = (e, setter) => {
    setter(e.target.value); // 입력값을 상태로 업데이트
  };

  // 데이터 Fetching 함수
  const fetchAllAccountData = async () => {
    setLoading(true); // 로딩 시작
    setError(null); // 에러 초기화
    setDataFetched(false); // 데이터가 fetch되지 않았다고 설정

    const years = []; // 연도를 저장할 배열
    if (yearRange.includes('~')) {
      // 연도 범위 처리
      const [startYear, endYear] = yearRange.split('~').map(y => y.trim());
      for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
        years.push(year.toString()); // 연도 배열에 추가
      }
    } else {
      years.push(...yearRange.split(',').map(y => y.trim()).filter(Boolean)); // 쉼표로 구분된 연도 처리
    }

    try {
      const query = `corp_name=${corpName}&year=${years.join(',')}&reprt_code=${report}&subject=${submittedSubject}&fs_div=${fsDiv}`; // API 쿼리 생성
      const response = await fetch(`http://localhost:8000/open-dart/get-all-account-data/?${query}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json(); // JSON 형태로 응답 처리
        setAllAccountData(data); // 상태 업데이트
        setChartReady(true); // 차트 준비 상태 업데이트
      } else {
        throw new Error('데이터 조회 오류'); // 에러 발생 시 예외 처리
      }
    } catch (error) {
      setError(error.message); // 에러 메시지 저장
      setAllAccountData([]); // 데이터 초기화
    } finally {
      setLoading(false); // 로딩 종료
      setDataFetched(true); // 데이터 fetch 완료 상태 업데이트
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 폼 제출 방지
    setSubmittedSubject(subject); // 제출된 계정 과목 업데이트
    fetchAllAccountData(); // 데이터 fetch 호출
  };

  // 차트 데이터 준비
  const chartData = {
    labels: allAccountData.map(item => item.bsns_year), // x축 레이블
    datasets: [
      {
        label: submittedSubject, // 데이터셋 레이블
        data: allAccountData.map(item => parseInt(item.thstrm_amount) / 1000000), // 백만원 단위로 변환
        backgroundColor: chartType === '원형'
          ? allAccountData.map((_, index) => `hsl(200, 70%, ${60 - (index * 5)}%)`) // 원형 차트 색상
          : 'rgba(75, 192, 192, 0.6)', // 다른 차트 색상
        borderColor: chartType === '원형'
          ? allAccountData.map((_, index) => `hsl(200, 70%, ${40 - (index * 5)}%)`)
          : 'rgba(75, 192, 192, 1)', // 테두리 색상
        borderWidth: 1, // 테두리 두께
      },
    ],
  };

  // 차트 렌더링 함수
  const renderChart = () => {
    const commonOptions = {
      scales: {
        y: {
          title: {
            display: true,
            text: '단위: 백만원', // y축 제목
          },
          ticks: {
            callback: (value) => `${value.toLocaleString()}`, // y축 값 포맷
          },
        },
      },
    };

    // 차트 유형에 따라 렌더링
    switch (chartType) {
      case '막대':
        return <Bar data={chartData} options={commonOptions} />; // 막대 차트
      case '선':
        return <Line data={chartData} options={commonOptions} />; // 선 차트
      case '원형':
        return (
          <Pie 
            data={chartData} 
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => `${tooltipItem.label} (${(tooltipItem.raw).toLocaleString()} 백만원)`, // 툴팁 포맷
                  },
                },
              },
            }} 
          /> // 원형 차트
        );
      default:
        // 기본 출력 테이블
        return (
          <table>
            <thead>
              <tr>
                <th>사업연도</th>
                <th>{submittedSubject} (단위: 백만원)</th>
              </tr>
            </thead>
            <tbody>
              {allAccountData.map((item, index) => (
                <tr key={index}>
                  <td>{item.bsns_year}</td>
                  <td>{(parseInt(item.thstrm_amount) / 1000000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  return (
    <div className="container">
      <h1>원하는 재무정보를 검색해보세요!</h1>
      <section ref={searchSectionRef}></section>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="회사이름 입력" 
          value={corpName} 
          onChange={(e) => handleInputChange(e, setCorpName)} 
          required 
        />
        <input 
          type="text" 
          placeholder="사업연도 입력 (예: 2021,2022 또는 2021~2022)" 
          value={yearRange} 
          onChange={(e) => handleInputChange(e, setYearRange)} 
          required 
        />
        <input 
          type="text" 
          placeholder="계정과목 입력" 
          value={subject} 
          onChange={(e) => handleInputChange(e, setSubject)} 
          required 
        />

        <div className="selection-group">
          <label htmlFor="report">보고서유형:</label>
          <select 
            id="report" 
            value={report} 
            onChange={(e) => setReport(e.target.value)} 
            required
            className="dropdown"
          >
            <option value="" disabled>선택하세요!</option>
            <option value="11011">사업보고서</option>
            <option value="11012">반기보고서</option>
            <option value="11013">1분기보고서</option>
            <option value="11014">3분기보고서</option>
          </select>
        </div>

        <div className="selection-group">
          <label htmlFor="fsDiv">재무제표종류:</label>
          <select 
            id="fsDiv" 
            value={fsDiv} 
            onChange={(e) => setFsDiv(e.target.value)} 
            required
            className="dropdown"
          >
            <option value="" disabled>선택하세요!</option>
            <option value="OFS">단일재무제표</option>
            <option value="CFS">연결재무제표</option>
          </select>
        </div>
        
        <button type="submit">데이터 조회</button>
      </form>

      <div className="form-output-container">
        <div className="output-container">
          {loading && <p className="loading">데이터 출력 중입니다...</p>} {/* 로딩 중 메시지 */}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>} {/* 에러 메시지 */}
          
          {dataFetched && allAccountData.length > 0 && (
            <div className="output-results">
              <h2>출력 결과:</h2>
              <p style={{ color: 'black', fontSize: '1.2em' }}>{allAccountData[0].corp_name}</p>

              {chartReady && (
                <>
                  {renderChart()} {/* 차트 렌더링 */}
                  <div className="chart-type-options">
                    <label className="radio-label">
                      <input type="radio" name="chartType" value="" checked={chartType === ''} onChange={(e) => setChartType(e.target.value)} /> 표
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="chartType" value="막대" checked={chartType === '막대'} onChange={(e) => setChartType(e.target.value)} /> 막대
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="chartType" value="선" checked={chartType === '선'} onChange={(e) => setChartType(e.target.value)} /> 선
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="chartType" value="원형" checked={chartType === '원형'} onChange={(e) => setChartType(e.target.value)} /> 원형
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
          {dataFetched && allAccountData.length === 0 && !loading && !error && (
            <p>해당 계정과목의 데이터가 존재하지 않습니다.</p> // 데이터가 없을 때 메시지
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancialDataForm; // 컴포넌트 내보내기
