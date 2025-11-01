from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.http import JsonResponse, HttpResponseRedirect
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import Product, PresentationSection
import json
import requests

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


# =====================================================
# AI CHAT WITH MCP CONNECTOR
# =====================================================

@csrf_exempt
def ai_chat(request):
    """
    AI chat endpoint that integrates Claude with MCP connector.
    Allows natural language editing of presentation content.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    try:
        # Get API key from environment
        import os
        api_key = os.getenv('CLAUDE_API_KEY')
        if not api_key:
            return JsonResponse({
                'error': 'CLAUDE_API_KEY not configured'
            }, status=500)
        
        # Parse request body
        data = json.loads(request.body)
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        mode = data.get('mode', 'user')  # 'admin' or 'user'
        
        if not user_message:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        # Build messages array
        messages = conversation_history + [
            {"role": "user", "content": user_message}
        ]
        
        # Determine MCP endpoint based on mode
        # Use direct worker URLs with IP-based access control
        if mode == 'admin':
            # Admin mode: All 6 tools (read + write)
            mcp_server_url = 'https://appdemo.oskarcode.com/mcpw/sse'
            access_level = "ADMIN mode with full access"
            available_tools = "All 6 tools: get_all_sections, get_presentation_section (read), update_case_background, update_architecture, update_how_cloudflare_help, update_business_value (write)"
            access_message = "You can view AND update all presentation content."
        else:
            # User mode: Only 2 read-only tools
            mcp_server_url = 'https://appdemo.oskarcode.com/mcpr/sse'
            access_level = "USER mode with read-only access"
            available_tools = "Only 2 tools: get_all_sections, get_presentation_section (read-only)"
            access_message = "You can ONLY VIEW content. You CANNOT update anything. Click the User button in the chat header to switch to Admin mode if you need to make updates."
        
        # System prompt
        system_prompt = f"""You are a brief, direct AI assistant for Cloudflare demo presentations.

CURRENT MODE: {access_level}
AVAILABLE TOOLS: {available_tools}
ACCESS: {access_message}

CRITICAL RULES - READ CAREFULLY:
1. Maximum 3 sentences per response
2. NO bullet points unless absolutely necessary
3. NO markdown formatting (no **, ##, ###)
4. Use plain text only
5. Get to the point in first sentence
6. If user asks to update/change/edit content in USER mode, IMMEDIATELY respond: "I'm in User mode (read-only). I can only view content, not update it. Click the User button at the top to switch to Admin mode for write access. Your available tools: get_all_sections, get_presentation_section."

When showing info: "[Company] has [problem]. Main issue: [brief]. Solution: [brief]."
When updating: "Done. Changed [X] to [Y]."

GOOD (3 sentences max):
"ToTheMoon.com is a space collectibles site with $5K/month bandwidth costs and no security. They need Cloudflare to cut costs and add WAF protection. Want to see the architecture or solutions?"

BAD (too long):
"You're working with ToTheMoon.com, an e-commerce site selling space and astronomy collectibles globally. They're a mid-sized business (~50-100 employees, $10-25M revenue)... [continues with multiple paragraphs]"

IMPORTANT - Network Advantages Format:
When updating network_advantages, use CONCISE stats only:
- latency: "~50ms from 95% of population" (NOT full sentence)
- network_capacity: "405 Tbps" (NOT description of what it consists of)
- locations: "330 cities in 125+ countries" (short version)
- direct_connections: "13,000 networks" (NOT full sentence about ISPs)

Your job: Answer in 3 sentences or less. Period."""
        
        # Call Claude API with MCP Connector
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': api_key,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'mcp-client-2025-04-04'
            },
            json={
                'model': 'claude-sonnet-4-5',
                'max_tokens': 4096,
                'system': system_prompt,
                'messages': messages,
                'mcp_servers': [
                    {
                        'type': 'url',
                        'url': mcp_server_url,
                        'name': 'presentation-manager'
                    }
                ]
            },
            timeout=60
        )
        
        # Check response status and parse
        result = response.json()
        
        # Check for API errors
        if result.get('type') == 'error':
            error_msg = result.get('error', {}).get('message', 'Unknown error')
            error_type = result.get('error', {}).get('type', 'unknown')
            return JsonResponse({
                'error': f'Anthropic API Error ({error_type}): {error_msg}',
                'details': result.get('error', {})
            }, status=400)
        
        # Extract response text from Claude and check for tool usage
        response_text = ""
        tool_used = False
        text_blocks = []
        
        if 'content' in result:
            for block in result['content']:
                if block.get('type') == 'text':
                    response_text += block.get('text', '')
                    text_blocks.append(block)
                elif 'tool' in block.get('type', ''):
                    tool_used = True
        
        # Build conversation history for next turn
        # IMPORTANT: Only include text blocks, not tool_use blocks
        # MCP connector handles tool execution separately, and including tool_use
        # without tool_result blocks causes API errors
        assistant_message = {
            'role': 'assistant',
            'content': text_blocks if text_blocks else [{'type': 'text', 'text': response_text}]
        }
        
        # If tools were used, start fresh conversation to avoid tool_use/tool_result errors
        # MCP handles tool execution internally, so we don't need to track it
        conversation = messages + [assistant_message] if not tool_used else [messages[-1], assistant_message]
        
        return JsonResponse({
            'success': True,
            'response': response_text,
            'tool_used': tool_used,
            'conversation': conversation,
            'usage': result.get('usage', {})
        })
    
    except json.JSONDecodeError as e:
        return JsonResponse({'error': f'Invalid JSON: {str(e)}'}, status=400)
    except requests.exceptions.RequestException as e:
        # Try to get error details from response
        error_details = None
        try:
            if hasattr(e, 'response') and e.response is not None:
                error_details = e.response.json()
        except:
            pass
        
        return JsonResponse({
            'error': f'API request failed: {str(e)}',
            'details': error_details
        }, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
