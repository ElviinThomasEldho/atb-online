from django.http import HttpResponse
from django.shortcuts import redirect

def authenticated_user(view_func):
    def wrapper_func(request, *args, **kwargs):
        if request.user.is_authenticated:
            return view_func(request, *args, **kwargs)
        else:
            return redirect('login')

    return wrapper_func

def unauthenticated_user(view_func):
    def wrapper_func(request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('home')
        else:
            return view_func(request, *args, **kwargs)

    return wrapper_func

def admin_only(view_func):
    def wrapper_func(request, *args, **kwargs):
        groups = None
        if request.user.groups.exists(): 
            groups = set(group.name for group in request.user.groups.all())
            for group in groups:
                if 'admin' == group:
                    return view_func(request, *args, **kwargs)
        return redirect('home')
    return wrapper_func

