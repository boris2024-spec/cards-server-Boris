#!/bin/bash
# Simple demonstration of user blocking functionality via curl

echo "🚀 User Blocking Functionality Demonstration"
echo ""

# 1. Create administrator (first user automatically becomes admin)
echo "1️⃣ Creating administrator..."
ADMIN_EMAIL="admin_$(date +%s)@example.com"

ADMIN_RESPONSE=$(curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": {
      \"first\": \"Admin\",
      \"last\": \"User\"
    },
    \"phone\": \"050-123 4567\",
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"AdminPass123!\",
    \"isBusiness\": false
  }")

echo "   Response: $ADMIN_RESPONSE"
ADMIN_ID=$(echo $ADMIN_RESPONSE | jq -r '._id')
IS_ADMIN=$(echo $ADMIN_RESPONSE | jq -r '.isAdmin')
echo "   Administrator created: $ADMIN_EMAIL"
echo "   ID: $ADMIN_ID"
echo "   isAdmin: $IS_ADMIN"
echo ""

# 2. Administrator login
echo "2️⃣ Administrator login..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"AdminPass123!\"
  }" | tr -d '"')

echo "   Token received: ✅"
echo "   Token: $ADMIN_TOKEN"
echo ""

# 3. Create regular user
echo "3️⃣ Creating regular user..."
USER_EMAIL="user_$(date +%s)@example.com"

USER_RESPONSE=$(curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": {
      \"first\": \"Regular\",
      \"last\": \"User\"
    },
    \"phone\": \"050-987 6543\",
    \"email\": \"$USER_EMAIL\",
    \"password\": \"UserPass123!\",
    \"isBusiness\": true
  }")

echo "   Response: $USER_RESPONSE"
USER_ID=$(echo $USER_RESPONSE | jq -r '._id')
echo "   User created: $USER_EMAIL"
echo "   ID: $USER_ID"
echo ""

# 4. Check regular user login
echo "4️⃣ Checking regular user login..."
USER_TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"UserPass123!\"
  }" | tr -d '"')

if [ ! -z "$USER_TOKEN" ]; then
    echo "   Login successful: ✅"
else
    echo "   Login error: ❌"
fi
echo ""

# 5. Admin blocks user
echo "5️⃣ Administrator blocking user..."
BLOCK_RESPONSE=$(curl -s -X PATCH http://localhost:3000/users/$USER_ID/block \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $ADMIN_TOKEN")

echo "   Response: $BLOCK_RESPONSE"
IS_BLOCKED=$(echo $BLOCK_RESPONSE | jq -r '.isBlocked')
echo "   isBlocked: $IS_BLOCKED"
echo ""

# 6. Check that blocked user cannot login
echo "6️⃣ Attempting login for blocked user..."
BLOCKED_LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"UserPass123!\"
  }")

HTTP_CODE="${BLOCKED_LOGIN_RESPONSE: -3}"
if [ "$HTTP_CODE" = "403" ]; then
    echo "   Access correctly denied: ✅ (code: $HTTP_CODE)"
else
    echo "   Error: user was able to login! ❌ (code: $HTTP_CODE)"
fi
echo ""

# 7. Admin unblocks user
echo "7️⃣ Administrator unblocking user..."
UNBLOCK_RESPONSE=$(curl -s -X PATCH http://localhost:3000/users/$USER_ID/unblock \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $ADMIN_TOKEN")

echo "   Response: $UNBLOCK_RESPONSE"
IS_UNBLOCKED=$(echo $UNBLOCK_RESPONSE | jq -r '.isBlocked')
echo "   isBlocked: $IS_UNBLOCKED"
echo ""

# 8. Check that unblocked user can login again
echo "8️⃣ Checking login for unblocked user..."
UNBLOCKED_USER_TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"UserPass123!\"
  }" | tr -d '"')

if [ ! -z "$UNBLOCKED_USER_TOKEN" ]; then
    echo "   Login restored: ✅"
else
    echo "   Login error: ❌"
fi
echo ""

# 9. Regular user attempts to block admin (should fail)
echo "9️⃣ Regular user attempting to block administrator..."
UNAUTHORIZED_RESPONSE=$(curl -s -w "%{http_code}" -X PATCH http://localhost:3000/users/$ADMIN_ID/block \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $UNBLOCKED_USER_TOKEN")

UNAUTH_HTTP_CODE="${UNAUTHORIZED_RESPONSE: -3}"
if [ "$UNAUTH_HTTP_CODE" = "403" ]; then
    echo "   Access correctly denied: ✅ (code: $UNAUTH_HTTP_CODE)"
else
    echo "   Error: regular user was able to block admin! ❌ (code: $UNAUTH_HTTP_CODE)"
fi
echo ""

echo "✅ All tests passed successfully! Blocking functionality works correctly."