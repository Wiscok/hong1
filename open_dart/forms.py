# forms.py
from django import forms

class FinancialForm(forms.Form):
    corp_code = forms.CharField(max_length=10, label="Corporation Code")
    bsns_year = forms.CharField(max_length=4, label="Business Year")
    reprt_code = forms.CharField(max_length=10, label="Report Code")
    account_name = forms.CharField(max_length=100, label="Account Name")
