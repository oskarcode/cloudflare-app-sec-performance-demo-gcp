# AI Chat Setup Guide

## Prerequisites

Your AI chat system is now installed! You just need to add your Claude API key.

## Step 1: Get Claude API Key

1. Go to: https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

## Step 2: Configure API Key

Create a `.env` file in the project root:

```bash
cd /Users/oskarablimit/Desktop/Personal\ \&\ Family/personal/Projects/cloudflare_demo_ecommerce

# Create .env file
cat > .env << 'EOF'
# Claude API Configuration
CLAUDE_API_KEY=your_api_key_here

# Django Settings (keep existing values)
SECRET_KEY=your-secret-key-here
DEBUG=True

# MCP Server URL
MCP_SERVER_URL=https://appdemo.oskarcode.com/mcp
EOF
```

Then edit `.env` and replace `your_api_key_here` with your actual Claude API key.

## Step 3: Load Environment Variables

Make sure your Django settings load the .env file. This should already be configured with python-dotenv.

## Step 4: Restart Django Server

```bash
# Stop the current server (Ctrl+C in the terminal where it's running)

# Start it again with the new environment
source venv/bin/activate
python manage.py runserver
```

## Step 5: Test the AI Chat

1. Visit: http://localhost:8000/presentation/
2. Click the "AI Assistant" button (bottom right)
3. Try these test messages:
   - "Show me the current case background"
   - "Update the business context title to 'Retail E-commerce Platform'"
   - "Add a new pain point about account takeover attacks"

## How It Works

```
User → Chat Widget (Frontend)
    ↓
Django AI Chat Endpoint (/api/ai-chat/)
    ↓
Claude API (with MCP-like tools)
    ↓
Django Database (PresentationSection model)
    ↓
Page Refresh → See Updated Content
```

## Available Commands

### View Content
- "Show me the case background"
- "What's in the architecture section?"
- "Display the business value content"

### Update Content
- "Change the business context to focus on healthcare"
- "Update monthly users to 500K"
- "Add a pain point about bot attacks"
- "Change the ROI payback period to 2 months"

## Example Conversation

**You:** Show me the current case background

**AI:** Let me retrieve that for you... [Shows current content]

**You:** Update the title to "Healthcare E-commerce Platform"

**AI:** I'll update the business context title... Done! I've updated the case background section with the new title.

[Popup appears: "Content updated! Reload to see changes?"]

## Troubleshooting

### Error: "CLAUDE_API_KEY not configured"
- Make sure .env file exists
- Check that CLAUDE_API_KEY is set in .env
- Restart Django server after creating .env

### Error: "Invalid API key"
- Verify your API key is correct
- Check that it starts with `sk-ant-`
- Make sure there are no extra spaces

### Chat button doesn't open
- Check browser console for JavaScript errors
- Make sure you're on the presentation page (/presentation/)
- Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Changes don't appear
- Click "Reload" when prompted
- Or manually refresh the page
- Check Django logs to confirm update was saved

## Cost Considerations

- Claude API charges per token
- Typical conversation: ~$0.01 - $0.05
- Monitor usage at: https://console.anthropic.com/

## Security Notes

- **Never commit .env file to git** (it's in .gitignore)
- API key should be kept secret
- For production, use environment variables
- Consider adding rate limiting for the /api/ai-chat/ endpoint

## Advanced: Production Deployment

For production, set environment variable instead of .env:

```bash
# On your server
export CLAUDE_API_KEY="sk-ant-..."

# Or in your deployment platform (Heroku, AWS, etc.)
# Add CLAUDE_API_KEY as an environment variable
```

## Support

If you encounter issues:
1. Check Django logs
2. Check browser console
3. Verify API key is valid
4. Test Claude API directly at console.anthropic.com

## What's Next?

- Add authentication to chat endpoint
- Implement rate limiting
- Add conversation history persistence
- Create admin panel for chat logs
- Add more sophisticated prompts
