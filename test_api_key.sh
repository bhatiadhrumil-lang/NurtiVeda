#!/usr/bin/env bash
set -euo pipefail

echo "=== TEST: Google AI API Key Validation ==="
: "${GEMINI_API_KEY:?Set GEMINI_API_KEY before running this script}"
API_KEY="$GEMINI_API_KEY"

echo ""
echo "1. Testing OpenAI-compatible endpoint (current in code)"
echo "Endpoint: https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
echo "Model: google/gemini-2.5-flash"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemini-2.5-flash",
    "messages": [{"role":"user","content":"Provide nutritional info for apple"}]
  }')
HTTP_STATUS=$(echo "$RESPONSE" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
echo "HTTP Status: $HTTP_STATUS"
echo "Response body (first 800 chars):"
echo "$BODY" | head -c 800
echo ""
echo ""

echo "2. Testing native Gemini endpoint"
echo "Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
RESPONSE2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts":[{"text":"Provide nutritional info for apple"}]}]
  }')
HTTP_STATUS2=$(echo "$RESPONSE2" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
BODY2=$(echo "$RESPONSE2" | sed '/HTTP_STATUS/d')
echo "HTTP Status: $HTTP_STATUS2"
echo "Response body (first 800 chars):"
echo "$BODY2" | head -c 800
echo ""
echo ""

echo "3. Verdict"
if echo "$BODY" | grep -q "invalid"; then
  echo "FAIL: OpenAI-compatible endpoint rejected the key as INVALID."
fi
if echo "$BODY2" | grep -q "invalid"; then
  echo "FAIL: Native Gemini endpoint rejected the key as INVALID."
fi
echo "Key value tested: ${API_KEY}"
echo "Length: ${#API_KEY} chars"
echo "If both fail, the API key is either revoked, expired, or was never a valid production Google AI key."
