from .models import *
from django import forms
from django.forms import ModelForm

class ProductForm(ModelForm):
    class Meta:
        model = Product         
        fields = ['image', 'name', 'desc', 'category','quantity','price','stock']
        