from django.contrib import admin
from .models import Product, PresentationSection

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'category', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description']


@admin.register(PresentationSection)
class PresentationSectionAdmin(admin.ModelAdmin):
    list_display = ['section_type', 'version', 'last_modified']
    list_filter = ['section_type', 'last_modified']
    readonly_fields = ['last_modified', 'version']
    search_fields = ['section_type']
