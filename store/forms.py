from .models import *
from django import forms
from django.forms import ModelForm
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class RegisterForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['email','first_name','last_name','password1','password2']

        widgets = {     
            'email' : forms.EmailInput(),
            'first_name' : forms.TextInput(),
            'last_name' : forms.TextInput(),
            'password1' : forms.PasswordInput(),
            'password2' : forms.PasswordInput(),
        }