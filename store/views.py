from django.http import response
from django.http.response import HttpResponse
from api.views import customerCreate
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail

from .forms import RegisterForm
from api.forms import *
from api.models import Customer, Order, OrderItem

from paytm import checksum

from django.views.decorators.csrf import csrf_exempt

MERCHANTKEY = 'kbzk1DSbJiV_O3p5'

# Create your views here.
def home(request):

    context = {

    }
    
    return render(request, 'store/index.html', context)
    
def store(request):

    context = {
    }
    
    return render(request, 'store/store.html', context)

def product(request, pk):

    context = {
        'id':pk,
    }
    
    return render(request, 'store/product.html', context)

def cart(request):

    context = {
    }
    
    return render(request, 'store/cart.html', context)

def checkout(request):

    context = {
    }
    
    return render(request, 'store/checkout.html', context)

def payment(request,pk):
    order = Order.objects.get(id=pk)
    amount = order.get_cart_total
    param_dict={

            'MID': 'WorldP64425807474247',
            'ORDER_ID': str(order.id),
            'TXN_AMOUNT': str(amount),
            'CUST_ID': order.customer.email,
            'INDUSTRY_TYPE_ID': 'Retail',
            'WEBSITE': 'WEBSTAGING',
            'CHANNEL_ID': 'WEB',
            'CALLBACK_URL':'http://127.0.0.1:8000/payment-status/',
    }

    param_dict['CHECKSUMHASH'] = checksum.generate_checksum(param_dict, MERCHANTKEY)
    return  render(request, 'store/paytm.html', {'param_dict': param_dict})

def registerPage(request):
    form = RegisterForm()

    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()

            username = form.cleaned_data['username']
            email = form.cleaned_data['email']
            name = form.cleaned_data['first_name'] + ' ' + form.cleaned_data['last_name']
            password = form.cleaned_data['password1']
            
            Customer.objects.create(user = user,name = name, email = email)

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('home')

    context = {
        'form': form,
    }
    
    return render(request, 'store/register.html', context)

def loginPage(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            print(request, user)
            login(request, user)
            return redirect('home')

        else:
            messages.info(request, 'Username or Password is incorrect')
    
    return render(request, 'store/login.html')
    
def logoutPage(request):
    logout(request)
    
    return redirect('home')

def admin(request):
    addProductForm = ProductForm()

    context = {
        'addProductForm': addProductForm,
    }

    return render(request, 'store/admin.html', context)

def addProduct(request):    
    if request.method == "POST":
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save()

        return redirect('admin')
        
def editProduct(request, pk):    
    product = Product.objects.get(id=pk)

    if request.method == "POST":
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            product = form.save()

        return redirect('admin')

def deleteProduct(request, pk):    
    product = Product.objects.get(id=pk)
    product.delete()

    return redirect('admin')
        
def addStock(request,pk,stock):  
    product = Product.objects.get(id=pk)
    product.stock = product.stock + float(stock)
    product.save()

    return redirect('admin')
        
def deductStock(request,pk,stock):  
    product = Product.objects.get(id=pk)
    product.stock = product.stock - float(stock)
    product.save()

    return redirect('admin')
    
def viewCustomer(request,pk):
    customer = Customer.objects.get(id=pk)

    context = {
        'customer': customer,
    }

    return render(request, 'store/viewCustomer.html', context)
               
def deleteCustomer(request, pk):    
    customer = Customer.objects.get(id=pk)
    customer.delete()

    return redirect('admin')
    
def viewOrder(request,pk):
    order = Order.objects.get(id=pk)
    customer = Customer.objects.get(id=order.customer.id)

    context = {
        'order': order,
        'customer': customer,
    }

    return render(request, 'store/viewOrder.html', context)
    
def deleteOrder(request, pk):    
    order = Order.objects.get(id=pk)
    order.delete()

    return redirect('admin')

def updatePaymentStatus(request, pk):    
    order = Order.objects.get(id=pk)
    if order.paymentStatus:
        order.paymentStatus = False
    else:
        order.paymentStatus = True
    order.save()

    return redirect('admin')
    
def updateDeliveryStatus(request, pk):    
    order = Order.objects.get(id=pk)
    if order.deliveryStatus:
        order.deliveryStatus = False
    else:
        order.deliveryStatus = True
    order.save()

    return redirect('admin')
    
@csrf_exempt
def paymentStatus(request):

    form = request.POST
    response_dict = {}

    for i in form.keys():
        response_dict[i] = form[i]
        if i == 'CHECKSUMHASH':
            check = form[i]

    verify = checksum.verify_checksum(response_dict, MERCHANTKEY, check)
    print(response_dict)
    if verify:
        if response_dict['RESPCODE'] == '01':
            print('Order Successful')
                
            user = request.user
            customer = user.customer

            order = Order.objects.get(customer=customer, paymentStatus=False)
            order.paymentStatus = True
            order.save()

            subject = 'New Order Placed'
            message = 'Hi Annapoorneswari Tasty Buds,\nYou have recieved a new Order from {name} for the following items : \nS.No.  |  Product  |  Quantity | Total'.format(name=customer.name)

            items = order.orderitem_set.all()
            itemText = ''
            itemTotal = 0
            priceTotal = 0
            i = 1
            for item in items:
                product = Product.objects.get(product=item.product)
                itemTotal += item.quantity
                priceTotal += item.quantity * product.price
                itemText += '{index}.  |  {product}  |  {quantity}  |  {total}\n'.format(index=i, product=product.name, quantity=item.quantity, total=product.price*item.quantity)
                i += 1

            itemText += 'Total No. of Items : {total}'.format(total = itemTotal)
            itemText += 'Total Bill Amount : {total}'.format(total = priceTotal)
            message += itemText

            send_mail(subject, message, 'elviin.t.eldho@gmail.com', ['elviin.t.eldho@gmail.com'])
        else: 
            print('Order was Not Successful : ',response_dict['RESPMSG'])


    return render(request, 'store/paytmStatus.html',{'response':response_dict})