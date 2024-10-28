import os
import requests
import json
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import xml.etree.ElementTree as ET
from django.conf import settings
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# JSON 파일 경로
MAPPING_FILE_PATH = os.path.join(settings.BASE_DIR, 'open_dart', 'data','account_mapping.json')

# 맵핑 파일 로드 함수
def load_account_mapping():
    with open(MAPPING_FILE_PATH, 'r', encoding='utf-8') as file:
        return json.load(file)

# 재무 데이터 요청을 위한 폼을 렌더링하는 함수
def financial_data_form(request):
    return render(request, 'financial_data_form.html')

# OpenDART API에서 데이터를 가져오는 함수
@api_view(['GET'])
def get_all_account_data(request):
    # 요청 파라미터 가져오기
    corp_code = request.GET.get('corp_code')
    year_range = request.GET.get('year')
    reprt_code = request.GET.get('reprt_code')
    fs_div = request.GET.get('fs_div')
    subject = request.GET.get('subject')

    # OpenDART API 키 및 URL
    api_key = os.getenv('API_KEY')
    url = 'https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json'

    # 연도 범위 처리
    years = []
    if year_range:
        if '~' in year_range:
            start_year, end_year = map(int, year_range.split('~'))
            years = [str(year) for year in range(start_year, end_year + 1)]
        else:
            years = [y.strip() for y in year_range.split(',') if y.strip()]

    # 맵핑 사전 로드 및 해당 subject의 동의어 목록 가져오기
    account_mapping = load_account_mapping()
    synonyms = account_mapping.get(subject, [subject])  # 동의어가 없을 경우 입력된 subject 자체를 사용

    # 동의어가 있는지 여부를 터미널에 출력
    if subject in account_mapping:
        print(f"'{subject}'에 대한 동의어 목록을 찾았습니다: {synonyms}")
    else:
        print(f"'{subject}'에 대한 동의어가 없어 기본값으로 검색합니다.")

    all_filtered_data = []

    for year in years:
        # API 요청
        response = requests.get(url, params={
            'crtfc_key': api_key,
            'corp_code': corp_code,
            'bsns_year': year,
            'reprt_code': reprt_code,
            'fs_div': fs_div,
        })
        print(f"연도: {year}, 회사 코드: {corp_code}, 응답 상태 코드: {response.status_code}")

        if response.ok:
            data = response.json()
            all_account_data = data.get('list', [])
            corp_name = get_corp_name_from_xml(corp_code)

            # 1. 정확히 일치하는 계정명이 있는 경우 먼저 필터링
            exact_match_data = [
                {
                    'account_nm': item.get('account_nm'),
                    'bsns_year': item.get('bsns_year'),
                    'thstrm_amount': item.get('thstrm_amount'),
                    'corp_name': corp_name
                }
                for item in all_account_data
                if item.get('account_nm') == subject
            ]

            if exact_match_data:
                all_filtered_data.extend(exact_match_data)
                continue  # 다음 연도로 넘어감

            # 2. 동의어 목록에 있는 키워드가 포함된 경우 필터링
            filtered_data = [
                {
                    'account_nm': item.get('account_nm'),
                    'bsns_year': item.get('bsns_year'),
                    'thstrm_amount': item.get('thstrm_amount'),
                    'corp_name': corp_name
                }
                for item in all_account_data
                if any(keyword in item.get('account_nm', '') for keyword in synonyms)
            ]

            all_filtered_data.extend(filtered_data)
        else:
            return Response({"error": f"년도 {year}에 대한 데이터 조회 오류"}, status=response.status_code)

    return Response(all_filtered_data)

def get_corp_name_from_xml(corp_code):
    xml_file = os.path.join(settings.BASE_DIR, 'open_dart', 'data', 'CORPCODE.xml')
    tree = ET.parse(xml_file)
    root = tree.getroot()

    for list_item in root.findall('list'):
        code = list_item.find('corp_code').text
        name = list_item.find('corp_name').text
        if code == corp_code:
            return name

    return None
