import os
import requests
from django.shortcuts import render
from .models import  FinancialData
from .forms import FinancialForm
from rest_framework.decorators import api_view
from rest_framework.response import Response
import xml.etree.ElementTree as ET  # Ensure this line is added to import ElementTree
from django.conf import settings  # Import settings to access BASE_DIR


# 재무 데이터 요청을 위한 폼을 렌더링하는 함수
def financial_data_form(request):
    return render(request, 'financial_data_form.html')  # 해당 HTML 템플릿을 렌더링


# OpenDART API에서 데이터를 가져오는 함수
@api_view(['GET'])
def get_financial_data(request):
    # 사용자로부터 입력 받은 파라미터들
    corp_code = request.GET.get('corp_code')
    bsns_year = request.GET.get('bsns_year')
    reprt_code = request.GET.get('reprt_code')
    subject = request.GET.get('subject')
    api_key = '403d95f352644da46fb0ef81577d235aca401eeb' # api key입력
    # OpenDART API 호출
    response = requests.get('https://opendart.fss.or.kr/api/fnlttSinglAcnt.json', params={
        'crtfc_key': api_key, 
        'corp_code': corp_code,
        'bsns_year': bsns_year,
        'reprt_code': reprt_code,
    })
    
    # print("API 응답 데이터:", response.json()) 디버그용
    # API로부터 받은 JSON 응답
    data = response.json()
# 
    # 'list' 키가 있는지 확인하고, 없으면 빈 리스트 반환
    if 'list' in data:
        filtered_data = [item for item in data['list'] if item['account_nm'] == subject]
    else:
        filtered_data = []
        
     # XML 파일에서 corp_code에 맞는 corp_name을 찾기
    corp_name = get_corp_name_from_xml(corp_code)
    
    # corp_name을 결과에 추가
    for item in filtered_data:
        item['corp_name'] = corp_name
        

    return Response(filtered_data)

def get_corp_name_from_xml(corp_code):
    # # XML 파일 절대경로
    # xml_file = 'C:/Users/defaf/dviz_proj/open_dart/data/CORPCODE.xml'
     # Construct the relative path to the XML file using BASE_DIR
    xml_file = os.path.join(settings.BASE_DIR, 'open_dart', 'data', 'CORPCODE.xml')

    # XML 파일 파싱
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    # corp_code에 해당하는 corp_name을 찾기
    for list_item in root.findall('list'):
        code = list_item.find('corp_code').text
        name = list_item.find('corp_name').text
        if code == corp_code:
            return name
    
    # 일치하는 corp_code가 없으면 None 반환
    return None

# 웹 페이지에 사용자 입력을 처리하는 뷰
def financial_view(request):
    if request.method == 'POST':
        form = FinancialForm(request.POST)  # 사용자가 입력한 데이터를 폼에 전달
        if form.is_valid():  # 폼이 유효한지 확인
            corp_code = form.cleaned_data['corp_code']  # 유효한 회사 코드
            year = form.cleaned_data['year']  # 유효한 연도
            account_name = form.cleaned_data['account_name']  # 유효한 계정 이름

            # OpenDART API를 통해 재무 데이터를 가져오는 로직 호출
            financial_data = get_financial_data(corp_code, year, account_name)
            
            # 텍스트로 데이터를 보여주는 템플릿으로 렌더링
            return render(request, 'financial_result.html', {'financial_data': financial_data})

    else:
        form = FinancialForm()  # GET 요청일 경우 빈 폼을 보여줌
    return render(request, 'financial_form.html', {'form': form})  # 폼을 템플릿에 렌더링
