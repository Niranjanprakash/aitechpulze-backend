@echo off
REM API Endpoint Verification Script for Windows
REM Tests all endpoints to ensure migration was successful

setlocal enabledelayedexpansion

set API_URL=%1
if "%API_URL%"=="" set API_URL=http://localhost:5000

echo Testing API at: %API_URL%
echo ================================
echo.

set PASSED=0
set FAILED=0

echo [Health Check]
echo ================================
curl -s -o nul -w "Status: %%{http_code}\n" %API_URL%/api/health
echo.

echo [Authentication Endpoints]
echo ================================
echo Testing: User Registration
curl -X POST %API_URL%/api/auth/register ^
    -H "Content-Type: application/json" ^
    -d "{\"name\":\"Test User\",\"email\":\"test%RANDOM%@test.com\",\"password\":\"Test123456\",\"phone\":\"1234567890\"}"
echo.
echo.

echo Testing: User Login (should fail)
curl -X POST %API_URL%/api/auth/login ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"test@test.com\",\"password\":\"wrongpassword\"}"
echo.
echo.

echo [Dashboard Endpoints]
echo ================================
echo Testing: Dashboard Stats (unauthorized)
curl -s -o nul -w "Status: %%{http_code}\n" %API_URL%/api/dashboard/stats
echo.

echo [Projects Endpoints]
echo ================================
echo Testing: Get Projects (unauthorized)
curl -s -o nul -w "Status: %%{http_code}\n" %API_URL%/api/projects
echo.

echo [Payments Endpoints]
echo ================================
echo Testing: Get Payments (unauthorized)
curl -s -o nul -w "Status: %%{http_code}\n" %API_URL%/api/payments
echo.

echo [Contact Endpoint]
echo ================================
echo Testing: Contact Form
curl -X POST %API_URL%/api/contact ^
    -H "Content-Type: application/json" ^
    -d "{\"name\":\"Test\",\"email\":\"test@test.com\",\"message\":\"Test message\"}"
echo.
echo.

echo ================================
echo Test Complete!
echo ================================
echo Check the responses above to verify all endpoints are working.
echo.

pause
