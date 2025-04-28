//Test1.js
import React, { useState } from 'react';
import AccountDropdown from './Test2.js';

const SearchPage = () => {
  const [corpName, setCorpName] = useState('');
  const [year, setYear] = useState('');
  const [reportCode, setReportCode] = useState('');
  const [fsDiv, setFsDiv] = useState('');
  const [account, setAccount] = useState('');

  const handleSearch = () => {
    console.log('전송값:', { corpName, year, reportCode, fsDiv, account });
    // get-all-account-data API 호출 가능
  };

  return (
    <div>
      <input placeholder="기업명" onChange={(e) => setCorpName(e.target.value)} />
      <input placeholder="연도" onChange={(e) => setYear(e.target.value)} />
      <input placeholder="보고서코드" onChange={(e) => setReportCode(e.target.value)} />
      <input placeholder="재무제표구분" onChange={(e) => setFsDiv(e.target.value)} />
      <AccountDropdown
        corpName={corpName}
        year={year}
        reportCode={reportCode}
        fsDiv={fsDiv}
        onAccountChange={setAccount}
      />
      <button onClick={handleSearch}>검색</button>
    </div>
  );
};

export default SearchPage;
