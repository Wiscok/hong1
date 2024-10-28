import React, { useState, useRef, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './Search.css';

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

function FinancialDataForm() {
  const searchSectionRef = useRef(null);

  useEffect(() => {
    searchSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const [corpCode, setCorpCode] = useState('');
  const [yearRange, setYearRange] = useState('');
  const [subject, setSubject] = useState('');
  const [report, setReport] = useState('');
  const [fsDiv, setFsDiv] = useState('');
  const [allAccountData, setAllAccountData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [chartType, setChartType] = useState('');
  const [chartReady, setChartReady] = useState(false);
  const [submittedSubject, setSubmittedSubject] = useState('');

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
  };

  const fetchAllAccountData = async () => {
    setLoading(true);
    setError(null);
    setDataFetched(false);

    const years = [];
    if (yearRange.includes('~')) {
      const [startYear, endYear] = yearRange.split('~').map(y => y.trim());
      for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
        years.push(year.toString());
      }
    } else {
      years.push(...yearRange.split(',').map(y => y.trim()).filter(Boolean));
    }

    try {
      const query = `corp_code=${corpCode}&year=${years.join(',')}&reprt_code=${report}&subject=${submittedSubject}&fs_div=${fsDiv}`;
      const response = await fetch(`http://localhost:8000/open-dart/get-all-account-data/?${query}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setAllAccountData(data);
        setChartReady(true);
      } else {
        throw new Error('데이터 조회 오류');
      }
    } catch (error) {
      setError(error.message);
      setAllAccountData([]);
    } finally {
      setLoading(false);
      setDataFetched(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedSubject(subject);
    fetchAllAccountData();
  };

  const chartData = {
    labels: allAccountData.map(item => item.bsns_year),
    datasets: [
      {
        label: submittedSubject,
        data: allAccountData.map(item => parseInt(item.thstrm_amount) / 1000000), // 백만 단위로 변환
        backgroundColor: chartType === '도형'
          ? allAccountData.map((_, index) => `hsl(200, 70%, ${60 - (index * 5)}%)`)
          : 'rgba(75, 192, 192, 0.6)',
        borderColor: chartType === '도형'
          ? allAccountData.map((_, index) => `hsl(200, 70%, ${40 - (index * 5)}%)`)
          : 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const renderChart = () => {
    const commonOptions = {
      scales: {
        y: {
          title: {
            display: true,
            text: '단위: 백만',
          },
          ticks: {
            callback: (value) => `${value.toLocaleString()}`, // 값은 백만 단위로 표시
          },
        },
      },
    };

    switch (chartType) {
      case '막대':
        return <Bar data={chartData} options={commonOptions} />;
      case '선':
        return <Line data={chartData} options={commonOptions} />;
      case '도형':
        return (
          <Pie 
            data={chartData} 
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => `${tooltipItem.label} (${(tooltipItem.raw).toLocaleString()} 백만 원)`,
                  },
                },
              },
            }} 
          />
        );
      default:
        return (
          <table>
            <thead>
              <tr>
                <th>사업연도</th>
                <th>{submittedSubject} (단위: 백만)</th>
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
          placeholder="회사코드 입력" 
          value={corpCode} 
          onChange={(e) => handleInputChange(e, setCorpCode)} 
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
          {loading && <p className="loading">데이터 출력 중입니다...</p>}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          
          {dataFetched && allAccountData.length > 0 && (
            <div className="output-results">
              <h2>출력 결과:</h2>
              <p style={{ color: 'black', fontSize: '1.2em' }}>{allAccountData[0].corp_name}</p>

              {chartReady && (
                <>
                  {renderChart()}
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
                      <input type="radio" name="chartType" value="도형" checked={chartType === '도형'} onChange={(e) => setChartType(e.target.value)} /> 도형
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
          {dataFetched && allAccountData.length === 0 && !loading && !error && (
            <p>해당 계정과목의 데이터가 존재하지 않습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancialDataForm;
