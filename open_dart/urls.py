from django.urls import path
from . import views

urlpatterns = [
    # URL for the form where users can input financial data request details
    path('financial-data-form/', views.financial_data_form, name='financial_data_form'),

    # URL for fetching the financial data based on user input
    path('get-financial-data/', views.get_financial_data, name='get_financial_data'),
]