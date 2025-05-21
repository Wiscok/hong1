// Test1.js
import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import './Compare.css';
import AccountDropdown from './AccountDropdown';
import CorpSearch from './CorpSearch';

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const SearchPage = () => {
    const [inputYearsInput, setInputYearsInput] = useState('');
    const [inputReportCode, setInputReportCode] = useState('');
    const [inputFsDiv, setInputFsDiv] = useState('');

    const [corpName, setCorpName] = useState('');
    const [years, setYears] = useState([]);
    const [reportCode, setReportCode] = useState('');
    const [fsDiv, setFsDiv] = useState('');

    const [selectedAccounts, setSelectedAccounts] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadAccountsTrigger, setLoadAccountsTrigger] = useState(false);

    const handleLoadAccountsButtonClick = () => {
        setYears(inputYearsInput.split(/[\s,~,]+/).filter(Boolean));
        setReportCode(inputReportCode);
        setFsDiv(inputFsDiv);
        setLoadAccountsTrigger(true);
    };

    const handleAccountChange = (year, account) => {
        setSelectedAccounts(prev => ({ ...prev, [year]: account }));
        console.log(`연도 ${year}의 선택된 계정:`, account);
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handleSearchButtonClick = async () => {
        console.log('검색 버튼 클릭!');
        console.log('선택된 계정과목:', selectedAccounts);
        if (!corpName || years.length === 0 || Object.keys(selectedAccounts).length !== years.length) {
            alert('기업명, 연도, 계정과목을 모두 선택해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        const allRequests = years.map(year => {
            console.log(`[${year}] 요청 파라미터:`, {
                corp_name: corpName,
                year: year,
                reprt_code: reportCode,
                fs_div: fsDiv,
                subject: selectedAccounts[year]
            });
            return axios.get('http://localhost:8000/open-dart/get-all-account-data/', {
                params: {
                    corp_name: corpName,
                    year: year,
                    reprt_code: reportCode,
                    fs_div: fsDiv,
                    subject: selectedAccounts[year]
                }
            });
        });

        Promise.all(allRequests)
            .then(responses => {
                const allData = responses.flatMap(res => res.data);
                console.log('✅ 계정 값 데이터:', allData);
                setSearchResults(allData);
                setLoading(false);
            })
            .catch(error => {
                console.error('❌ 계정 값 데이터 불러오기 실패:', error);
                setError('데이터를 불러오는데 실패했습니다.');
                setLoading(false);
            });
    };

    const chartData = {
        labels: years,
        datasets: Object.entries(selectedAccounts).map(([year, account]) => {
            const dataPoint = searchResults.find(
                item => item.bsns_year === year && item.account_nm === account
            );
            const amount = dataPoint ? parseInt(dataPoint.thstrm_amount) / 1000000 : null;
            const color = getRandomColor();
            return {
                label: `${account} (${year})`,
                data: years.map(y => (y === year ? amount : null)),
                backgroundColor: years.map(y => (y === year ? color : 'transparent')),
                borderColor: years.map(y => (y === year ? color : 'transparent')),
                borderWidth: 1,
                type: 'bar',
            };
        }),
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '금액 (백만원)'
                },
                ticks: {
                    callback: function(value) {
                        return value !== null ? value.toLocaleString('ko-KR') : '';
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: '연도'
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: `${corpName} - 계정별 추이`,
                fontSize: 20
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: false,
                    generateLabels: (chart) => {
                        const data = chart.data;
                        return data.datasets.flatMap((dataset, i) => {
                            return dataset.data.map((value, index) => {
                                if (value !== null) {
                                    return {
                                        text: `${dataset.label}`,
                                        fillStyle: dataset.backgroundColor[index],
                                        strokeStyle: dataset.borderColor[index],
                                        lineWidth: dataset.borderWidth,
                                        hidden: !chart.isDatasetVisible(i),
                                        index: i,
                                        datasetIndex: i,
                                        dataIndex: index,
                                        pointStyle: 'circle'
                                    };
                                }
                                return null;
                            }).filter(Boolean);
                        });
                    }
                }
            }
        }
    };

    return (
        <div className="container">
            <h2>재무 정보 검색 (for experts)</h2>
            <CorpSearch onSelectCorp={(selectedName) => setCorpName(selectedName)} />
            <input
                placeholder="연도 (예: 2022, 2023, 2024)"
                value={inputYearsInput}
                onChange={handleInputChange(setInputYearsInput)}
            />
            <input placeholder="보고서코드" value={inputReportCode} onChange={handleInputChange(setInputReportCode)} />
            <input placeholder="재무제표구분" value={inputFsDiv} onChange={handleInputChange(setInputFsDiv)} />

            <button className="button" onClick={handleLoadAccountsButtonClick}>계정명 찾기</button>

            {years.map(year => (
                <div key={year} className="selection-group">
                    <label>{year}년 계정과목:</label>
                    <AccountDropdown
                        corpName={corpName}
                        year={year}
                        reportCode={reportCode}
                        fsDiv={fsDiv}
                        onAccountChange={(account) => handleAccountChange(year, account)}
                        loadTrigger={loadAccountsTrigger}
                    />
                </div>
            ))}

            <button className="button" onClick={handleSearchButtonClick} disabled={years.length === 0 || Object.keys(selectedAccounts).length !== years.length || !corpName}>
                검색
            </button>

            {loading && <p className="loading">데이터를 불러오는 중...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {searchResults.length > 0 && (
                <div className="form-output-container">
                    <h3 className="subtitle">{corpName} - 연도별 계정 비교</h3>
                    <button className="button" onClick={() => {
                        const table = document.querySelector('.output-results table');
                        if (table) {
                            const range = document.createRange();
                            range.selectNode(table);
                            window.getSelection().removeAllRanges();
                            window.getSelection().addRange(range);
                            document.execCommand('copy');
                            alert('표가 클립보드에 복사되었습니다!');
                        } else {
                            alert('복사할 표가 없습니다.');
                        }
                    }}>표 복사</button>
                    <div className="output-results">
                        <table>
                            <thead>
                                <tr>
                                    <th>연도</th>
                                    {years.map(year => (
                                        <th key={year}>{year}년 {selectedAccounts[year] || '미선택'}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>금액 (백만원)</td>
                                    {years.map(year => {
                                        const dataPoint = searchResults.find(
                                            item => item.bsns_year === year && item.account_nm === selectedAccounts[year]
                                        );
                                        const amount = dataPoint ? parseInt(dataPoint.thstrm_amount) / 1000000 : null;
                                        const formattedAmount = amount !== null ? amount.toLocaleString('ko-KR') : '-';
                                        return <td key={year}>{formattedAmount}</td>;
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="output-container" style={{ marginTop: '20px', width: '450px', height: '450px' }}>
                        <h3>계정별 추이 그래프</h3>
                        <Line
                            data={chartData}
                            options={chartOptions}
                        />
                        <button className="button" onClick={() => {
                            const chartCanvas = document.querySelector('.output-container canvas');
                            if (chartCanvas) {
                                chartCanvas.toBlob(blob => {
                                    if (blob) {
                                        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                                            .then(() => alert('차트 이미지가 클립보드에 복사되었습니다!'))
                                            .catch(err => console.error('이미지 복사 실패:', err));
                                    } else {
                                        alert('차트 이미지를 생성하는데 실패했습니다.');
                                    }
                                });
                            } else {
                                alert('복사할 차트가 없습니다.');
                            }
                        }}>차트 복사</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;