#!/usr/bin/env python3
"""
Simple test script to verify Claude API key works
"""

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Get API key
api_key = os.getenv('CLAUDE_API_KEY')

print(f"API Key found: {api_key[:20]}..." if api_key else "API Key not found!")
print(f"API Key length: {len(api_key) if api_key else 0}")

if api_key:
    print("\nTesting Claude API connection...")
    try:
        from anthropic import Anthropic
        
        client = Anthropic(api_key=api_key)
        
        # Simple test message
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=100,
            messages=[
                {"role": "user", "content": "Say 'API connection successful!' in exactly those words."}
            ]
        )
        
        print("✅ SUCCESS!")
        print(f"Response: {response.content[0].text}")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print(f"Error type: {type(e).__name__}")
else:
    print("❌ No API key found in environment")
