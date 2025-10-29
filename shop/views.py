from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.http import JsonResponse
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import Product, PresentationSection
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
    Now with dynamic content from database (AI-editable).
    """
    # Fetch all presentation sections from database
    sections = {}
    for section in PresentationSection.objects.all():
        sections[section.section_type] = section.content_json
    
    # Provide default empty dicts if sections don't exist
    context = {
        'case_background': sections.get('case_background', {}),
        'architecture': sections.get('architecture', {}),
        'how_cloudflare_help': sections.get('how_cloudflare_help', {}),
        'business_value': sections.get('business_value', {}),
    }
    
    return render(request, 'shop/presentation_dynamic.html', context)

def flash_sale(request):
    """
    Flash sale page for demonstrating Workers rate limiting.
    """
    # Get featured products for the flash sale
    products = Product.objects.all()[:6]  # Show 6 products
    return render(request, 'shop/flash_sale.html', {'products': products})

def git_secrets(request):
    """
    Intentionally vulnerable endpoint exposing git secrets for Cloudflare WAF testing.
    This endpoint should be blocked by Cloudflare's managed rules.
    """
    # Simulate exposed git secrets and sensitive information
    fake_secrets = {
        'database_password': 'super_secret_db_password_123',
        'api_key': 'sk-1234567890abcdefghijklmnopqrstuvwxyz',
        'aws_access_key': 'AKIAIOSFODNN7EXAMPLE',
        'aws_secret_key': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        'github_token': 'ghp_1234567890abcdefghijklmnopqrstuvwxyz',
        'jwt_secret': 'my-super-secret-jwt-key-that-should-never-be-exposed',
        'encryption_key': 'aes256-key-that-should-be-secure',
        'admin_password': 'admin123!@#',
        'stripe_secret': 'sk_test_1234567890abcdefghijklmnopqrstuvwxyz',
        'paypal_client_secret': 'paypal-secret-key-123456789'
    }
    
    return render(request, 'shop/git_secrets.html', {'secrets': fake_secrets})

def env_backup(request):
    """
    Intentionally vulnerable endpoint exposing .env.backup file for Cloudflare WAF testing.
    This endpoint should be blocked by Cloudflare's managed rules.
    """
    # Simulate exposed environment variables
    fake_env_vars = {
        'SECRET_KEY': 'django-insecure-super-secret-key-for-production-123456789',
        'DEBUG': 'True',
        'DATABASE_URL': 'postgresql://user:password123@localhost:5432/ecommerce_db',
        'REDIS_URL': 'redis://localhost:6379/0',
        'EMAIL_HOST_PASSWORD': 'email-password-123',
        'AWS_ACCESS_KEY_ID': 'AKIAIOSFODNN7EXAMPLE',
        'AWS_SECRET_ACCESS_KEY': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        'STRIPE_SECRET_KEY': 'sk_test_1234567890abcdefghijklmnopqrstuvwxyz',
        'PAYPAL_CLIENT_SECRET': 'paypal-secret-key-123456789',
        'JWT_SECRET_KEY': 'jwt-secret-key-that-should-be-secure',
        'ENCRYPTION_KEY': 'aes256-encryption-key-for-sensitive-data',
        'ADMIN_EMAIL': 'admin@example.com',
        'ADMIN_PASSWORD': 'admin123!@#'
    }
    
    return render(request, 'shop/env_backup.html', {'env_vars': fake_env_vars})

def health_check(request):
    """
    Health check endpoint for load balancers and monitoring.
    """
    from django.db import connection
    from django.http import JsonResponse
    
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=503)


# =====================================================
# PRESENTATION API VIEWS (for AI-assisted editing)
# =====================================================

def api_presentation_sections(request):
    """Get all presentation sections"""
    sections = PresentationSection.objects.all()
    data = {
        section.section_type: {
            'content': section.content_json,
            'last_modified': section.last_modified.isoformat(),
            'version': section.version
        }
        for section in sections
    }
    return JsonResponse(data)


def api_presentation_section(request, section_type):
    """Get a specific presentation section"""
    try:
        section = PresentationSection.objects.get(section_type=section_type)
        data = {
            'section_type': section.section_type,
            'content': section.content_json,
            'last_modified': section.last_modified.isoformat(),
            'version': section.version
        }
        return JsonResponse(data)
    except PresentationSection.DoesNotExist:
        return JsonResponse(
            {'error': f'Section {section_type} not found'},
            status=404
        )


@csrf_exempt
def api_presentation_section_update(request, section_type):
    """Update a presentation section (used by AI via MCP)"""
    if request.method != 'PUT':
        return JsonResponse({'error': 'PUT method required'}, status=405)
    
    try:
        # Parse JSON body
        data = json.loads(request.body)
        content = data.get('content')
        
        if not content:
            return JsonResponse(
                {'error': 'Content is required'},
                status=400
            )
        
        # Get or create section
        section, created = PresentationSection.objects.get_or_create(
            section_type=section_type,
            defaults={'content_json': content}
        )
        
        if not created:
            section.content_json = content
            section.save()
        
        return JsonResponse({
            'success': True,
            'section_type': section.section_type,
            'version': section.version,
            'last_modified': section.last_modified.isoformat(),
            'created': created
        })
    
    except json.JSONDecodeError:
        return JsonResponse(
            {'error': 'Invalid JSON'},
            status=400
        )
    except Exception as e:
        return JsonResponse(
            {'error': str(e)},
            status=500
        )
