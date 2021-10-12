from django.db import models
import uuid
from django.contrib.auth.models import User
from datetime import date

# Create your models here.

class Product(models.Model):
    CATEGORY = (
        ('Spices', 'Spices'),
        ('Condiments', 'Condiments'),
    )

    image = models.ImageField(null=True, blank=True)
    name = models.CharField('Product Name', max_length=25, null=True)
    desc = models.CharField('Product Description', max_length=256, null=True)
    category = models.CharField(
        'Product Category', max_length=255, choices=CATEGORY, null=True)
    quantity = models.FloatField('Quantity (in g)',null=True)
    price = models.FloatField('Product Price',null=True)
    physicalStock = models.IntegerField('Physical Stock', null=True)
    virtualStock = models.IntegerField('Virtual Stock', null=True)

    def __str__(self):
        return '{id} | {name}'.format(id=self.id, name=self.name)

class Customer(models.Model):
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, null=True)
    email = models.EmailField(null=True)
    
    address = models.CharField(max_length=200, null=True)
    city = models.CharField(max_length=200, null=True)
    state = models.CharField(max_length=200, null=True)
    zipcode = models.CharField(max_length=200, null=True)

    def __str__(self):
        return ('{id} | {name}'.format(id=self.id,name=self.name))

class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    date_ordered = models.DateTimeField(auto_now_add=True)
    paymentStatus = models.BooleanField(default=False)
    deliveryStatus = models.BooleanField(default=False)
    transaction_id = models.CharField(max_length=100, null=True)

    def __str__(self):
        return ('O-{id} | {name} | {date}'.format(id=self.id,name=self.customer.name, date=self.date_ordered.date()))

    @property
    def get_cart_total(self):
        orderItems = self.orderitem_set.all()
        total = sum([item.get_total for item in orderItems])
        return total

class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True)
    quantity = models.IntegerField(default=0, null=True, blank=True)
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return ('{id} | {product} | {date}'.format(id=self.order,product=self.product.name, date=self.date_added.date()))

    @property
    def get_total(self):
        total = self.product.price * self.quantity
        return total
