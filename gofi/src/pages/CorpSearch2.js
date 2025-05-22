// CorpSearch.js
import React, { useState, useEffect, useRef } from 'react';
import './CorpSearch2.css';

function CorpSearch({ onSelectCorp }) {
    const [corpList, setCorpList] = useState([]);
    const [filteredCorps, setFilteredCorps] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const fetchCorpData = async () => {
            try {
                const response = await fetch('/CORPCODE/CORPCODE.XML');
                if (response.ok) {
                    const text = await response.text();
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(text, 'text/xml');
                    const corpNodes = xml.getElementsByTagName('list');
                    const corpData = Array.from(corpNodes).map((node) => ({
                        name: node.getElementsByTagName('corp_name')[0].textContent,
                        code: node.getElementsByTagName('corp_code')[0].textContent,
                    }));
                    setCorpList(corpData);
                } else {
                    throw new Error('CORPCODE.XML 파일을 불러오는 데 실패했습니다.');
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchCorpData();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCorps([]);
            setIsDropdownVisible(false);
        } else {
            const filtered = corpList.filter((corp) =>
                corp.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCorps(filtered);
            setIsDropdownVisible(filtered.length > 0);
        }
    }, [searchTerm, corpList]);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCorpSelect = (selectedName) => {
        setSearchTerm(selectedName);
        onSelectCorp(selectedName);
        setIsDropdownVisible(false);
    };

    const handleBlur = () => {
        // 포커스를 잃으면 드롭다운을 닫습니다 (클릭 처리 전에 닫히는 것을 방지하기 위해 약간의 지연을 줄 수 있습니다.)
        setTimeout(() => {
            setIsDropdownVisible(false);
        }, 100);
    };

    const handleFocus = () => {
        setIsDropdownVisible(filteredCorps.length > 0 && searchTerm.trim() !== '');
    };

    return (
        <div className="corp-search-container">
            <input
                type="text"
                placeholder="회사명을 입력하세요"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="corp-search-input"
                autoComplete="off"
                ref={searchInputRef}
            />
            {error && <p className="error-text">{error}</p>}
            {isDropdownVisible && (
                <ul className="corp-search-dropdown">
                    {filteredCorps.map((corp) => (
                        <li
                            key={corp.code}
                            onClick={() => handleCorpSelect(corp.name)}
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