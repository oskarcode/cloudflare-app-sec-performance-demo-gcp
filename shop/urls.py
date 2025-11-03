from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('search/', views.search_products, name='search'),
    path('contact/', views.contact, name='contact'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('product/<int:pk>/', views.product_detail, name='product_detail'),
    path('bots/', views.robots_welcome, name='robots_welcome'),
    path('api/products/', views.api_products, name='api_products'),
    path('api/login-test/', views.api_login_test, name='api_login_test'),
    path('presentation/', views.presentation, name='presentation'),
    path('flash-sale/', views.flash_sale, name='flash_sale'),
    path('.git/secrets.txt', views.git_secrets, name='git_secrets'),
    path('.env.backup/', views.env_backup, name='env_backup'),
    path('health/', views.health_check, name='health_check'),
    
    # Presentation API endpoints
    path('api/presentation/sections/', views.api_presentation_sections, name='api_presentation_sections'),
    path('api/presentation/sections/<str:section_type>/', views.api_presentation_section, name='api_presentation_section'),
    path('api/presentation/sections/<str:section_type>/update/', views.api_presentation_section_update, name='api_presentation_section_update'),
    
    # AI Chat endpoint
    path('api/ai-chat/', views.ai_chat, name='ai_chat'),
]