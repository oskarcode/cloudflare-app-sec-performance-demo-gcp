#!/bin/bash

# Test script for MCP Server
# Make sure MCP server is deployed: wrangler deploy --config wrangler-mcp.toml

MCP_URL="https://appdemo.oskarcode.com/mcp"
# Or for local testing with workers.dev:
# MCP_URL="https://presentation-mcp-server.<your-subdomain>.workers.dev/mcp"

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BOLD}=== MCP Server Tests ===${NC}\n"

# Test 1: Get server info
echo -e "${BLUE}Test 1: GET MCP server info${NC}"
echo "curl $MCP_URL/info"
echo ""
curl -s $MCP_URL/info | python3 -m json.tool
echo -e "\n${GREEN}✓ Test 1 complete${NC}\n"
sleep 1

# Test 2: List available tools
echo -e "${BLUE}Test 2: List MCP tools${NC}"
echo "curl $MCP_URL/tools/list"
echo ""
curl -s $MCP_URL/tools/list | python3 -m json.tool
echo -e "\n${GREEN}✓ Test 2 complete${NC}\n"
sleep 1

# Test 3: Call get_all_sections tool
echo -e "${BLUE}Test 3: Call get_all_sections tool${NC}"
echo "curl -X POST $MCP_URL/tools/call"
echo ""
curl -s -X POST $MCP_URL/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_all_sections",
    "arguments": {}
  }' | python3 -m json.tool | head -50
echo -e "\n${GREEN}✓ Test 3 complete${NC}\n"
sleep 1

# Test 4: Call get_presentation_section tool
echo -e "${BLUE}Test 4: Get case_background section${NC}"
echo "curl -X POST $MCP_URL/tools/call"
echo ""
curl -s -X POST $MCP_URL/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_presentation_section",
    "arguments": {
      "section_type": "case_background"
    }
  }' | python3 -m json.tool | head -40
echo -e "\n${GREEN}✓ Test 4 complete${NC}\n"
sleep 1

# Test 5: Update case_background via MCP
echo -e "${BLUE}Test 5: Update case_background via MCP${NC}"
echo "curl -X POST $MCP_URL/tools/call"
echo ""
curl -s -X POST $MCP_URL/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "update_case_background",
    "arguments": {
      "content": {
        "business_context": {
          "title": "MCP-Updated E-commerce Platform",
          "description": "This content was updated via MCP server!",
          "stats": [
            {"icon": "robot", "label": "AI-Powered", "value": "Content managed by AI"}
          ]
        },
        "current_solution": {
          "title": "Current Solution",
          "description": "Testing MCP integration"
        },
        "pain_points": [
          {
            "title": "Testing MCP",
            "icon": "check",
            "description": "This is a test update via MCP"
          }
        ]
      }
    }
  }' | python3 -m json.tool
echo -e "\n${GREEN}✓ Test 5 complete${NC}\n"
sleep 1

# Test 6: Verify the update
echo -e "${BLUE}Test 6: Verify case_background was updated${NC}"
echo "curl -X POST $MCP_URL/tools/call"
echo ""
curl -s -X POST $MCP_URL/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_presentation_section",
    "arguments": {
      "section_type": "case_background"
    }
  }' | python3 -m json.tool | head -30
echo -e "\n${GREEN}✓ Test 6 complete${NC}\n"

echo -e "${BOLD}${GREEN}=== All MCP tests completed! ===${NC}"
echo ""
echo -e "${YELLOW}Note: Test 5 modified the case_background section.${NC}"
echo -e "${YELLOW}Visit https://appdemo.oskarcode.com/presentation/ to see changes.${NC}"
echo -e "${YELLOW}Run 'python manage.py seed_presentation' to restore original content.${NC}"
