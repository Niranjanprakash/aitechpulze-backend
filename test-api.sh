#!/bin/bash

# 🧪 API Endpoint Verification Script
# Tests all endpoints to ensure migration was successful

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${1:-http://localhost:5000}"
echo "Testing API at: $API_URL"
echo "================================"

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local expected_status=$5
    
    echo -n "Testing: $description... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        ((FAILED++))
    fi
}

echo ""
echo "🏥 Health Check"
echo "================================"
test_endpoint "GET" "/api/health" "Health endpoint" "" 200

echo ""
echo "🔐 Authentication Endpoints"
echo "================================"
test_endpoint "POST" "/api/auth/register" "User registration" \
    '{"name":"Test User","email":"test'$(date +%s)'@test.com","password":"Test123456","phone":"1234567890"}' 201

test_endpoint "POST" "/api/auth/login" "User login (should fail - wrong password)" \
    '{"email":"test@test.com","password":"wrongpassword"}' 401

echo ""
echo "📊 Dashboard Endpoints"
echo "================================"
test_endpoint "GET" "/api/dashboard/stats" "Dashboard stats (unauthorized)" "" 401

echo ""
echo "📁 Projects Endpoints"
echo "================================"
test_endpoint "GET" "/api/projects" "Get projects (unauthorized)" "" 401

echo ""
echo "💳 Payments Endpoints"
echo "================================"
test_endpoint "GET" "/api/payments" "Get payments (unauthorized)" "" 401

echo ""
echo "📞 Contact Endpoint"
echo "================================"
test_endpoint "POST" "/api/contact" "Contact form" \
    '{"name":"Test","email":"test@test.com","message":"Test message"}' 200

echo ""
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Migration successful!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the errors above.${NC}"
    exit 1
fi
