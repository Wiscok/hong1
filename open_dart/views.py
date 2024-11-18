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

# OpenDART API 응답을 JSON 파일로 저장하는 함수
def save_json_response_to_file(data, corp_code, year):
    """Save JSON data to a file with a structured filename."""
    # 파일 저장 경로 설정
    save_dir = os.path.join(settings.BASE_DIR, 'open_dart', 'data', 'responses')
    os.makedirs(save_dir, exist_ok=True)  # 디렉토리 생성

    # 파일 이름 설정 (회사 코드와 연도 포함)
    file_name = f"{corp_code}_{year}_response.json"
    file_path = os.path.join(save_dir, file_name)

    # JSON 데이터 저장
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

    print(f"응답 JSON 파일이 저장되었습니다: {file_path}")

# OpenDART API에서 데이터를 가져오는 함수
@api_view(['GET'])
def get_all_account_data(request):
    # 요청 파라미터 가져오기
    # corp_code = request.GET.get('corp_code')
    corp_name = request.GET.get('corp_name')
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

    # # 맵핑 사전 로드 및 해당 subject의 동의어 목록 가져오기
    # account_mapping = load_account_mapping()
    # synonyms = account_mapping.get(subject, [subject])  # 동의어가 없을 경우 입력된 subject 자체를 사용

    # # 동의어가 있는지 여부를 터미널에 출력
    # if subject in account_mapping:
    #     print(f"'{subject}'에 대한 동의어 목록을 찾았습니다: {synonyms}")
    # else:
    #     print(f"'{subject}'에 대한 동의어가 없어 기본값으로 검색합니다.")

    all_filtered_data = []
    
    # corp_name = get_corp_name_from_xml(corp_code)
    corp_code = get_corp_code_from_xml(corp_name) #기업명을 입력받아 기업코드 검색
    if not corp_code:
        return Response({"error": "유효하지 않은 기업명."}, status=400)
    
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
            # print(data)
            save_json_response_to_file(data, corp_name, year) #dart 응답 json 파일로 저장하는 함수
            
            all_account_data = data.get('list', [])
            
            # sample_data = all_account_data[:5] #샘플로 응답 item중 앞의 5개만 출력
            # print(sample_data)
            
            filtered_data = [
                {
                    'account_nm': item.get('account_nm'),
                    'bsns_year': item.get('bsns_year'),
                    'thstrm_amount': item.get('thstrm_amount'),
                    'corp_name': corp_name
                }
                for item in all_account_data
                if item.get('account_nm') == subject
            ]
            
            all_filtered_data.extend(filtered_data)
            print(all_filtered_data)
        else:
            return Response({"error": f"년도 {year}에 대한 데이터 조회 오류"}, status=response.status_code)

    print("===== Filtered Data Passed to React =====")
    for item in all_filtered_data:
        print(f"Year: {item['bsns_year']}, Account: {item['account_nm']}, "
              f"Amount: {item['thstrm_amount']}, Corporation: {item['corp_name']}")
    print("========================================")
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
def get_corp_code_from_xml(corp_name):
    xml_file = os.path.join(settings.BASE_DIR, 'open_dart', 'data', 'CORPCODE.xml')
    tree = ET.parse(xml_file)
    root = tree.getroot()

   # 회사 이름과 일치하는 항목을 필터링하여 리스트로 저장
    matching_items = [
        {
            "corp_code": item.find('corp_code').text,   # 회사 코드 추출
            "modify_date": item.find('modify_date').text # 수정 날짜 추출
        }
        for item in root.findall('list')
        if item.find('corp_name').text == corp_name    # 회사 이름이 일치하는 경우만 선택
    ]

    # 일치하는 항목이 없는 경우 None 반환
    if not matching_items:
        return None  # 회사 이름과 일치하는 항목이 없는 경우
    
    # 'modify_date' 기준으로 내림차순 정렬하여 최신 항목이 맨 앞에 오도록 설정
    matching_items.sort(key=lambda x: x['modify_date'], reverse=True)
    most_recent_corp_code = matching_items[0]['corp_code']  # 최신 항목의 corp_code 선택
    print("반환된 기업코드: ", most_recent_corp_code)
    return most_recent_corp_code  # 최신 회사 코드를 반환