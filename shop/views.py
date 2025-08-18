from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.http import JsonResponse
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
from .models import Product
import json

def home(request):
    products = Product.objects.all()[:12]
    return render(request, 'shop/home.html', {'products': products})

def search_products(request):
    query = request.GET.get('q', '')
    products = []
    
    if query:
        cursor = connection.cursor()
        sql = f"SELECT * FROM shop_product WHERE name LIKE '%{query}%' OR description LIKE '%{query}%'"
        cursor.execute(sql)
        columns = [col[0] for col in cursor.description]
        results = cursor.fetchall()
        
        for row in results:
            product_dict = dict(zip(columns, row))
            try:
                product = Product.objects.get(id=product_dict['id'])
                products.append(product)
            except Product.DoesNotExist:
                pass
    # Remove the else clause - no products shown by default
    
    return render(request, 'shop/search.html', {'products': products, 'query': query})

def contact(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')
        messages.success(request, 'Thank you for contacting us!')
        return redirect('contact')
    return render(request, 'shop/contact.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, 'Login successful!')
            return redirect('home')
        else:
            messages.error(request, 'Invalid username or password.')
    return render(request, 'shop/login.html')

def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, 'Registration successful!')
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'shop/register.html', {'form': form})

def logout_view(request):
    logout(request)
    messages.success(request, 'Logged out successfully!')
    return redirect('home')

def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    return render(request, 'shop/product_detail.html', {'product': product})

def robots_welcome(request):
    return render(request, 'shop/robots_welcome.html')

@csrf_exempt
def api_products(request):
    products = Product.objects.all().values('id', 'name', 'price', 'category')
    return JsonResponse(list(products), safe=False)

@csrf_exempt
def api_login_test(request):
    """
    Intentionally vulnerable login endpoint for rate limiting demos.
    No CSRF protection for testing purposes.
    """
    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        
        # Intentionally weak - always return "invalid credentials" for demo
        return JsonResponse({
            'success': False,
            'message': f'Invalid credentials for user: {username}',
            'attempt_blocked': False
        }, status=401)
    
    return JsonResponse({
        'error': 'POST method required',
        'endpoint': 'login-test'
    })

def presentation(request):
    """
    Professional presentation page for security demonstrations.
    """
    return render(request, 'shop/presentation.html')

def flash_sale(request):
    """
    Flash sale page for demonstrating Workers rate limiting.
    """
    # Get featured products for the flash sale
    products = Product.objects.all()[:6]  # Show 6 products
    return render(request, 'shop/flash_sale.html', {'products': products})
