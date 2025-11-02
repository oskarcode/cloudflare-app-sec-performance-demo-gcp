"""
MCP OAuth Token Manager
Handles automatic token refresh for Cloudflare MCP Portal authentication
"""
import os
import time
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path


class MCPTokenManager:
    """Manages OAuth tokens for MCP portal access with auto-refresh"""
    
    def __init__(self, mode='readonly'):
        """
        Initialize token manager
        
        Args:
            mode: 'readonly' or 'admin'
        """
        self.mode = mode
        self.token_file = Path(__file__).parent.parent / f'.mcp_tokens_{mode}.json'
        self.tokens = self._load_tokens()
    
    def _load_tokens(self):
        """Load tokens from file or environment"""
        # Try to load from file first (cached tokens)
        if self.token_file.exists():
            try:
                with open(self.token_file, 'r') as f:
                    tokens = json.load(f)
                    # Check if tokens are valid
                    if self._is_token_valid(tokens):
                        return tokens
            except (json.JSONDecodeError, IOError):
                pass
        
        # Fall back to environment variables
        env_prefix = 'MCP_OAUTH_' + self.mode.upper()
        access_token = os.getenv(f'{env_prefix}_ACCESS_TOKEN', '')
        refresh_token = os.getenv(f'{env_prefix}_REFRESH_TOKEN', '')
        
        if access_token:
            tokens = {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'expires_at': (datetime.now() + timedelta(hours=1)).isoformat(),
                'created_at': datetime.now().isoformat()
            }
            self._save_tokens(tokens)
            return tokens
        
        return {}
    
    def _save_tokens(self, tokens):
        """Save tokens to file"""
        try:
            with open(self.token_file, 'w') as f:
                json.dump(tokens, f, indent=2)
        except IOError as e:
            print(f"Warning: Could not save tokens to file: {e}")
    
    def _is_token_valid(self, tokens):
        """Check if access token is still valid"""
        if not tokens or 'access_token' not in tokens:
            return False
        
        # Check expiration (with 5 min buffer)
        if 'expires_at' in tokens:
            try:
                expires_at = datetime.fromisoformat(tokens['expires_at'])
                buffer = timedelta(minutes=5)
                if datetime.now() + buffer > expires_at:
                    return False
            except (ValueError, TypeError):
                return False
        
        return True
    
    def _refresh_access_token(self):
        """Refresh the access token using refresh token"""
        if not self.tokens.get('refresh_token'):
            raise Exception("No refresh token available. Please re-authenticate via MCP Inspector.")
        
        # Parse refresh token (format: sub:nonce:secret)
        refresh_token = self.tokens['refresh_token']
        
        # Cloudflare Access OAuth token endpoint
        # This is a placeholder - actual implementation depends on Cloudflare's OAuth endpoint
        oauth_url = "https://oskarman.cloudflareaccess.com/oauth/token"
        
        try:
            response = requests.post(
                oauth_url,
                data={
                    'grant_type': 'refresh_token',
                    'refresh_token': refresh_token,
                },
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                # Update tokens
                self.tokens.update({
                    'access_token': token_data['access_token'],
                    'expires_at': (datetime.now() + timedelta(seconds=token_data.get('expires_in', 3600))).isoformat(),
                    'refreshed_at': datetime.now().isoformat()
                })
                
                # Save updated tokens
                self._save_tokens(self.tokens)
                return True
            else:
                print(f"Token refresh failed: {response.status_code} - {response.text}")
                return False
                
        except requests.RequestException as e:
            print(f"Error refreshing token: {e}")
            return False
    
    def get_access_token(self):
        """
        Get valid access token, refreshing if necessary
        
        Returns:
            str: Valid access token or empty string if unavailable
        """
        # Check if current token is valid
        if self._is_token_valid(self.tokens):
            return self.tokens['access_token']
        
        # Try to refresh
        if self.tokens.get('refresh_token'):
            print(f"Access token expired, attempting refresh for {self.mode} mode...")
            if self._refresh_access_token():
                print("Token refresh successful!")
                return self.tokens['access_token']
            else:
                print("Token refresh failed. Please re-authenticate via MCP Inspector.")
        
        return ''
    
    def update_tokens(self, access_token, refresh_token, expires_in=3600):
        """
        Manually update tokens (e.g., from Inspector)
        
        Args:
            access_token: New access token
            refresh_token: New refresh token
            expires_in: Token lifetime in seconds (default: 3600)
        """
        self.tokens = {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_at': (datetime.now() + timedelta(seconds=expires_in)).isoformat(),
            'created_at': datetime.now().isoformat()
        }
        self._save_tokens(self.tokens)
        print(f"Tokens updated successfully for {self.mode} mode")


# Singleton instances
_readonly_manager = None
_admin_manager = None


def get_token_manager(mode='readonly'):
    """
    Get token manager instance (singleton pattern)
    
    Args:
        mode: 'readonly' or 'admin'
    
    Returns:
        MCPTokenManager: Token manager instance
    """
    global _readonly_manager, _admin_manager
    
    if mode == 'readonly':
        if _readonly_manager is None:
            _readonly_manager = MCPTokenManager('readonly')
        return _readonly_manager
    else:
        if _admin_manager is None:
            _admin_manager = MCPTokenManager('admin')
        return _admin_manager
