#admin.py
from django.contrib import admin
from .models import SearchHistory

# 관리자 페이지에서 SearchHistory를 보기 좋게 커스터마이징
@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    # 리스트에 보여줄 필드 설정
    list_display = ('user', 'search_id', 'corp_name', 'account_name', 'year_range', 'reprt_code', 'fs_div', 'searched_at')

    # 필터 기능 추가 (유저, 검색 날짜, 재무제표 구분 등으로 필터링 가능)
    list_filter = ('user', 'searched_at', 'corp_name', 'account_name', 'reprt_code', 'fs_div')

    # 검색 기능 추가 (검색어로 유저 아이디, 회사명, 계정명 등을 검색할 수 있게 설정)
    search_fields = ('user__username', 'corp_name', 'account_name', 'year_range', 'reprt_code', 'fs_div')

    # 목록에서 검색된 항목을 클릭했을 때 상세 페이지에서 보여줄 필드 설정  // 대신 fieldesets사용 (중복불가)
    # fields = ('user', 'corp_name', 'account_name', 'year_range', 'reprt_code', 'fs_div', 'searched_at')

    # 필드 순서, 검색한 날짜가 먼저 나오고, 나머지 항목들이 그 뒤에 나오게 설정
    ordering = ('-searched_at',)

    # 모델 내에서 보여줄 필드를 커스터마이징하는 것 외에도
    # 필드 순서나 레이아웃을 지정할 수도 있습니다.
    # 아래는 검색 기록 상세 페이지에서 사용하는 레이아웃 설정 예시
    fieldsets = (
        (None, {
            'fields': ('user', 'search_id', 'corp_name', 'account_name', 'year_range', 'reprt_code', 'fs_div')
        }),
        ('search_time', {
            'fields': ('searched_at',)
        }),
    )

