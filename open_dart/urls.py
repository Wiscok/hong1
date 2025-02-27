from django.urls import path
from . import views

urlpatterns = [
    # URL for the form where users can input financial data request details
    # path('financial-data-form/', views.financial_data_form, name='financial_data_form'),
    path('get-all-account-data/', views.get_all_account_data, name='get_all_account_data'),  # 전체 계정 과목 함수
    path('get-financial-index/', views.get_financial_index, name='get_financial_index'),
    path('get-account-names/', views.get_account_names, name='get_account_names'),  


]
