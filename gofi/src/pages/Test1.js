// Test1.js
import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import './Compare.css';

const SearchPage = () => {
    const [inputCorpName, setInputCorpName] = useState('');
    const [inputYearsInput, setInputYearsInput] = useState('');
    const [inputReportCode, setInputReportCode] = useState('');
    const [inputFsDiv, setInputFsDiv] = useState('');

    const [corpName, setCorpName] = useState('');
    const [yearsInput, setYearsInput] = useState('');
    const [reportCode, setReportCode] = useState('');
    const [fsDiv, setFsDiv] = useState('');

    const [selectedAccounts, setSelectedAccounts] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableAccounts, setAvailableAccounts] = useState({});

    const years = inputYearsInput.split(/[\s,~,]+/).filter(Boolean);

    const fetchAccountsByYear = async (year) => {
        try {
            const response = await axios.get('http://localhost:8000/open-dart/get-account-names/', {
                params: {
                    corp_name: inputCorpName,
                    bsns_year: year,
                    reprt_code: inputReportCode,
                    fs_div: inputFsDiv
                }
            });
            console.log(`${year}년 계정 목록 API 응답:`, response.data);
            return { [year]: response.data };
        } catch (error) {
            console.error(`${year}년 계정과목 불러오기 실패:`, error);
            return { [year]: [] };
        }
    };

    const handleLoadAccountsButtonClick = async () => {
        console.log('계정명 찾기 버튼 클릭!');
        if (inputCorpName && years.length > 0 && inputReportCode && inputFsDiv) {
            setAvailableAccounts({});
            setCorpName(inputCorpName);
            setYearsInput(inputYearsInput);
            setReportCode(inputReportCode);
            setFsDiv(inputFsDiv);
            console.log('요청 파라미터:', { inputCorpName, years, inputReportCode, inputFsDiv });
            const accountsByYear = await Promise.all(years.map(fetchAccountsByYear));
            const newAvailableAccounts = {};
            accountsByYear.forEach(item => {
                const year = Object.keys(item)[0];
                newAvailableAccounts[year] = Object.values(item)[0];
            });
            setAvailableAccounts(newAvailableAccounts);
            console.log('availableAccounts 상태 업데이트:', newAvailableAccounts);
        } else {
            alert('기업명, 연도, 보고서코드, 재무제표구분을 모두 입력해주세요.');
        }
    };

    const handleSearchButtonClick = async () => {
        console.log('검색 버튼 클릭!');
        if (!corpName || years.length === 0 || Object.keys(selectedAccounts).length !== years.length) {
            alert('기업명, 연도, 계정과목을 모두 선택해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        const allRequests = years.map(year => {
            return axios.get('http://localhost:8000/open-dart/get-all-account-data/', {
                params: {
                    corp_name: corpName,
                    bsns_year: year,
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

    const handleAccountChange = (year, account) => {
        setSelectedAccounts(prev => ({ ...prev, [year]: account }));
        console.log(`연도 ${year}의 선택된 계정:`, account);
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const chartData = {
        labels: years,
        datasets: Object.keys(selectedAccounts).map(year => {
            const accountData = searchResults
                .filter(item => item.bsns_year === year && item.account_nm === selectedAccounts[year])
                .map(item => parseInt(item.thstrm_amount));
            return {
                label: `${selectedAccounts[year]} (${year})`,
                data: accountData.length > 0 ? accountData : [],
                fill: false,
                borderColor: getRandomColor(),
                tension: 0.1
            };
        })
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '금액 (원)'
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
                position: 'bottom'
            }
        }
    };

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    return (
        <div className="container">
            <h2>재무 정보 검색 (for expert)</h2>
            <input
                placeholder="연도 (예: 2022, 2023, 2024)"
                value={inputYearsInput}
                onChange={handleInputChange(setInputYearsInput)}
            />
            <input placeholder="기업명" value={inputCorpName} onChange={handleInputChange(setInputCorpName)} />
            <input placeholder="보고서코드" value={inputReportCode} onChange={handleInputChange(setInputReportCode)} />
            <input placeholder="재무제표구분" value={inputFsDiv} onChange={handleInputChange(setInputFsDiv)} />

            <button className="button" onClick={handleLoadAccountsButtonClick}>계정명 찾기</button>

            {years.map(year => (
                <div key={year} className="selection-group">
                    <label>{year}년 계정과목:</label>
                    <select
                        value={selectedAccounts[year] || ''}
                        onChange={(e) => handleAccountChange(year, e.target.value)}
                        disabled={!availableAccounts[year]}
                    >
                        <option value="">선택하세요!</option>
                        {Array.isArray(availableAccounts[year]) ? (
                            availableAccounts[year]?.map(account => (
                                <option key={account} value={account}>{account}</option>
                            ))
                        ) : (
                            <option value="" disabled>계정명 찾기 버튼을 눌러주세요</option>
                        )}
                    </select>
                </div>
            ))}

            <button className="button" onClick={handleSearchButtonClick} disabled={years.length === 0 || Object.keys(selectedAccounts).length !== years.length}>
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
                                        <th key={year}>{selectedAccounts[year] || '미선택'}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>금액</td>
                                    {years.map(year => {
                                        const dataPoint = searchResults.find(
                                            item => item.bsns_year === year && item.account_nm === selectedAccounts[year]
                                        );
                                        return <td key={year}>{dataPoint ? dataPoint.thstrm_amount : '-'}</td>;
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="output-container" style={{ marginTop: '20px' }}>
                        <h3>계정별 추이 그래프</h3>
                        <Line data={chartData} options={chartOptions} />
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