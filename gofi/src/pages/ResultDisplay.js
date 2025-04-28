// ResultDisplay.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ResultDisplay = ({ corpName, year, reportCode, fsDiv, accountName }) => {
  // 결과 데이터 상태
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 모든 값이 유효할 때만 API 호출
    if (corpName && year && reportCode && fsDiv && accountName) {
      setLoading(true);
      axios.get('http://localhost:8000/open-dart/get-all-account-data/', {
        params: {
          corp_name: corpName,
          bsns_year: year,
          reprt_code: reportCode,
          fs_div: fsDiv,
          account_name: accountName
        }
      })
      .then(res => {
        console.log("✅ 결과 데이터:", res.data);
        setResult(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ 데이터 가져오기 실패:", err);
        setError('데이터를 불러오지 못했습니다.');
        setLoading(false);
      });
    }
  }, [corpName, year, reportCode, fsDiv, accountName]);

  if (!accountName) return null;

  return (
    <div>
      <h3>📊 선택한 계정과목의 값:</h3>
      {loading ? (
        <p>불러오는 중...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : result ? (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      ) : (
        <p>결과가 없습니다.</p>
      )}
    </div>
  );
};

export default ResultDisplay;
