// AccountDropdown.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AccountDropdown = ({ corpName, year, reportCode, fsDiv, onAccountChange }) => {
  // 계정과목 리스트를 저장할 상태
  const [accountList, setAccountList] = useState([]);
  // 선택된 계정과목을 저장할 상태
  const [selectedAccount, setSelectedAccount] = useState('');
  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // props(기업명, 연도, 보고서코드, 재무제표구분)가 변경될 때마다 백엔드에서 계정과목 데이터를 가져옵니다.
  useEffect(() => {
    if (corpName && year && reportCode && fsDiv) {
      setLoading(true);
      axios.get('http://localhost:8000/open-dart/get-account-names/', {
        params: {
          corp_name: corpName,
          bsns_year: year,
          reprt_code: reportCode,
          fs_div: fsDiv
        }
      })
      .then(response => {
        console.log("✅ 받은 계정과목 데이터:", response.data);
        // 백엔드 응답의 account_names 배열을 상태에 저장
        setAccountList(response.data.account_names || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ 계정과목 데이터 불러오기 실패:", err);
        setError('계정과목 데이터를 불러오지 못했습니다.');
        setLoading(false);
      });
    }
  }, [corpName, year, reportCode, fsDiv]);

  // 드롭다운 선택 변경 핸들러
  const handleChange = (e) => {
    const selected = e.target.value;
    setSelectedAccount(selected);
    onAccountChange(selected); // 부모 컴포넌트로 선택값 전달
  };

  return (
    <div>
      <label htmlFor="account-select">계정과목 선택:</label>
      {loading ? (
        <p>불러오는 중...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <select id="account-select" value={selectedAccount} onChange={handleChange}>
          <option value="">-- 선택하세요 --</option>
          {accountList.map((name, idx) => (
            <option key={idx} value={name}>
              {name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default AccountDropdown;
