from django.core.management.base import BaseCommand
from shop.models import PresentationSection

class Command(BaseCommand):
    help = 'Seed presentation sections with initial content'

    def handle(self, *args, **options):
        self.stdout.write('Seeding presentation sections...')
        
        # Case Background
        case_background = {
            "business_context": {
                "title": "E-commerce Application",
                "description": "Global online retail platform serving customers worldwide",
                "stats": [
                    {"icon": "users", "label": "Global User Base", "value": "Users all over the world"},
                    {"icon": "chart-line", "label": "Monthly Active Users", "value": "Around 100K"},
                    {"icon": "shopping-cart", "label": "Product Catalog", "value": "Full search functionality"},
                    {"icon": "api", "label": "API Endpoints", "value": "RESTful data access"},
                    {"icon": "mobile-alt", "label": "Web Application", "value": "Interactive forms"}
                ]
            },
            "current_solution": {
                "title": "Current Solution",
                "description": "Point security solution with single layer protection",
                "problems": [
                    "Limited coverage across attack vectors",
                    "Complex management of multiple tools",
                    "High operational costs"
                ]
            },
            "pain_points": [
                {
                    "title": "Credential Leaking",
                    "icon": "key",
                    "description": "Sensitive files and API keys exposed to attackers",
                    "severity": "high",
                    "test_links": [
                        {"text": "Test: /.env.backup", "url": "/.env.backup"},
                        {"text": "Test: Git Secrets", "url": "/shop/.git/secrets.txt"}
                    ]
                },
                {
                    "title": "SQL Injection Attacks",
                    "icon": "bug",
                    "description": "Database vulnerabilities at search and contact endpoints",
                    "severity": "critical",
                    "test_links": [
                        {"text": "Test: SQL Injection", "url": "/search/?q=test' OR '1'='1' --"}
                    ]
                },
                {
                    "title": "Bot Scraping",
                    "icon": "robot",
                    "description": "Automated content scraping and competitive intelligence",
                    "severity": "medium",
                    "test_links": [
                        {"text": "Test: Bot Welcome", "url": "/bots/"}
                    ]
                },
                {
                    "title": "Brute Force Attacks",
                    "icon": "fist-raised",
                    "description": "Login credential attacks overwhelming systems",
                    "severity": "high",
                    "test_links": [
                        {"text": "Test: Login Form", "url": "/login/"}
                    ]
                },
                {
                    "title": "DDoS Attacks",
                    "icon": "bomb",
                    "description": "Volumetric attacks causing service disruptions",
                    "severity": "critical",
                    "test_links": [
                        {"text": "Test: API Abuse", "url": "/api/products/"}
                    ]
                }
            ]
        }
        
        # Architecture
        architecture = {
            "problems_mapping": [
                {
                    "problem": "Slow content delivery globally",
                    "current_solution": "CDN - AWS CloudFront",
                    "limitations": ["Limited edge locations", "Higher latency in some regions", "Separate management"]
                },
                {
                    "problem": "Web application attacks",
                    "current_solution": "WAF - Fastly",
                    "limitations": ["Complex rule management", "Delayed threat updates", "High cost per request"]
                },
                {
                    "problem": "DDoS protection",
                    "current_solution": "Third-party DDoS mitigation",
                    "limitations": ["Activation delay", "Limited capacity", "Separate service"]
                }
            ],
            "traffic_flow": {
                "before": [
                    "User → DNS",
                    "DNS → AWS CloudFront (CDN)",
                    "CloudFront → Fastly (WAF)",
                    "Fastly → Load Balancer",
                    "Load Balancer → Web Server",
                    "Web Server → Application",
                    "Application → Database"
                ],
                "after": [
                    "User → DNS",
                    "DNS → Cloudflare (CDN + WAF + DDoS + Bot Management)",
                    "Cloudflare → Web Server",
                    "Web Server → Application",
                    "Application → Database"
                ]
            }
        }
        
        # How Cloudflare Helps
        how_cloudflare_help = {
            "solutions": [
                {
                    "pain_point": "Credential Leaking",
                    "cloudflare_solution": "WAF Managed Rules + Custom Rules",
                    "how_it_works": "Automatically blocks requests to sensitive paths like .env, .git, and detects exposed secrets",
                    "benefits": ["Real-time protection", "Auto-updating rules", "Zero-touch deployment"]
                },
                {
                    "pain_point": "SQL Injection",
                    "cloudflare_solution": "WAF OWASP Core Ruleset",
                    "how_it_works": "Inspects all requests for SQL injection patterns and blocks malicious queries at the edge",
                    "benefits": ["99.9% detection rate", "No application changes needed", "Minimal false positives"]
                },
                {
                    "pain_point": "Bot Scraping",
                    "cloudflare_solution": "Bot Management",
                    "how_it_works": "Machine learning identifies and challenges automated bots while allowing good bots",
                    "benefits": ["Protects content and pricing", "Reduces infrastructure costs", "Improves user experience"]
                },
                {
                    "pain_point": "Brute Force Attacks",
                    "cloudflare_solution": "Rate Limiting + Challenge Rules",
                    "how_it_works": "Limits login attempts per IP and presents challenges to suspicious traffic",
                    "benefits": ["Prevents account takeover", "Reduces server load", "Configurable thresholds"]
                },
                {
                    "pain_point": "DDoS Attacks",
                    "cloudflare_solution": "Automatic DDoS Protection",
                    "how_it_works": "Absorbs attacks at the edge with 405 Tbps capacity across 330 cities",
                    "benefits": ["Always-on protection", "Unmetered mitigation", "Sub-second response time"]
                }
            ],
            "network_advantages": {
                "latency": "~50ms from 95% of global population",
                "capacity": "405 Tbps edge capacity",
                "locations": "330 cities in 125+ countries",
                "connections": "13,000+ direct network connections"
            }
        }
        
        # Business Value
        business_value = {
            "value_propositions": [
                {
                    "title": "Superior Online Experience",
                    "icon": "rocket",
                    "description": "Fast, reliable shopping experiences during peak traffic",
                    "metrics": [
                        {"label": "Page Load Time", "improvement": "50% faster"},
                        {"label": "Cart Abandonment", "improvement": "30% reduction"},
                        {"label": "Conversion Rate", "improvement": "25% increase"}
                    ],
                    "learn_more": [
                        {"text": "Cloudflare Web Optimization", "url": "#"},
                        {"text": "Argo Smart Routing", "url": "#"}
                    ]
                },
                {
                    "title": "Mitigate DDoS Attacks",
                    "icon": "shield-alt",
                    "description": "Unmetered DDoS protection at massive scale",
                    "metrics": [
                        {"label": "Uptime", "improvement": "99.99% availability"},
                        {"label": "Attack Mitigation", "improvement": "Sub-second response"},
                        {"label": "Cost Savings", "improvement": "Zero overage charges"}
                    ],
                    "learn_more": [
                        {"text": "DDoS Protection", "url": "#"},
                        {"text": "Magic Transit", "url": "#"}
                    ]
                },
                {
                    "title": "Improve Agility & Lower Cost",
                    "icon": "cog",
                    "description": "Consolidate security tools and reduce operational overhead",
                    "metrics": [
                        {"label": "Tool Reduction", "improvement": "5 to 1 platform"},
                        {"label": "Management Time", "improvement": "70% less"},
                        {"label": "Total Cost", "improvement": "40% reduction"}
                    ],
                    "learn_more": [
                        {"text": "Cloudflare One", "url": "#"}
                    ]
                },
                {
                    "title": "Prevent Fraudulent Activity",
                    "icon": "user-shield",
                    "description": "Stop fraud before it impacts revenue",
                    "metrics": [
                        {"label": "Fraud Prevention", "improvement": "95% reduction"},
                        {"label": "False Positives", "improvement": "90% fewer"},
                        {"label": "Revenue Protection", "improvement": "$2M+ annually"}
                    ],
                    "learn_more": [
                        {"text": "WAF", "url": "#"},
                        {"text": "Bot Management", "url": "#"}
                    ]
                }
            ],
            "roi_summary": {
                "implementation_time": "< 30 minutes",
                "payback_period": "< 3 months",
                "annual_savings": "$200K - $500K",
                "revenue_impact": "+15% to +25%"
            }
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
        
        self.stdout.write(self.style.SUCCESS('✅ Presentation sections seeded successfully!'))
