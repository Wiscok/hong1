from django.db import models

class FinancialData(models.Model):
    corp_code = models.CharField(max_length=10)
    bsns_year = models.CharField(max_length=4)
    reprt_code = models.CharField(max_length=10)
    account_name = models.CharField(max_length=100)
    data = models.JSONField()  # To store the retrieved data as JSON

    def __str__(self):
        return f"{self.corp_code} - {self.bsns_year}"
