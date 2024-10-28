from django.test import TestCase, Client
from unittest.mock import patch
from django.urls import reverse

class GetAllAccountDataTest(TestCase):
    def setUp(self):
        # 테스트 클라이언트 초기화
        self.client = Client()
        self.url = reverse('get_all_account_data')  # URL 패턴 이름

    @patch('open_dart.views.requests.get')  # requests.get을 모의로 설정
    def test_get_all_account_data_with_filter(self, mock_get):
        # 모의 응답 데이터 설정
        mock_data = {
            "list": [
                {"account_nm": "매출액", "thstrm_amount": "170,374,090,000,000", "bsns_year": "2023", "corp_code": "00126380"},
                {"account_nm": "영업이익", "thstrm_amount": "-11,526,297,000,000", "bsns_year": "2023", "corp_code": "00126380"},
            ]
        }
        mock_get.return_value.json.return_value = mock_data

        # 요청 파라미터 설정
        params = {
            'corp_code': '00126380',
            'bsns_year': '2023',
            'reprt_code': '11011',
            'fs_div': 'OFS',
            'subject': '매출액'  # 필터링할 계정과목
        }

        # GET 요청 보내기
        response = self.client.get(self.url, params)
        
        # 응답 데이터 확인
        self.assertEqual(response.status_code, 200)
        
        # JSON 응답 내용 확인
        data = response.json()
        
        # 필터링된 데이터가 반환되는지 검증
        self.assertEqual(len(data), 1)  # '매출액' 계정과목만 반환되어야 함
        self.assertEqual(data[0]["account_nm"], "매출액")
        self.assertEqual(data[0]["thstrm_amount"], "12341235")
