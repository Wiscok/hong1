import React, { useState, useEffect } from 'react';
import Select from 'react-select';  // React Select 라이브러리 임포트

function AccountSelector() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);

    // 컴포넌트가 처음 렌더링될 때 계정 항목 목록을 API에서 불러옵니다
    useEffect(() => {
        fetch('/api/account_subjects/')  // Django API에서 계정 항목을 불러옵니다
            .then(response => response.json())
            .then(data => setSubjects(data))  // 불러온 데이터를 상태에 저장
            .catch(error => console.error('계정 항목을 불러오는 중 오류 발생:', error));
    }, []);

    // 선택된 항목이 변경될 때마다 상태 업데이트
    const handleSelectChange = (selectedOption) => {
        setSelectedSubject(selectedOption);  // React Select는 전체 객체를 반환하므로 값을 직접 저장
    };

    return (
        <div>
            <label htmlFor="account-subject">계정 항목을 선택하세요:</label>
            <Select
                id="account-subject"
                value={selectedSubject}  // 선택된 값
                onChange={handleSelectChange}  // 값 변경 시 처리 함수
                options={subjects.map(subject => ({ value: subject, label: subject }))}  // React Select의 옵션 형식에 맞게 변환
            />
        </div>
    );
}

export default AccountSelector;
