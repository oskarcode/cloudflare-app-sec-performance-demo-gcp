from django.core.management.base import BaseCommand
from shop.models import PresentationSection

class Command(BaseCommand):
    help = 'Seed presentation with SIMPLE, RELIABLE structure for AI testing'

    def handle(self, *args, **options):
        self.stdout.write('Seeding SIMPLE presentation structure...')
        
        # SIMPLE Case Background - just text fields
        case_background = {
            "company": "TechCorp E-commerce",
            "industry": "Online Retail",
            "description": "A global e-commerce platform serving 1M+ customers",
            "current_challenge": "High bandwidth costs and security vulnerabilities",
            "pain_points": [
                "DDoS attacks causing downtime",
                "SQL injection vulnerabilities",
                "Slow page load times globally"
            ]
        }
        
        # SIMPLE Architecture - before/after flow
        architecture = {
            "current_stack": [
                "User → Origin Server",
                "Manual DDoS mitigation",
                "No WAF protection",
                "Single region deployment"
            ],
            "cloudflare_stack": [
                "User → Cloudflare Edge",
                "Automatic DDoS protection",
                "WAF at the edge",
                "Global CDN with 330+ locations"
            ]
        }
        
        # SIMPLE How Cloudflare Helps - just solutions list
        how_cloudflare_help = {
            "solutions": [
                {
                    "name": "WAF Protection",
                    "description": "Blocks SQL injection and XSS attacks automatically"
                },
                {
                    "name": "DDoS Mitigation", 
                    "description": "Absorbs attacks with 405 Tbps capacity"
                },
                {
                    "name": "Global CDN",
                    "description": "Caches content at 330+ edge locations worldwide"
                }
            ]
        }
        
        # SIMPLE Business Value - just metrics
        business_value = {
            "metrics": [
                {
                    "category": "Cost Savings",
                    "value": "$50K/year in bandwidth costs"
                },
                {
                    "category": "Performance",
                    "value": "50% faster page load times"
                },
                {
                    "category": "Security",
                    "value": "99.9% attack mitigation rate"
                }
            ]
        }
        
        # Create or update sections
        sections_data = [
            ('case_background', case_background),
            ('architecture', architecture),
            ('how_cloudflare_help', how_cloudflare_help),
            ('business_value', business_value),
        ]
        
        for section_type, content in sections_data:
            section, created = PresentationSection.objects.update_or_create(
                section_type=section_type,
                defaults={'content_json': content}
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(
                self.style.SUCCESS(f'{action} {section.get_section_type_display()}')
            )
        
        self.stdout.write(self.style.SUCCESS('✅ SIMPLE presentation seeded!'))
        self.stdout.write(self.style.WARNING('Schema: Simple text fields, arrays, and objects only'))
