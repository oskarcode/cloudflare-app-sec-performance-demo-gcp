from django.core.management.base import BaseCommand
from shop.models import Product
import random

class Command(BaseCommand):
    help = 'Populate database with sample products'

    def handle(self, *args, **options):
        Product.objects.all().delete()
        
        products = [
            {
                'name': 'Classic Cotton T-Shirt',
                'price': 24.99,
                'description': 'Comfortable 100% cotton t-shirt perfect for everyday wear. Available in multiple colors and sizes.',
                'category': 'clothing'
            },
            {
                'name': 'Slim Fit Jeans',
                'price': 79.99,
                'description': 'Premium denim jeans with a modern slim fit. Durable construction and classic styling.',
                'category': 'clothing'
            },
            {
                'name': 'Summer Floral Dress',
                'price': 89.99,
                'description': 'Elegant floral print dress perfect for summer occasions. Lightweight and breathable fabric.',
                'category': 'clothing'
            },
            {
                'name': 'Running Sneakers',
                'price': 129.99,
                'description': 'High-performance running shoes with advanced cushioning and support for all-day comfort.',
                'category': 'shoes'
            },
            {
                'name': 'Leather Jacket',
                'price': 199.99,
                'description': 'Genuine leather jacket with classic biker styling. Perfect for adding edge to any outfit.',
                'category': 'outerwear'
            },
            {
                'name': 'Casual Button-Down Shirt',
                'price': 54.99,
                'description': 'Versatile button-down shirt suitable for both casual and business casual occasions.',
                'category': 'clothing'
            },
            {
                'name': 'Yoga Leggings',
                'price': 39.99,
                'description': 'High-waisted yoga leggings with moisture-wicking fabric and four-way stretch.',
                'category': 'activewear'
            },
            {
                'name': 'Winter Parka',
                'price': 159.99,
                'description': 'Warm winter parka with down filling and water-resistant outer shell. Perfect for cold weather.',
                'category': 'outerwear'
            },
            {
                'name': 'Canvas Sneakers',
                'price': 69.99,
                'description': 'Classic canvas sneakers with rubber sole. Timeless style that goes with everything.',
                'category': 'shoes'
            },
            {
                'name': 'Wool Sweater',
                'price': 94.99,
                'description': 'Cozy wool sweater with cable knit pattern. Perfect for layering during cooler months.',
                'category': 'clothing'
            },
            {
                'name': 'Denim Jacket',
                'price': 84.99,
                'description': 'Classic denim jacket with vintage wash. A timeless piece that never goes out of style.',
                'category': 'outerwear'
            },
            {
                'name': 'Athletic Shorts',
                'price': 29.99,
                'description': 'Lightweight athletic shorts with built-in moisture management. Perfect for workouts.',
                'category': 'activewear'
            },
            {
                'name': 'Formal Dress Shoes',
                'price': 149.99,
                'description': 'Elegant leather dress shoes perfect for formal occasions and business meetings.',
                'category': 'shoes'
            },
            {
                'name': 'Hoodie Sweatshirt',
                'price': 49.99,
                'description': 'Comfortable cotton blend hoodie with front pocket. Perfect for casual wear.',
                'category': 'clothing'
            },
            {
                'name': 'Maxi Dress',
                'price': 74.99,
                'description': 'Flowing maxi dress with bohemian print. Perfect for summer parties and beach vacations.',
                'category': 'clothing'
            }
        ]
        
        for product_data in products:
            product = Product.objects.create(**product_data)
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created product: {product.name}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(products)} products')
        )