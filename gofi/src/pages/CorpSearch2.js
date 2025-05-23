// CorpSearch.js
import React, { useState, useEffect, useRef } from 'react';
import './CorpSearch2.css';

function CorpSearch({ onSelectCorp }) {
    const [corpList, setCorpList] = useState([]);
    const [filteredCorps, setFilteredCorps] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    // input과 드롭다운 전체를 감싸는 ref (외부 클릭 감지용)
    const wrapperRef = useRef(null);
    // input 필드 자체를 참조 (필요 시 포커스 제어용)
    const inputRef = useRef(null);

    // XML 데이터 불러오기 및 파싱
    useEffect(() => {
        console.log('[CorpSearch] 컴포넌트 마운트: XML 데이터 로딩 시작');
        const fetchCorpData = async () => {
            try {
                // 이 경로를 실제 파일 위치에 맞게 다시 확인하고 수정하세요!
                const response = await fetch('/CORPCODE/CORPCODE.XML');

                if (response.ok) {
                    const text = await response.text();
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(text, 'text/xml');

                    const errorNode = xml.querySelector('parsererror');
                    if (errorNode) {
                        console.error('❌ XML 파싱 오류:', errorNode.textContent);
                        throw new Error('XML 파일 파싱 중 오류가 발생했습니다.');
                    }

                    const corpNodes = xml.getElementsByTagName('list');
                    if (corpNodes.length === 0) {
                        console.warn('⚠️ XML 파일에서 <list> 태그를 찾을 수 없습니다. 파일 구조를 확인해주세요.');
                    }

                    const corpData = Array.from(corpNodes).map((node) => ({
                        name:
node.getElementsByTagName('corp_name')[0]?.textContent || '',
                        code:
node.getElementsByTagName('corp_code')[0]?.textContent || '',
                    }));
                    setCorpList(corpData);
                    console.log('✅ CORPCODE.XML 파싱 완료. 총 기업 수:',
corpData.length);
                } else {
                    throw new Error(`CORPCODE.XML 파일을 불러오는 데 실패했습니다:
${response.status} ${response.statusText}`);
                }
            } catch (err) {
                console.error('❌ XML 데이터 로딩/파싱 중 치명적인 에러:', err.message);
                setError(err.message);
            }
        };

        fetchCorpData();
    }, []);

    // 검색어에 따른 필터링 및 드롭다운 가시성 제어
    useEffect(() => {
        console.log(`[CorpSearch] useEffect (searchTerm): "${searchTerm}"`);
        if (searchTerm.trim() === '') {
            setFilteredCorps([]);
            setIsDropdownVisible(false);
            console.log('[CorpSearch] 검색어 없음: 드롭다운 숨김');
        } else {
            const filtered = corpList.filter((corp) =>
                corp.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 10);

            setFilteredCorps(filtered);
            // 필터링 결과가 있고, 드롭다운이 이미 보이고 있거나 새로 보여져야 할 때
            setIsDropdownVisible(filtered.length > 0 && (document.activeElement === inputRef.current || isDropdownVisible));
            console.log(`[CorpSearch] 필터링된 기업 수: ${filtered.length}.드롭다운 표시 여부: ${isDropdownVisible}`);
            }
    }, [searchTerm, corpList]);

    // 외부 클릭 감지 (드롭다운 닫기)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 클릭된 대상이 wrapperRef(input과 드롭다운을 감싸는 div) 내부에 없으면 드롭다운 닫기
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
                console.log('[CorpSearch] 드롭다운 외부 클릭 감지: 드롭다운 닫기');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e) => {
        console.log('[CorpSearch] Input change (raw value):', e.target.value);
        setSearchTerm(e.target.value);
        // 입력이 시작되면 드롭다운을 표시
        setIsDropdownVisible(true);
    };

    // **선택 즉시 드롭다운 닫기 로직 강화**
    const handleCorpSelectMouseDown = (selectedName) => {
        console.log(`[CorpSearch] ✅ 제안 선택됨 (onMouseDown): "${selectedName}"`);
        setSearchTerm(selectedName);
        onSelectCorp(selectedName);
        setIsDropdownVisible(false); // **여기가 중요! 선택 즉시 드롭다운 닫기**

        // input에 다시 포커스를 주어 사용자가 다음 작업을 쉽게 할 수 있도록
        if (inputRef.current) {
            inputRef.current.focus();
            console.log('[CorpSearch] Input에 다시 포커스 설정됨.');
        }
    };

    const handleBlur = () => {
        console.log('[CorpSearch] Input lost focus (onBlur triggered).');
        // onMouseDown이 먼저 실행되므로, onBlur는 드롭다운 닫기 역할을 직접 하지 않습니다.
        // 외부 클릭 감지 (handleClickOutside)가 이 역할을 대신 수행합니다.
        setTimeout(() => {
            // 이 setTimeout이 실행될 때쯤에는 이미 isDropdownVisible이 false일 가능성이 높음.
            // 혹시 모를 경우를 대비하여 닫는 로직을 남겨두지만, 주 역할은 아님.
            // if(!wrapperRef.current.contains(document.activeElement)) { // 다른 곳으로포커스가 이동했는지 확인
            //     setIsDropdownVisible(false);
            //     console.log('[CorpSearch] onBlur setTimeoutexecuted. Hiding dropdown (fallback).');
            // }
            console.log('[CorpSearch] onBlur setTimeout finished.');
        }, 100);
    };

    const handleFocus = () => {
        console.log('[CorpSearch] Input received focus (onFocus triggered).');
        // 검색어가 있고 필터링된 결과가 있을 때만 드롭다운 표시
        if (searchTerm.trim() !== '' && filteredCorps.length > 0) {
            setIsDropdownVisible(true);
            console.log('[CorpSearch] onFocus: Showing dropdown.');
        } else if (searchTerm.trim() === '' && filteredCorps.length === 0) {
            // input이 비어있고, 포커스 시 제안 목록이 없으면 드롭다운 표시 안 함
            setIsDropdownVisible(false);
            console.log('[CorpSearch] onFocus: Not showing dropdown(empty search term).');
        } else {
            // 그 외의 경우 (예: 검색어는 있는데 필터링된 결과가 0일 때)
            setIsDropdownVisible(false);
            console.log('[CorpSearch] onFocus: Not showing dropdown(no filtered results).');
        }
    };

    // 디버그용 useEffect: searchTerm이 바뀔 때마다 input의 실제 값을 확인
    useEffect(() => {
        if (inputRef.current) {
            console.log(`[CorpSearch DEBUG] current searchTerm state:
"${searchTerm}", input's actual value: "${inputRef.current.value}"`);
        }
    }, [searchTerm]);

    return (
        // input과 드롭다운 전체를 감싸는 컨테이너에 ref 연결
        <div className="corp-search-container" ref={wrapperRef}>
            <input
                type="text"
                placeholder={
                    error ? "에러: 파일 로딩 실패" :
                    (corpList.length === 0 ? "기업 데이터 로딩 중..." : "회사명을 입력하세요")
                }
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="corp-search-input"
                autoComplete="off"
                ref={inputRef} // input에 ref 연결
                disabled={corpList.length === 0 && !error}
            />
            {error && <p className="error-text">{error}</p>}
            {/* 드롭다운 표시 조건: isDropdownVisible이 true이고, 필터링된 기업 목록이 있을 때 */}
            {isDropdownVisible && filteredCorps.length > 0 && (
                <ul className="corp-search-dropdown">
                    {filteredCorps.map((corp) => (
                        <li
                            key={corp.code}
                            // onMouseDown 사용: 포커스 이동 전에 이벤트 처리
                            onMouseDown={() =>
handleCorpSelectMouseDown(corp.name)}
                            className="corp-result-item"
                        >
                            {corp.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CorpSearch;
