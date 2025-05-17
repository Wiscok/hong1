// AccountDropdown.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AccountDropdown = ({ corpName, year, reportCode, fsDiv, onAccountChange, loadTrigger }) => {
    const [accountList, setAccountList] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (loadTrigger && corpName && year && reportCode && fsDiv) {
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
                console.log(`✅ ${year}년 계정과목 데이터:`, response.data);
                if (response.data && Array.isArray(response.data.account_names)) {
                    setAccountList(response.data.account_names || []);
                } else {
                    setAccountList([]);
                    setError('계정 목록 데이터 형식이 올바르지 않습니다.');
                    console.error('잘못된 계정 목록 데이터:', response.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(`❌ ${year}년 계정과목 불러오기 실패:`, err);
                setError('계정과목 데이터를 불러오지 못했습니다.');
                setLoading(false);
            });
        } else {
            setAccountList([]);
            setSelectedAccount('');
            setError('');
            setLoading(false);
        }
    }, [corpName, year, reportCode, fsDiv, loadTrigger]);

    const handleChange = (e) => {
        const selected = e.target.value;
        setSelectedAccount(selected);
        onAccountChange(selected);
    };

    return (
        <div>
            <label htmlFor={`account-select-${year}`}>계정과목 선택 ({year}년):</label>
            {loading ? (
                <p>불러오는 중...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <select id={`account-select-${year}`} value={selectedAccount} onChange={handleChange}>
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