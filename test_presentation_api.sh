#!/bin/bash

# Test script for Presentation API endpoints
# Make sure Django dev server is running: python manage.py runserver

BASE_URL="http://localhost:8000"
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BOLD}=== Presentation API Tests ===${NC}\n"

# Test 1: Get all sections
echo -e "${BLUE}Test 1: GET all presentation sections${NC}"
echo "curl $BASE_URL/api/presentation/sections/"
echo ""
curl -s $BASE_URL/api/presentation/sections/ | python3 -m json.tool
echo -e "\n${GREEN}✓ Test 1 complete${NC}\n"
sleep 1

# Test 2: Get case_background section
echo -e "${BLUE}Test 2: GET case_background section${NC}"
echo "curl $BASE_URL/api/presentation/sections/case_background/"
echo ""
curl -s $BASE_URL/api/presentation/sections/case_background/ | python3 -m json.tool
echo -e "\n${GREEN}✓ Test 2 complete${NC}\n"
sleep 1

# Test 3: Get architecture section
echo -e "${BLUE}Test 3: GET architecture section${NC}"
echo "curl $BASE_URL/api/presentation/sections/architecture/"
echo ""
curl -s $BASE_URL/api/presentation/sections/architecture/ | python3 -m json.tool
echo -e "\n${GREEN}✓ Test 3 complete${NC}\n"
sleep 1

# Test 4: Get how_cloudflare_help section
echo -e "${BLUE}Test 4: GET how_cloudflare_help section${NC}"
echo "curl $BASE_URL/api/presentation/sections/how_cloudflare_help/"
echo ""
curl -s $BASE_URL/api/presentation/sections/how_cloudflare_help/ | python3 -m json.tool
echo -e "\n${GREEN}✓ Test 4 complete${NC}\n"
sleep 1

# Test 5: Get business_value section
echo -e "${BLUE}Test 5: GET business_value section${NC}"
echo "curl $BASE_URL/api/presentation/sections/business_value/"
echo ""
curl -s $BASE_URL/api/presentation/sections/business_value/ | python3 -m json.tool
echo -e "\n${GREEN}✓ Test 5 complete${NC}\n"
sleep 1

# Test 6: Update case_background section
echo -e "${BLUE}Test 6: PUT update case_background section${NC}"
echo "curl -X PUT $BASE_URL/api/presentation/sections/case_background/update/"
echo ""
curl -s -X PUT $BASE_URL/api/presentation/sections/case_background/update/ \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "business_context": {
        "title": "UPDATED: E-commerce Platform via AI",
        "description": "AI-modified description for testing",
        "stats": [
          {"icon": "users", "label": "Global Users", "value": "500K monthly active users"}
        ]
      },
      "current_solution": {
        "title": "Legacy Security Stack",
        "description": "Multiple point solutions causing complexity"
      },
      "pain_points": [
        {
          "title": "Security Gaps",
          "icon": "shield-alt",
          "description": "AI detected critical security vulnerabilities"
        }
      ]
    }
  }' | python3 -m json.tool
echo -e "\n${GREEN}✓ Test 6 complete${NC}\n"
sleep 1

# Test 7: Verify the update
echo -e "${BLUE}Test 7: Verify case_background was updated${NC}"
echo "curl $BASE_URL/api/presentation/sections/case_background/"
echo ""
curl -s $BASE_URL/api/presentation/sections/case_background/ | python3 -m json.tool
echo -e "\n${GREEN}✓ Test 7 complete${NC}\n"

# Test 8: Test error handling - invalid section
echo -e "${BLUE}Test 8: GET invalid section (should return 404)${NC}"
echo "curl $BASE_URL/api/presentation/sections/invalid_section/"
echo ""
curl -s $BASE_URL/api/presentation/sections/invalid_section/ | python3 -m json.tool
echo -e "\n${YELLOW}✓ Test 8 complete (expected 404)${NC}\n"

echo -e "${BOLD}${GREEN}=== All API tests completed! ===${NC}"
echo ""
echo -e "${YELLOW}Note: Test 6 modified the case_background section.${NC}"
echo -e "${YELLOW}Run 'python manage.py seed_presentation' to restore original content.${NC}"
