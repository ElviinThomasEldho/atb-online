from django.db import close_old_connections, connections
from django.db.models.query import InstanceCheckMeta
from api.models import *
import api
from django.http.response import JsonResponse
from django.shortcuts import render
from django.http import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import *

# Create your views here.

@api_view(['GET'])
def apiOverview(request):
    api_urls = {
        'Product List':'/product-list/',
        'Product Detail View':'/product-detail/<str:pk>',
        'Product Create':'/product-create/',
        'Product Update':'/product-update/<str:pk>',
        'Product Delete':'/product-delete/',
        'Product List':'/product-list/',
        'Product Detail View':'/product-detail/<str:pk>',
        'Product Create':'/product-create/',
        'Product Update':'/product-update/<str:pk>',
        'Product Delete':'/product-delete/',
        }

    return Response(api_urls)

# Products
@api_view(['GET'])
def productList(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def productDetail(request, pk):
    product = Product.objects.get(id=pk)
    serializer = ProductSerializer(product, many=False)

    return Response(serializer.data)
    
@api_view(['POST'])
def productCreate(request):
    print(request.data)
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['POST'])
def productUpdate(request, pk):
    product = Product.objects.get(id=pk)
    serializer = ProductSerializer(instance=product, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['DELETE'])
def productDelete(request, pk):
    product = Product.objects.get(id=pk)
    product.delete()

    return Response("Product was successfully deleted")

# Customers
@api_view(['GET'])
def customerList(request):
    customers = Customer.objects.all()
    serializer = CustomerSerializer(customers, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def customerDetail(request, pk):
    customer = Customer.objects.get(id=pk)
    serializer = CustomerSerializer(customer, many=False)

    return Response(serializer.data)
    
@api_view(['POST'])
def customerCreate(request):
    serializer = CustomerSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['POST'])
def customerUpdate(request, pk):
    customer = Customer.objects.get(id=pk)
    serializer = CustomerSerializer(instance=customer, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['DELETE'])
def customerDelete(request, pk):
    customer = Customer.objects.get(id=pk)
    customer.delete()

    return Response("Customer was successfully deleted")

# Orders
@api_view(['GET'])
def orderList(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def orderDetail(request, pk):
    order = Order.objects.get(id=pk)
    serializer = OrderSerializer(order, many=False)

    return Response(serializer.data)
    
@api_view(['POST'])
def orderCreate(request):
    serializer = OrderSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['POST'])
def orderUpdate(request, pk):
    order = Order.objects.get(id=pk)
    serializer = OrderSerializer(instance=order, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['DELETE'])
def orderDelete(request, pk):
    order = Order.objects.get(id=pk)
    order.delete()

    return Response("Order was successfully deleted")

# Order Items
@api_view(['GET'])
def orderItemList(request):
    orderItems = OrderItem.objects.all()
    serializer = OrderItemSerializer(orderItems, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def orderItemDetail(request, pk):
    orderItems = OrderItem.objects.get(id=pk)
    serializer = OrderItemSerializer(orderItems, many=False)

    return Response(serializer.data)
    
@api_view(['POST'])
def orderItemCreate(request):
    serializer = OrderItemSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['POST'])
def orderItemUpdate(request, pk):
    orderItems = OrderItem.objects.get(id=pk)
    serializer = OrderItemSerializer(instance=orderItems, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['DELETE'])
def orderItemDelete(request, pk):
    orderItems = OrderItem.objects.get(id=pk)
    orderItems.delete()

    return Response("Order Item was successfully deleted")

@api_view(['GET'])
def getCartByUser(request, pk):
    if User.objects.get(id=pk):
        user = User.objects.get(id=pk)
        customer = user.customer
        order, created = Order.objects.get_or_create(customer=customer, paymentStatus=False)
        items = order.orderitem_set.all()
        serializer = OrderItemSerializer(items, many=True)
        
        return Response(serializer.data)

@api_view(['GET'])
def getOrderByUser(request, pk):
    if User.objects.get(id=pk):
        user = User.objects.get(id=pk)
        customer = user.customer
        order, created = Order.objects.get_or_create(customer=customer, paymentStatus=False)
        serializer = OrderSerializer(order, many=False)

    return Response(serializer.data)
    
@api_view(['GET'])
def getOrderTotal(request, pk):
    order = Order.objects.get(id=pk)
    orderItems = order.orderitem_set.all()
    total = 0
    for item in orderItems:
        total += item.quantity * item.product.price

    return Response(total)
    
@api_view(['GET'])
def getCustomerByUser(request, pk):
    if User.objects.get(id=pk):
        user = User.objects.get(id=pk)
        customer = user.customer
        serializer = CustomerSerializer(customer, many=False)

    return Response(serializer.data)

    
@api_view(['GET'])
def getAllOrdersByCustomer(request, pk):
    customer = Customer.objects.get(id=pk)
    orders = customer.order_set.all()
    serializer = OrderSerializer(orders, many=True)
    print(serializer.data)

    return Response(serializer.data)
    
@api_view(['GET'])
def getOrderItemsByOrder(request, pk):
    order = Order.objects.get(id=pk)
    orderItems = order.orderitem_set.all()
    serializer = OrderItemSerializer(orderItems, many=True)
    print(serializer.data)

    return Response(serializer.data)
    
@api_view(['GET'])
def getActiveOrdersByCustomer(request, pk):
    customer = Customer.objects.get(id=pk)
    orders = customer.order_set.filter(paymentStatus=False)
    serializer = OrderSerializer(orders, many=True)
    print(serializer.data)

    return Response(serializer.data)
    
@api_view(['GET'])
def getCompletedOrdersByCustomer(request, pk):
    customer = Customer.objects.get(id=pk)
    orders = customer.order_set.filter(paymentStatus=True)
    serializer = OrderSerializer(orders, many=True)
    print(serializer.data)

    return Response(serializer.data)