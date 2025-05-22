import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
// Chart.js의 필요한 요소들을 등록
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export const ChartComponent = () => {
    // 선형회귀 함수
    const calculateLinearRegression = (data) => {
        const n = data.length;
        const sumX = data.reduce((acc, item) => acc + item.x, 0); 
        const sumY = data.reduce((acc, item) => acc + item.y, 0);  
        const sumXY = data.reduce((acc, item) => acc + item.x * item.y, 0);  
        const sumX2 = data.reduce((acc, item) => acc + item.x * item.x, 0);  
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const regressionLine = data.map(item => ({
            x: item.x,
            y: (slope * item.x + intercept) / 100000000,  // 원 단위로 변환
        }));
        return regressionLine;
    };

    // 전체 테이블 복사 함수
    const copyTableToClipboard = () => {
        const table = document.querySelector('table');
        const range = document.createRange();
        range.selectNode(table);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        alert('표가 클립보드에 복사되었습니다!');
    };

    // 차트 이미지를 복사하는 함수
    const copyChartToClipboard = (chartRef) => {
        // chartRef가 정상적으로 참조되고 있는지 확인
        if (chartRef?.current) {
            // 차트 이미지를 base64로 변환
            const imageUrl = chartRef.current.toBase64Image();
    
            // Image 객체로 변환하여 클립보드에 복사할 수 있도록 준비
            const img = new Image();    
            img.src = imageUrl;
    
            img.onload = () => {
                // Canvas 생성
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
    
                // 이미지 크기에 맞게 캔버스 크기 설정
                canvas.width = img.width;
                canvas.height = img.height;
    
                // 캔버스에 이미지를 그리기
                ctx.drawImage(img, 0, 0);
    
                // 이미지를 Blob으로 변환하고 클립보드에 복사
                canvas.toBlob(blob => {
                    if (blob) {
                        // 클립보드에 이미지 복사
                        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                            .then(() => {
                                alert('차트 이미지가 클립보드에 복사되었습니다!');
                            })
                            .catch((err) => {
                                console.error('이미지 복사 실패', err);
                                alert('이미지 복사에 실패했습니다.');
                            });
                    } else {
                        alert('이미지를 Blob으로 변환하는 데 실패했습니다.');
                    }
                }, 'image/png');
            };
            
            // 이미지 로드 실패 시 처리
            img.onerror = () => {
                alert('이미지 로드에 실패했습니다.');
            };
        } else {
            alert('차트를 찾을 수 없습니다.');
        }
    };

    return {
        calculateLinearRegression,
        copyTableToClipboard,
        copyChartToClipboard
    };
};
export default ChartComponent; 