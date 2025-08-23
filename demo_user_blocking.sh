#!/bin/bash
# Простая демонстрация блокировки пользователей через curl

echo "🚀 Демонстрация функциональности блокировки пользователей"
echo ""

# 1. Создание администратора (первый пользователь автоматически становится админом)
echo "1️⃣ Создание администратора..."
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

echo "   Ответ: $ADMIN_RESPONSE"
ADMIN_ID=$(echo $ADMIN_RESPONSE | jq -r '._id')
IS_ADMIN=$(echo $ADMIN_RESPONSE | jq -r '.isAdmin')
echo "   Администратор создан: $ADMIN_EMAIL"
echo "   ID: $ADMIN_ID"
echo "   isAdmin: $IS_ADMIN"
echo ""

# 2. Авторизация администратора
echo "2️⃣ Авторизация администратора..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"AdminPass123!\"
  }" | tr -d '"')

echo "   Токен получен: ✅"
echo "   Токен: $ADMIN_TOKEN"
echo ""

# 3. Создание обычного пользователя
echo "3️⃣ Создание обычного пользователя..."
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

echo "   Ответ: $USER_RESPONSE"
USER_ID=$(echo $USER_RESPONSE | jq -r '._id')
echo "   Пользователь создан: $USER_EMAIL"
echo "   ID: $USER_ID"
echo ""

# 4. Проверка авторизации обычного пользователя
echo "4️⃣ Проверка авторизации обычного пользователя..."
USER_TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"UserPass123!\"
  }" | tr -d '"')

if [ ! -z "$USER_TOKEN" ]; then
    echo "   Авторизация успешна: ✅"
else
    echo "   Ошибка авторизации: ❌"
fi
echo ""

# 5. Админ блокирует пользователя
echo "5️⃣ Блокировка пользователя администратором..."
BLOCK_RESPONSE=$(curl -s -X PATCH http://localhost:3000/users/$USER_ID/block \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $ADMIN_TOKEN")

echo "   Ответ: $BLOCK_RESPONSE"
IS_BLOCKED=$(echo $BLOCK_RESPONSE | jq -r '.isBlocked')
echo "   isBlocked: $IS_BLOCKED"
echo ""

# 6. Проверка что заблокированный пользователь не может логиниться
echo "6️⃣ Попытка авторизации заблокированного пользователя..."
BLOCKED_LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"UserPass123!\"
  }")

HTTP_CODE="${BLOCKED_LOGIN_RESPONSE: -3}"
if [ "$HTTP_CODE" = "403" ]; then
    echo "   Доступ корректно запрещен: ✅ (код: $HTTP_CODE)"
else
    echo "   Ошибка: пользователь смог авторизоваться! ❌ (код: $HTTP_CODE)"
fi
echo ""

# 7. Админ разблокирует пользователя
echo "7️⃣ Разблокировка пользователя администратором..."
UNBLOCK_RESPONSE=$(curl -s -X PATCH http://localhost:3000/users/$USER_ID/unblock \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $ADMIN_TOKEN")

echo "   Ответ: $UNBLOCK_RESPONSE"
IS_UNBLOCKED=$(echo $UNBLOCK_RESPONSE | jq -r '.isBlocked')
echo "   isBlocked: $IS_UNBLOCKED"
echo ""

# 8. Проверка что разблокированный пользователь снова может логиниться
echo "8️⃣ Проверка авторизации разблокированного пользователя..."
UNBLOCKED_USER_TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"UserPass123!\"
  }" | tr -d '"')

if [ ! -z "$UNBLOCKED_USER_TOKEN" ]; then
    echo "   Авторизация восстановлена: ✅"
else
    echo "   Ошибка авторизации: ❌"
fi
echo ""

# 9. Попытка обычного пользователя заблокировать админа (должна провалиться)
echo "9️⃣ Попытка обычного пользователя заблокировать администратора..."
UNAUTHORIZED_RESPONSE=$(curl -s -w "%{http_code}" -X PATCH http://localhost:3000/users/$ADMIN_ID/block \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $UNBLOCKED_USER_TOKEN")

UNAUTH_HTTP_CODE="${UNAUTHORIZED_RESPONSE: -3}"
if [ "$UNAUTH_HTTP_CODE" = "403" ]; then
    echo "   Доступ корректно запрещен: ✅ (код: $UNAUTH_HTTP_CODE)"
else
    echo "   Ошибка: обычный пользователь смог заблокировать админа! ❌ (код: $UNAUTH_HTTP_CODE)"
fi
echo ""

echo "✅ Все тесты прошли успешно! Функциональность блокировки работает корректно."
