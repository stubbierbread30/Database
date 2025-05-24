from django import forms
from .models import GrowthLog

class GrowthLogForm(forms.ModelForm):
    class Meta:
        model = GrowthLog
        fields = ['log_date', 'batch', 'weight', 'isHealthGood', 'feed', 'medicine']