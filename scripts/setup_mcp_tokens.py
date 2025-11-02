#!/usr/bin/env python3
"""
MCP OAuth Token Setup Helper

This script helps you set up OAuth tokens for MCP portal authentication.
Run this after getting tokens from MCP Inspector.

Usage:
    python3 scripts/setup_mcp_tokens.py

Then follow the prompts to enter your tokens from MCP Inspector.
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from shop.mcp_token_manager import get_token_manager


def setup_tokens():
    """Interactive token setup"""
    print("=" * 60)
    print("MCP OAuth Token Setup")
    print("=" * 60)
    print()
    print("You need to get OAuth tokens from MCP Inspector first:")
    print("1. Run: npx @modelcontextprotocol/inspector")
    print("2. Configure SSE transport")
    print("3. Enter portal URL and complete OAuth flow")
    print("4. Copy the access_token and refresh_token")
    print()
    
    # Setup readonly tokens
    print("-" * 60)
    print("READ-ONLY MODE (User)")
    print("Portal URL: https://mcpr.appdemo.oskarcode.com/mcp")
    print("-" * 60)
    
    readonly_access = input("Enter readonly access_token (or 'skip'): ").strip()
    
    if readonly_access and readonly_access != 'skip':
        readonly_refresh = input("Enter readonly refresh_token: ").strip()
        expires_in = input("Token expires in seconds (default 3600): ").strip()
        expires_in = int(expires_in) if expires_in else 3600
        
        readonly_manager = get_token_manager('readonly')
        readonly_manager.update_tokens(readonly_access, readonly_refresh, expires_in)
        print("✅ Readonly tokens saved!")
    else:
        print("⏭️  Skipped readonly tokens")
    
    print()
    
    # Setup admin tokens
    print("-" * 60)
    print("ADMIN MODE (Write Access)")
    print("Portal URL: https://mcpw.appdemo.oskarcode.com/mcp")
    print("-" * 60)
    
    admin_access = input("Enter admin access_token (or 'skip'): ").strip()
    
    if admin_access and admin_access != 'skip':
        admin_refresh = input("Enter admin refresh_token: ").strip()
        expires_in = input("Token expires in seconds (default 3600): ").strip()
        expires_in = int(expires_in) if expires_in else 3600
        
        admin_manager = get_token_manager('admin')
        admin_manager.update_tokens(admin_access, admin_refresh, expires_in)
        print("✅ Admin tokens saved!")
    else:
        print("⏭️  Skipped admin tokens")
    
    print()
    print("=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print()
    print("Your tokens are stored in:")
    print("  - .mcp_tokens_readonly.json (User mode)")
    print("  - .mcp_tokens_admin.json (Admin mode)")
    print()
    print("The tokens will auto-refresh using the refresh_token.")
    print("You'll need to re-authenticate when refresh tokens expire (~30-90 days)")
    print()


if __name__ == '__main__':
    try:
        setup_tokens()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        sys.exit(1)
