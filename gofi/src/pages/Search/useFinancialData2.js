import { useState } from 'react';

export const useFinancialData = () => {
  // 상태 관리
  const [corpName, setCorpName] = useState(''); // 회사 이름
  const [yearRange, setYearRange] = useState(''); // 사업 연도
  const [subject, setSubject] = useState(''); // 계정 과목
  const [report, setReport] = useState(''); // 보고서 유형
  const [fsDiv, setFsDiv] = useState(''); // 재무제표 종류
  const [allAccountData, setAllAccountData] = useState([]); // 계정 데이터 저장
  const [error, setError] = useState(null); // 에러 상태
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [dataFetched, setDataFetched] = useState(false); // 데이터가 fetch되었는지 여부
  const [corpSuggestions, setCorpSuggestions] = useState([]); // 회사 이름 자동 완성 제안 리스트
  const [chartType, setChartType] = useState(''); // 차트 유형
  const [chartReady, setChartReady] = useState(false); // 차트 준비 상태
  const [submittedSubject, setSubmittedSubject] = useState(''); // 제출된 계정 과목
  

  // 데이터 Fetching 함수
  const fetchAllAccountData = async (apiEndpoint, subjectOverride = null) => {
    const usedSubject = subjectOverride || subject; // submittedSubject 대신 현재 subject 사용

    setLoading(true);
    setError(null);
    setDataFetched(false);

    const years = [];
    if (yearRange.includes('~')) {
      const [startYear, endYear] = yearRange.split('~').map(y => y.trim());
      for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
        years.push(year.toString());
      }
    } else {
      years.push(...yearRange.split(',').map(y => y.trim()).filter(Boolean));
    }

    try {
      const query = `corp_name=${corpName}&year=${years.join(',')}&reprt_code=${report}&subject=${usedSubject}&fs_div=${fsDiv}`;
      const response = await fetch(`${apiEndpoint}?${query}`);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched data: ", data);

        if (data.length > 0) {
          // 기존 데이터를 누적시키면서 submittedSubject도 함께 저장
          setAllAccountData(prev => [...prev, {
            corp_name: data[0].corp_name,
            data: data,
            subject: usedSubject // 현재 subject 저장
          }]);
          setChartReady(true);
        } else {
          alert("해당 기업에 대한 데이터가 없습니다.");
        }

      } else {
        throw new Error('데이터 조회 오류');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setDataFetched(true);
    }
  };


  const fetchCorpSuggestions = async (inputValue) => {
    const corpData = await fetchCorpCodeData();
    
    // 자동완성 필터링: 입력값과 일치하는 기업명 필터링
    const suggestions = corpData.filter(item =>
      item.corp_name.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    // 오름차순으로 정렬
    const sortedSuggestions = suggestions.sort((a, b) => {
      if (a.corp_name > b.corp_name) return 1;  // 오름차순
      if (a.corp_name < b.corp_name) return -1; // 오름차순
      return 0;
    });
  
    console.log("Filtered and Sorted Suggestions:", sortedSuggestions); // 필터링 및 정렬된 결과 출력
    setCorpSuggestions(sortedSuggestions); // 정렬된 자동완성 목록 업데이트
  };
  
  // CORPCODE.XML 파일을 가져오는 함수
  const fetchCorpCodeData = async () => {
    try {
      const response = await fetch('/CORPCODE/CORPCODE.xml');  // public 폴더 내의 XML 파일
      
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
      }
  
      const xmlText = await response.text();  // XML 텍스트로 변환
      console.log("XML Data:", xmlText);  // XML 데이터를 콘솔에 출력하여 제대로 받아오는지 확인
  
      const json = xmlToJson(xmlText);  // XML을 JSON으로 변환
      console.log("Converted JSON:", json);  // JSON 변환 후 출력하여 확인
  
      return json;  // 변환된 JSON 데이터를 반환
    } catch (error) {
      console.error("Error fetching corp code data:", error);
      return [];  // 오류 발생 시 빈 배열 반환
    }
  };
  

  // XML을 JSON으로 변환하는 함수
  const xmlToJson = (xml) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'application/xml');
    
    // <list> 태그 안의 데이터를 찾음
    const items = xmlDoc.getElementsByTagName('list'); // 여러 개의 corp가 있을 수 있음
    console.log("XMLDoc:", xmlDoc); // XML 문서 객체 확인
  
    const result = [];
    
    // 각 <list> 요소에서 corp_code와 corp_name을 추출
    for (let i = 0; i < items.length; i++) {
      result.push({
        corp_code: items[i].getElementsByTagName('corp_code')[0]?.textContent, // corp_code 추출
        corp_name: items[i].getElementsByTagName('corp_name')[0]?.textContent, // corp_name 추출
      });
    }
  
    console.log("Result:", result); // 변환된 JSON 확인
    return result; // 변환된 결과 반환
  };

  return {
    corpName,
    setCorpName,
    yearRange,
    setYearRange,
    subject,
    setSubject,
    report,
    setReport,
    fsDiv,
    setFsDiv,
    allAccountData,
    setAllAccountData,
    error,
    setError,
    loading,
    setLoading,
    dataFetched,
    setDataFetched,
    chartType,
    setChartType,
    chartReady,
    setChartReady,
    submittedSubject,
    setSubmittedSubject,
    fetchAllAccountData,
    fetchCorpCodeData,
    corpSuggestions,
    setCorpSuggestions,
    fetchCorpSuggestions, // 반환
  };
};


