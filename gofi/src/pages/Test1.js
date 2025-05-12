// Test1.js
import React, { useState } from 'react';
import AccountDropdown from './Test2.js';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import './Compare.css';

const SearchPage = () => {
    const [corpName, setCorpName] = useState('');
    const [year, setYear] = useState(''); // 여러 연도 입력 가능하도록 변경
    const [reportCode, setReportCode] = useState('');
    const [fsDiv, setFsDiv] = useState('');
    const [account, setAccount] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = () => {
        console.log('전송값:', { corpName, year, reportCode, fsDiv, account });
        if (account) {
            setLoading(true);
            setError('');
            axios.get('http://localhost:8000/open-dart/get-all-account-data/', {
                params: {
                    corp_name: corpName,
                    year: year, // 입력받은 연도 문자열 그대로 전달
                    reprt_code: reportCode,
                    fs_div: fsDiv,
                    subject: account
                }
            })
            .then(response => {
                console.log('✅ 계정 값 데이터:', response.data);
                setSearchResults(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('❌ 계정 값 데이터 불러오기 실패:', error);
                setError('데이터를 불러오는데 실패했습니다.');
                setLoading(false);
            });
        } else {
            alert('계정과목을 먼저 선택해주세요.');
        }
    };

    // Chart.js 데이터 구성 (여러 연도 처리 가능하도록 수정)
    const chartData = {
        labels: searchResults.map(item => item.bsns_year),
        datasets: [
            {
                label: account,
                data: searchResults.map(item => parseInt(item.thstrm_amount)),
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1
            }
        ]
    };

    // Chart.js 옵션 (기존과 동일)
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
                text: `${corpName} - ${account} 추이`,
                fontSize: 20
            },
            legend: {
                display: true,
                position: 'bottom'
            }
        }
    };

    return (
        <div className="container">
            <h2>재무 정보 검색</h2>
            <input placeholder="연도 (예: 2022 또는 2022~2024 또는 2022, 2023, 2024)" value={year} onChange={(e) => setYear(e.target.value)} /> {/* 연도 입력 방식 안내 문구 추가 */}
            <input placeholder="기업명" value={corpName} onChange={(e) => setCorpName(e.target.value)} />
            <input placeholder="보고서코드" value={reportCode} onChange={(e) => setReportCode(e.target.value)} />
            <input placeholder="재무제표구분" value={fsDiv} onChange={(e) => setFsDiv(e.target.value)} />
            <AccountDropdown
                corpName={corpName}
                year={year}
                reportCode={reportCode}
                fsDiv={fsDiv}
                onAccountChange={setAccount}
            />
            <button className="button" onClick={handleSearch}>검색</button>

            {loading && <p className="loading">데이터를 불러오는 중...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {searchResults.length > 0 && (
                <div className="form-output-container">
                    <h3 className="subtitle">{corpName} - {account} 결과</h3>
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
                                    <th>금액</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map(item => (
                                    <tr key={`${item.bsns_year}-${item.reprt_code}`}> {/* 여러 연도/보고서 코드 조합 고려 */}
                                        <td>{item.bsns_year}</td>
                                        <td>{item.thstrm_amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="output-container" style={{ marginTop: '20px' }}>
                        <h3>{account} 추이 그래프</h3>
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