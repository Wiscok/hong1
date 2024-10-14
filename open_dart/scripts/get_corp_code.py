import requests
import zipfile
import io

# OpenDART API의 corpCode XML 파일 URL
url = 'https://opendart.fss.or.kr/api/corpCode.xml'

# 요청 파라미터 설정 (필요한 경우)
params = {
    'crtfc_key':'403d95f352644da46fb0ef81577d235aca401eeb'  # 자신의 API 키를 입력하세요.
}

# API 요청
response = requests.get(url, params=params)

# 요청 성공 여부 확인
if response.status_code == 200:
    # Zip 파일을 메모리에 저장
    zip_file = zipfile.ZipFile(io.BytesIO(response.content))
    
    # Zip 파일 안의 파일 목록 출력
    print("Zip 파일 안의 파일 목록:")
    for name in zip_file.namelist():
        print(name)
        
    # 예시로 Zip 파일을 'corpCode.zip'라는 이름으로 저장
    with open('corpCode.zip', 'wb') as f:
        f.write(response.content)

    print("Zip 파일이 'corpCode.zip'로 저장되었습니다.")
else:
    print(f"API 요청 실패: {response.status_code}")
