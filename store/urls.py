from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('',views.home, name='home'),
    path('store/',views.store, name='store'),
    path('store/product/<str:pk>/',views.product, name='product'),
    
    path('cart/',views.cart, name='cart'),
    path('checkout/',views.checkout, name='checkout'),
    path('payment/<str:pk>/',views.payment, name='payment'),
    path('payment-status/',views.paymentStatus, name='paymentStatus'),
    path('print-receipt/',views.printReceipt, name='printReceipt'),
    
    path('register/',views.registerPage, name='register'),
    path('login/',views.loginPage, name='login'),
    path('logout/',views.logoutPage, name='logout'),
    path('profile/',views.profilePage, name='profile'),

    path('reset-password/',
     auth_views.PasswordResetView.as_view(template_name="store/password_reset.html"),
     name="reset_password"),
    path('reset-password-sent/', 
        auth_views.PasswordResetDoneView.as_view(template_name="store/password_reset_sent.html"), 
        name="password_reset_done"),
    path('reset/<uidb64>/<token>/',
     auth_views.PasswordResetConfirmView.as_view(template_name="store/password_reset_form.html"), 
     name="password_reset_confirm"),
    path('reset-password-complete/', 
        auth_views.PasswordResetCompleteView.as_view(template_name="store/password_reset_done.html"), 
        name="password_reset_complete"),
    
    path('admin-panel/',views.admin, name='admin'),
    path('admin-panel/add-product/',views.addProduct, name='addProduct'),
    path('admin-panel/edit-product/<int:pk>/',views.editProduct, name='editProduct'),
    path('admin-panel/delete-product/<int:pk>/',views.deleteProduct, name='deleteProduct'),
    path('admin-panel/add-stock/<str:pk>/<int:stock>/',views.addStock, name='addStock'),
    path('admin-panel/deduct-stock/<str:pk>/<int:stock>/',views.deductStock, name='deductStock'),
    
    path('admin-panel/view-customer/<int:pk>/',views.viewCustomer, name='viewCustomer'),
    path('admin-panel/delete-customer/<int:pk>/',views.deleteCustomer, name='deleteCustomer'),
    
    path('admin-panel/view-order/<int:pk>/',views.viewOrder, name='viewOrder'),
    path('admin-panel/update-payment-status/<int:pk>/',views.updatePaymentStatus, name='updatePaymentStatus'),
    path('admin-panel/update-delivery-status/<int:pk>/',views.updateDeliveryStatus, name='updateDeliveryStatus'),
    path('admin-panel/delete-order/<int:pk>/',views.deleteOrder, name='deleteOrder'),
]
