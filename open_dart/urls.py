from django.urls import path
from . import views

urlpatterns = [
    # URL for the form where users can input financial data request details
    path('financial-data-form/', views.financial_data_form, name='financial_data_form'),
    
    path('get-main-account-data/', views.get_main_account_data, name='get_main_account_data'),  # 주요 계정 과목 함수
    path('get-all-account-data/', views.get_all_account_data, name='get_all_account_data'),  # 전체 계정 과목 함수
]
