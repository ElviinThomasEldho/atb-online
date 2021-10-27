from django.http import response
from django.http.response import HttpResponse
from api.views import customerCreate
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from ecommerce.settings import MERCHANT_KEY

from store.decorators import authenticated_user

from .forms import RegisterForm
from api.forms import *
from .decorators import *
from api.models import Customer, Order, OrderItem

from django.contrib.auth.models import User

from paytm import checksum

from django.views.decorators.csrf import csrf_exempt

import os
from django.conf import settings
from django.views.generic import View
from django.template.loader import get_template
from ecommerce.utils import render_to_pdf
from xhtml2pdf import pisa
from django.contrib.staticfiles import finders

MERCHANTKEY = settings.MERCHANT_KEY

# Create your views here.
def link_callback(uri, rel):
    result = finders.find(uri)
    if result:
        if not isinstance(result, (list, tuple)):
            result = [result]
        result = list(os.path.realpath(path) for path in result)
        path = result[0]
    else:
        sUrl = settings.STATIC_URL        # Typically /static/
        sRoot = settings.STATIC_ROOT      # Typically /home/userX/project_static/
        mUrl = settings.MEDIA_URL         # Typically /media/
        mRoot = settings.MEDIA_ROOT       # Typically /home/userX/project_static/media/

        if uri.startswith(mUrl):
            path = os.path.join(mRoot, uri.replace(mUrl, ""))
        elif uri.startswith(sUrl):
            path = os.path.join(sRoot, uri.replace(sUrl, ""))
        else:
            return uri

    # make sure that file exists
    if not os.path.isfile(path):
        raise Exception(
            'media URI must start with %s or %s' % (sUrl, mUrl)
        )
    return path

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

@authenticated_user
def checkout(request):

    context = {
    }
    
    return render(request, 'store/checkout.html', context)

@authenticated_user
def payment(request,pk):
    order = Order.objects.get(id=pk)
    amount = order.get_cart_total
    param_dict={

            'MID': settings.MERCHANT_ID,
            'ORDER_ID': str(order.id),
            'TXN_AMOUNT': str(amount),
            'CUST_ID': order.customer.email,
            'INDUSTRY_TYPE_ID': 'Retail',
            'WEBSITE': 'WEBSTAGING',
            'CHANNEL_ID': 'WEB',
            'CALLBACK_URL':'https://atb-online.herokuapp.com/payment-status/',
            
    }

    param_dict['CHECKSUMHASH'] = checksum.generate_checksum(param_dict, MERCHANTKEY)
    return  render(request, 'store/paytm.html', {'param_dict': param_dict})

@authenticated_user
def profilePage(request):

    customer = request.user.customer

    context = {
        'customer':customer,
    }
    
    return render(request, 'store/profile.html', context)

@unauthenticated_user
def registerPage(request):
    form = RegisterForm()

    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            name = form.cleaned_data['first_name'] + ' ' + form.cleaned_data['last_name']
            password = form.cleaned_data['password1']
            print(User.objects.filter(username=email).exists())
            if (User.objects.filter(username=email).exists()):
                messages.info(request, 'An Account with this Email Address already exists')
            else:
                user = form.save()
                user.username = user.email
                user.save()

                Customer.objects.create(user = user,name = name, email = email)

                user = authenticate(request, username=email, password=password)

                if user is not None:
                    login(request, user)
                    return redirect('home')

    context = {
        'form': form,
    }
    
    return render(request, 'store/register.html', context)

@unauthenticated_user
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
    
@authenticated_user
def logoutPage(request):
    logout(request)
    
    return redirect('home')

@admin_only
def admin(request):
    addProductForm = ProductForm()

    context = {
        'addProductForm': addProductForm,
    }

    return render(request, 'store/admin.html', context)

@admin_only
def addProduct(request):    
    if request.method == "POST":
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save()

        return redirect('admin')
        
@admin_only
def editProduct(request, pk):    
    product = Product.objects.get(id=pk)

    if request.method == "POST":
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            product = form.save()

        return redirect('admin')

@admin_only
def deleteProduct(request, pk):    
    product = Product.objects.get(id=pk)
    product.delete()

    return redirect('admin')
        
@admin_only
def addStock(request,pk,stock):  
    product = Product.objects.get(id=pk)
    product.physicalStock = product.physicalStock + float(stock)
    product.virtualStock = product.virtualStock + float(stock)
    product.save()

    return redirect('admin')
        
@admin_only
def deductStock(request,pk,stock):  
    product = Product.objects.get(id=pk)
    product.physicalStock = product.physicalStock - float(stock)
    product.virtualStock = product.virtualStock - float(stock)
    product.save()

    return redirect('admin')
    
@admin_only
def viewCustomer(request,pk):
    customer = Customer.objects.get(id=pk)

    context = {
        'customer': customer,
    }

    return render(request, 'store/viewCustomer.html', context)
               
@admin_only
def deleteCustomer(request, pk):    
    customer = Customer.objects.get(id=pk)
    customer.delete()

    return redirect('admin')
     
@admin_only    
def viewOrder(request,pk):
    order = Order.objects.get(id=pk)
    customer = Customer.objects.get(id=order.customer.id)

    context = {
        'order': order,
        'customer': customer,
    }

    return render(request, 'store/viewOrder.html', context)
     
@admin_only
def deleteOrder(request, pk):    
    order = Order.objects.get(id=pk)
    order.delete()

    return redirect('admin')
 
@authenticated_user
def updatePaymentStatus(request, pk):    
    order = Order.objects.get(id=pk)
    if order.paymentStatus:
        order.paymentStatus = False
    else:
        order.paymentStatus = True
    order.save()

    return redirect('admin')

@admin_only
def updateDeliveryStatus(request, pk):    
    order = Order.objects.get(id=pk)
    if order.deliveryStatus:
        order.deliveryStatus = False
        
        items = order.orderitem_set.all()
        for item in items:
            item.product.physicalStock += item.quantity
            print(item.product.physicalStock)
            item.product.save()
    else:
        order.deliveryStatus = True
        
        items = order.orderitem_set.all()
        for item in items:
            item.product.physicalStock -= item.quantity
            print(item.product.physicalStock)
            item.product.save()
    order.save()

    return redirect('/admin-panel/view-order/{id}/'.format(id=order.id))
    
@csrf_exempt
@authenticated_user
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
            items = order.orderitem_set.all()
            for item in items:
                item.product.virtualStock -= item.quantity
                print(item.product)
                item.product.save()
            # order.save()

            subject = 'New Order Placed'
            message = 'Hi Annapoorneswari Tasty Buds,\nYou have recieved a new Order from {name} for the following items : \nS.No.  |  Product  |  Quantity | Total'.format(name=customer.name)

            itemText = ''
            itemTotal = 0
            priceTotal = 0
            i = 1
            for item in items:
                product = item.product
                itemTotal += item.quantity
                priceTotal += item.quantity * product.price
                itemText += '{index}.  |  {product}  |  {quantity}  |  {total}\n'.format(index=i, product=product.name, quantity=item.quantity, total=product.price*item.quantity)
                i += 1

            itemText += 'Total No. of Items : {total}'.format(total = itemTotal)
            itemText += 'Total Bill Amount : {total}'.format(total = priceTotal)
            message += itemText

            send_mail(subject, message, 'contact.atbonline@gmail.com', 'annapoorneswaritastybuds@gmail.com')

            
            subject = 'Order Invoice'
            message = 'Hi {name},\nWe have recieved your Order for the following items : \nS.No.  |  Product  |  Quantity | Total'.format(name=customer.name)

            itemText = ''
            itemTotal = 0
            priceTotal = 0
            i = 1
            for item in items:
                product = item.product
                itemTotal += item.quantity
                priceTotal += item.quantity * product.price
                itemText += '{index}.  |  {product}  |  {quantity}  |  {total}\n'.format(index=i, product=product.name, quantity=item.quantity, total=product.price*item.quantity)
                i += 1

            itemText += 'Total No. of Items : {total}'.format(total = itemTotal)
            itemText += 'Total Bill Amount : {total}'.format(total = priceTotal)
            message += itemText

            send_mail(subject, message, 'contact.atbonline@gmail.com', customer.email)
        else: 
            print('Order was Not Successful : ',response_dict['RESPMSG'])


    return render(request, 'store/paytmstatus.html',{'response':response_dict})


@authenticated_user
def printReceipt(request):

    user = request.user
    customer = user.customer
    order = Order.objects.filter(customer=customer, paymentStatus=True)[0]
    items = order.orderitem_set.all()

    context = {
        'customer': customer,
        'order': order,
        'items': items,
    }

    template_path = 'store/receipt.html'
    response = HttpResponse(content_type='application/pdf')
    # response['Content-Disposition'] = 'attachment; filename="Order-Receipt.pdf'
    response['Content-Disposition'] = 'filename="Order-Receipt.pdf'
    template = get_template(template_path)
    html = template.render(context)
    pisa_status = pisa.CreatePDF(
        html, dest=response, link_callback=link_callback)
    if pisa_status.err:
        return HttpResponse('We had some errors <pre>' + html + '</pre>')
    return response