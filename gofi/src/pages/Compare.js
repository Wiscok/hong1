//Compare.js
import React, { useRef, useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useFinancialData } from './Search/useFinancialData.js';
import './Compare.css';
import ChartComponent from './Search/ChartComponent.js'; // ChartComponent default import

// 각 출력 결과를 렌더링하는 React 함수 컴포넌트
function OutputRenderer({ companyData, onDelete, index}) {
  const [localChartType, setLocalChartType] = useState('');
  const localChartRef = useRef(null);
  const { calculateLinearRegression, copyTableToClipboard, copyChartToClipboard } = ChartComponent();
  const subjectLabelMap = {
    '_OperatingIncomeLoss': '영업이익',
    '_ProfitLoss': '당기순이익(포괄손익계산서)',
    '_Revenue': '매출액',
    '_Inventories': '재고자산'
  };

  const getSubjectLabel = (subject) => {
    return subjectLabelMap[subject] || subject;
  };

  const renderChart = () => {
    const chartData = {
      labels: companyData.data.map(item => item.bsns_year),
      datasets: [
        {
          label: getSubjectLabel(companyData.subject),
          data: companyData.data.map(item => parseInt(item.thstrm_amount) / 100000000),
          backgroundColor: localChartType === '원형'
            ? companyData.data.map((_, idx) => `hsl(200, 70%, ${60 - (idx * 5)}%)`)
            : 'rgba(75, 192, 192, 0.6)',
          borderColor: localChartType === '원형'
            ? companyData.data.map((_, idx) => `hsl(200, 70%, ${40 - (idx * 5)}%)`)
            : 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        ...(localChartType !== '원형' ? [{
          label: '추세선',
          data: calculateLinearRegression(companyData.data.map(item => ({
            x: parseInt(item.bsns_year),
            y: parseInt(item.thstrm_amount),
          }))).map(item => item.y),
          type: 'line',
          borderColor: 'red',
          fill: false,
          tension: 0.1,
        }] : []),
      ],
    };

    const commonOptions = {
      scales: {
        y: {
          title: {
            display: true,
            text: '단위: 일억원',
          },
          ticks: {
            callback: (value) => value.toLocaleString(),
          },
        },
      },
    };

    switch (localChartType) {
      case '막대':
        return <Bar ref={localChartRef} data={chartData} options={commonOptions} />;
      case '선':
        return <Line ref={localChartRef} data={chartData} options={commonOptions} />;
      case '원형':
        return <Pie
          ref={localChartRef}
          data={chartData}
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => `${tooltipItem.label} (${(tooltipItem.raw).toLocaleString()} 일억원)`,
                },
              },
            },
          }}
        />;
      default:
        return (
          <table>
            <thead>
              <tr>
                <th>사업연도</th>
                <th>{getSubjectLabel(companyData.subject)} (단위: 일억원)</th>
              </tr>
            </thead>
            <tbody>
              {companyData.data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.bsns_year}</td>
                  <td>{(parseInt(item.thstrm_amount) / 100000000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  return (
    <div className="output-container">
      <div className="output-header">
        <button className="delete-button" onClick={onDelete}>
          ×
        </button>
      </div>
      <div className="output-results">
        <h2>출력 결과:</h2>
        <p style={{ color: 'black', fontSize: '1.2em' }}>{companyData.corp_name}</p>
        {renderChart()}
        <div className="chart-type-options">
          {['', '막대', '선', '원형'].map((type) => (
            <label key={type} className="radio-label">
              <input
                type="radio"
                name={`chartType-${index}`}  // <<< corp_name 대신 index 사용
                value={type}
                checked={localChartType === type}
                onClick={(e) => setLocalChartType(e.target.value)}
              />
              {type === '' ? '표' : type}
            </label>
          ))}
        </div>
        {localChartType === '' ? (
          <button onClick={copyTableToClipboard}>표 복사</button>
        ) : (
          <button onClick={() => copyChartToClipboard(localChartRef)}>
            차트 이미지 복사
          </button>
        )}
      </div>
    </div>
  );
}

function FinancialDataForm() {
  const {
    corpName, setCorpName,
    yearRange, setYearRange,
    subject, setSubject,
    report, setReport,
    fsDiv, setFsDiv,
    allAccountData, setAllAccountData,
    error, loading, dataFetched,
    fetchAllAccountData,
    corpSuggestions, setCorpSuggestions, fetchCorpSuggestions
  } = useFinancialData();

  const searchSectionRef = useRef(null);
  useEffect(() => {
    searchSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSearchClick = () => {
    if (corpName.length >= 2) {
      fetchCorpSuggestions(corpName);
    } else {
      setCorpSuggestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const compareApiEndpoint = 'http://localhost:8000/api/get-all-account-data-forCompare/'; // Compare API 엔드포인트
    fetchAllAccountData(compareApiEndpoint, subject); // API 엔드포인트를 첫 번째 인자로 전달
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'corpName':
        setCorpName(value);
        break;
      case 'yearRange':
        setYearRange(value);
        break;
      case 'subject':
        setSubject(value);
        break;
      case 'report':
        setReport(value);
        break;
      case 'fsDiv':
        setFsDiv(value);
        break;
      default:
        break;
    }
  };

  const handleDeleteResult = (index) => {
    const newData = [...allAccountData];
    newData.splice(index, 1);
    setAllAccountData(newData);
  };

  const handleCorpSelect = (e) => {
    setCorpName(e.target.value);
    setCorpSuggestions([]);
  };

  return (
    <>
      {/* 입력 폼 영역 */}
      <div className="container">
        <h1>원하는 재무정보를 비교해보세요!</h1>
        <section ref={searchSectionRef}></section>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div>
            <input
              type="text"
              name="corpName"
              placeholder="회사이름 입력"
              value={corpName}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <button type="button" onClick={handleSearchClick} className="buttonofName">
              회사이름찾기! (예:삼성)
            </button>

            {corpSuggestions.length > 0 && (
              <select
                name="corpName"
                value={corpName}
                onChange={handleCorpSelect}
                size={5}
                style={{ width: '100%', height: 'auto' }}
              >
                {corpSuggestions.map((corp) => (
                  <option key={corp.corp_code} value={corp.corp_name}>
                    {corp.corp_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <input
            type="text"
            name="yearRange"
            placeholder="사업연도 입력 (예: 2021,2022 또는 2021~2022)"
            value={yearRange}
            onChange={handleInputChange}
            autoComplete="off"
            required
          />
          <div className="selection-group">
            <label htmlFor="subject">계정과목:</label>
            <select
              id="subject"
              name="subject"
              value={subject}
              onChange={handleInputChange}
              required
              className="dropdown"
            >
              <option value="" disabled>선택하세요!</option>
              <option value="_ProfitLoss">당기순이익(포괄손익계산서)</option>
              <option value="_OperatingIncomeLoss">영업이익</option>
              <option value="_Revenue">매출액</option>
              <option value="_Inventories">재고자산</option>
            </select>
          </div>

          <div className="selection-group">
            <label htmlFor="report">보고서유형:</label>
            <select
              id="report"
              name="report"
              value={report}
              onChange={handleInputChange}
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
              name="fsDiv"
              value={fsDiv}
              onChange={handleInputChange}
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
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">데이터 출력 중입니다...</div>
        </div>
      )}

      {/* 출력 결과 영역 */}
      <div className="form-output-container">
    {!loading && dataFetched && allAccountData.length > 0 && (
      <div className="output-row-container">
        {Array.from({ length: Math.ceil(allAccountData.length / 2) }, (_, rowIndex) => (
          <div key={rowIndex} className="output-row">
            {allAccountData
              .slice(rowIndex * 2, rowIndex * 2 + 2)
              .map((company, index) => (
                <OutputRenderer
                  key={company.corp_name + '-' + company.subject}
                  companyData={company}
                  index={rowIndex * 2 + index}
                  onDelete={() => handleDeleteResult(rowIndex * 2 + index)}
                />
              ))}
          </div>
        ))}
      </div>
    )}

    {!loading && dataFetched && allAccountData.length === 0 && !error && (
      <div className="output-container" style={{ width: '100%' }}>
        <p>조회된 데이터가 없습니다.</p>
      </div>
    )}
  </div>
    </>
  );
}

export default FinancialDataForm;