from django.db import models
from django.urls import reverse
import json

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField()
    category = models.CharField(max_length=100, default="clothing")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('product_detail', kwargs={'pk': self.pk})


class PresentationSection(models.Model):
    """Store dynamic presentation content for AI-assisted editing"""
    
    SECTION_CHOICES = [
        ('case_background', 'Case Background'),
        ('architecture', 'Architecture'),
        ('how_cloudflare_help', 'How Cloudflare Helps'),
        ('business_value', 'Business Value'),
    ]
    
    section_type = models.CharField(
        max_length=50, 
        choices=SECTION_CHOICES, 
        unique=True,
        help_text="Type of presentation section"
    )
    content_json = models.JSONField(
        default=dict,
        help_text="JSON content structure for the section"
    )
    last_modified = models.DateTimeField(auto_now=True)
    version = models.IntegerField(default=1)
    
    class Meta:
        ordering = ['section_type']
        verbose_name = 'Presentation Section'
        verbose_name_plural = 'Presentation Sections'
    
    def __str__(self):
        return f"{self.get_section_type_display()} (v{self.version})"
    
    def save(self, *args, **kwargs):
        # Increment version on each save
        if self.pk:
            self.version += 1
        super().save(*args, **kwargs)
