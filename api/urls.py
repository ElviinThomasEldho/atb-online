from django.urls import path
from . import views

urlpatterns = [
    path('',views.apiOverview, name='api-overview'),

    path('product-list/',views.productList, name='product-list'),
    path('product-detail/<str:pk>/',views.productDetail, name='product-detail'),
    path('product-create/',views.productCreate, name='product-create'),
    path('product-update/<str:pk>/',views.productUpdate, name='product-update'),
    path('product-delete/<str:pk>/',views.productDelete, name='product-delete'),
    
    path('customer-list/',views.customerList, name='customer-list'),
    path('customer-detail/<str:pk>/',views.customerDetail, name='customer-detail'),
    path('customer-create/',views.customerCreate, name='customer-create'),
    path('customer-update/<str:pk>/',views.customerUpdate, name='customer-update'),
    path('customer-delete/<str:pk>/',views.customerDelete, name='customer-delete'),
    
    path('order-list/',views.orderList, name='order-list'),
    path('order-detail/<str:pk>/',views.orderDetail, name='order-detail'),
    path('order-create/',views.orderCreate, name='order-create'),
    path('order-update/<str:pk>/',views.orderUpdate, name='order-update'),
    path('order-delete/<str:pk>/',views.orderDelete, name='order-delete'),
    
    path('order-item-list/',views.orderItemList, name='order-item-list'),
    path('order-item-detail/<str:pk>/',views.orderItemDetail, name='order-item-detail'),
    path('order-item-create/',views.orderItemCreate, name='order-item-create'),
    path('order-item-update/<str:pk>/',views.orderItemUpdate, name='order-item-update'),
    path('order-item-delete/<str:pk>/',views.orderItemDelete, name='order-item-delete'),
    
    path('get-cart/<str:pk>/',views.getCartByUser, name='get-cart'),
    path('get-order/<str:pk>/',views.getOrderByUser, name='get-order'),
    path('get-order-total/<str:pk>/',views.getOrderTotal, name='get-order-total'),
    
    path('get-customer/<str:pk>/',views.getCustomerByUser, name='get-customer'),

    path('get-all-orders/<str:pk>/',views.getAllOrdersByCustomer, name='get-all-orders'),
    path('get-order-items/<str:pk>/',views.getOrderItemsByOrder, name='get-order-history'),
    path('get-pending-orders/<str:pk>/',views.getActiveOrdersByCustomer, name='get-pending-orders'),
    path('get-completed-orders/<str:pk>/',views.getCompletedOrdersByCustomer, name='get-completed-orders'),
]
