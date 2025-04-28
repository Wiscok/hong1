# models.py
from django.db import models
from django.contrib.auth.models import User
import uuid #uuid 사용용

class SearchHistory(models.Model):

    # UUID를 primary key로 사용
    search_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 유저 정보
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    corp_name = models.CharField(max_length=100)
    account_name = models.CharField(max_length=100)
    year_range = models.CharField(max_length=20)  # ex) "2021~2023" or "2022"
    reprt_code = models.CharField(max_length=10)
    fs_div = models.CharField(max_length=10)
    searched_at = models.DateTimeField(auto_now_add=True)  # 검색 시각

    def __str__(self):
         # 유저의 내부 ID와 검색 기록 ID 출력
        return f"UserID: {self.user.id} | SearchID: {self.search_id}"
