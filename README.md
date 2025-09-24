# Cards Server API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.1.0-blue.svg)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.16+-green.svg)](https://mongodb.com)
[![Jest](https://img.shields.io/badge/Jest-29.7-red.svg)](https://jestjs.io)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

Modern Node.js / Express server for managing business cards with user system, JWT authentication, role model, and full compatibility with React frontend.

## 🚀 Features

### 👥 User Management
- **Registration and authentication** with JWT tokens
- **Role system**: Regular, Business, Admin users
- **Automatic assignment of the first user** as administrator
- **Blocking system** after failed login attempts (3 attempts → 24 hours block)
- **Administrative functions** for user management

### 🎯 Business Cards
- **CRUD operations** for business cards
- **Unique 7-digit numbers** (bizNumber) with autogeneration
- **Like system** with atomic toggle mechanism
- **Card blocking** by administrators
- **Search and filter** cards

### 🔒 Security
- **JWT tokens** with configurable expiration time
- **CORS protection** with flexible domain settings
- **Data validation** using Joi
- **Centralized error handling**
- **Logging** of all requests and errors

### 🏗 Architecture
- **Modular structure** by domains (users, cards, auth)
- **Middleware system** for authentication and authorization
- **Unified API response format**
- **Comprehensive testing** (unit + integration)
- **Health-check endpoint** for monitoring

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Installation & Setup](#installation--setup)
3. [Environment Variables](#environment-variables)
4. [API Documentation](#api-documentation)
5. [Project Architecture](#project-architecture)
6. [Testing](#testing)
7. [Frontend Compatibility](#frontend-compatibility)
8. [Deployment](#deployment)

## 🏃‍♂️ Quick Start

```bash
# Clone repository
git clone https://github.com/boris2024-spec/cards-server-Boris.git
cd cards-server-Boris

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start MongoDB (if local)
mongod

# Start in development mode
npm run dev

# Check health
curl http://localhost:3000/health
```

## ⚙️ Installation & Setup

### System Requirements
- **Node.js**: 18.0.0 or higher
- **MongoDB**: 5.0 or higher
- **npm**: 8.0 or higher

### Пошаговая установка

1. **Установка зависимостей**
   ```bash
   npm install
   ```

2. **Настройка MongoDB**
   ```bash
   # Локальная установка (Ubuntu/Debian)
   sudo apt install mongodb-server
   
   # Или через Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. **Создание переменных окружения**
   ```bash
   cp .env.example .env
   # Отредактируйте .env файл согласно вашим настройкам
   ```

4. **Запуск сервера**
   ```bash
   # Режим разработки с hot-reload
   npm run dev
   
   # Продакшн режим
   npm start
   ```

## 🔧 Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Основные настройки сервера
PORT=3000
NODE_ENV=development

# База данных MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/cards_app

# JWT настройки
JWT_SECRET=your_super_secret_jwt_key_change_me_in_production
JWT_EXPIRES=1h

# Административные настройки
ADMIN_REG_CODE=your_admin_registration_code

# Настройки бизнес-номеров
BIZNUM_MAX_RETRIES=5

# CORS настройки (разделитель: запятая)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5500,http://localhost:3001

# Логирование
LOG_LEVEL=info
```

### Описание переменных

| Переменная | Описание | По умолчанию | Обязательная |
|------------|----------|--------------|--------------|
| `PORT` | Порт сервера | `3000` | Нет |
| `MONGODB_URI` | Строка подключения к MongoDB | `mongodb://127.0.0.1:27017/cards_app` | Да |
| `JWT_SECRET` | Секретный ключ для JWT | - | Да |
| `JWT_EXPIRES` | Время жизни JWT токена | `1h` | Нет |
| `ADMIN_REG_CODE` | Код для регистрации администраторов | - | Нет |
| `CORS_ORIGINS` | Разрешенные домены для CORS | `localhost:5173,127.0.0.1:5500` | Нет |

## 📚 API документация

### Формат ответов

Все API ответы следуют единому формату:

**Успешный ответ:**
```json
{
  "status": "success",
  "data": {
    // результат операции
  }
}
```

**Ошибка:**
```json
{
  "status": "error",
  "error": {
    "message": "Описание ошибки",
    "details": [
      {
        "path": "field_name",
        "message": "Подробное описание ошибки поля"
      }
    ]
  }
}
```

### 🔐 Аутентификация

Сервер поддерживает два способа передачи JWT токена:

**Рекомендуемый способ (Bearer Token):**
```javascript
fetch('/api/cards', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Обратная совместимость:**
```javascript
fetch('/api/cards', {
  headers: {
    'x-auth-token': token
  }
});
```

### 👥 Users API

#### POST /users - Регистрация пользователя
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "name": {
      "first": "John",
      "middle": "M",
      "last": "Doe"
    },
    "phone": "050-123-4567",
    "image": {
      "url": "https://example.com/avatar.jpg",
      "alt": "User avatar"
    },
    "address": {
      "state": "IL",
      "country": "Israel",
      "city": "Tel Aviv",
      "street": "Herzl",
      "houseNumber": 123,
      "zip": 12345
    },
    "isBusiness": true,
    "adminCode": "optional_admin_code"
  }'
```

#### POST /users/login - Вход в систему
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

#### GET /users - Получить всех пользователей (Admin only)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### GET /users/:id - Получить пользователя по ID
```bash
curl -X GET http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PUT /users/:id - Обновить пользователя
```bash
curl -X PUT http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": {
      "first": "Updated",
      "last": "Name"
    }
  }'
```

#### DELETE /users/:id - Удалить пользователя
```bash
curl -X DELETE http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /users/:id/block - Заблокировать пользователя (Admin only)
```bash
curl -X PATCH http://localhost:3000/users/USER_ID/block \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /users/:id/unblock - Разблокировать пользователя (Admin only)
```bash
curl -X PATCH http://localhost:3000/users/USER_ID/unblock \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /users/reset-login-attempts - Сбросить попытки входа (Admin only)
```bash
curl -X PATCH http://localhost:3000/users/reset-login-attempts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### 🎯 Cards API

#### GET /cards - Получить все карточки
```bash
curl -X GET http://localhost:3000/cards
```

#### GET /cards/my-cards - Получить карточки текущего пользователя
```bash
curl -X GET http://localhost:3000/cards/my-cards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### GET /cards/:id - Получить карточку по ID
```bash
curl -X GET http://localhost:3000/cards/CARD_ID
```

#### POST /cards - Создать карточку (Business user only)
```bash
curl -X POST http://localhost:3000/cards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Business",
    "subtitle": "Professional Services",
    "description": "We provide excellent services",
    "phone": "050-123-4567",
    "email": "business@example.com",
    "web": "https://mybusiness.com",
    "image": {
      "url": "https://example.com/business.jpg",
      "alt": "Business logo"
    },
    "address": {
      "state": "IL",
      "country": "Israel",
      "city": "Tel Aviv",
      "street": "Business St",
      "houseNumber": 456,
      "zip": 54321
    }
  }'
```

#### PUT /cards/:id - Обновить карточку
```bash
curl -X PUT http://localhost:3000/cards/CARD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Business Name"
  }'
```

#### DELETE /cards/:id - Удалить карточку
```bash
curl -X DELETE http://localhost:3000/cards/CARD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /cards/:id/like - Лайкнуть/дизлайкнуть карточку
```bash
curl -X PATCH http://localhost:3000/cards/CARD_ID/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /cards/:id/bizNumber - Изменить бизнес-номер карточки
```bash
curl -X PATCH http://localhost:3000/cards/CARD_ID/bizNumber \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /cards/:id/block - Заблокировать карточку (Admin only)
```bash
curl -X PATCH http://localhost:3000/cards/CARD_ID/block \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /cards/:id/unblock - Разблокировать карточку (Admin only)
```bash
curl -X PATCH http://localhost:3000/cards/CARD_ID/unblock \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🔍 Служебные эндпоинты

#### GET /health - Проверка состояния сервера
```bash
curl -X GET http://localhost:3000/health
```

Ответ:
```json
{
  "status": "ok",
  "uptime": 123.45,
  "db": "connected"
}
```

#### GET /ping - Простая проверка доступности
```bash
curl -X GET http://localhost:3000/ping
```

Ответ: `pong`

## 🏗 Архитектура проекта

### Структура директорий

```
cards-server-Boris/
├── 📁 auth/                    # Система аутентификации
│   ├── providers/
│   │   └── jwtProvider.js      # JWT утилиты
│   └── services/
│       └── authService.js      # Middleware аутентификации
├── 📁 cards/                   # Модуль карточек
│   ├── middlewares/
│   │   └── cardPermissions.js  # Проверка прав доступа
│   ├── models/
│   │   └── Card.js             # Mongoose модель карточки
│   ├── routes/
│   │   └── cardsController.js  # Роуты карточек
│   ├── services/
│   │   ├── bizNumberService.js # Генерация бизнес-номеров
│   │   ├── cardsDataService.js # Работа с БД
│   │   ├── cardsService.js     # Бизнес-логика
│   │   └── dtoService.js       # DTO преобразования
│   └── validation/
│       ├── cardValidationSchema.js    # Joi схемы
│       └── cardValidationService.js   # Валидация сервис
├── 📁 users/                   # Модуль пользователей
│   ├── helpers/
│   │   └── bcrypt.js           # Хеширование паролей
│   ├── models/
│   │   ├── LoginAttempt.js     # Модель попыток входа
│   │   └── User.js             # Mongoose модель пользователя
│   ├── routes/
│   │   └── usersController.js  # Роуты пользователей
│   ├── services/
│   │   ├── loginAttemptService.js    # Система блокировки
│   │   ├── usersDataService.js       # Работа с БД
│   │   └── usersService.js           # Бизнес-логика
│   └── validation/
│       └── userValidationSchema.js   # Joi схемы
├── 📁 middlewares/             # Общие middleware
│   ├── errorHandler.js         # Централизованная обработка ошибок
│   ├── logger.js               # Логирование запросов
│   └── response.js             # Унификация ответов
├── 📁 helpers/                 # Вспомогательные утилиты
│   ├── mongooseValidators.js   # Mongoose валидаторы
│   └── submodels/              # Подмодели
│       ├── Address.js          # Схема адреса
│       ├── Image.js            # Схема изображения
│       └── Name.js             # Схема имени
├── 📁 tests/                   # Тесты
│   ├── app.ping.test.js        # Тест ping эндпоинта
│   ├── auth.header.test.js     # Тест аутентификации
│   ├── card.blocking.test.js   # Тест блокировки карточек
│   ├── card.validation.messages.test.js  # Тест валидации
│   ├── health.test.js          # Тест health эндпоинта
│   ├── integration.flow.test.js          # Интеграционные тесты
│   └── user.blocking.test.js   # Тест блокировки пользователей
├── 📁 config/                  # Конфигурация
├── 📁 DB/                      # Работа с базой данных
├── 📁 logs/                    # Логи приложения
├── 📁 public/                  # Статические файлы
└── 📁 router/                  # Основной роутер
```

### Принципы архитектуры

1. **Модульность**: Каждый домен (users, cards, auth) изолирован
2. **Layered Architecture**: Controller → Service → DataService → Model
3. **Middleware система**: Переиспользуемые компоненты для авторизации, логирования, ошибок
4. **Валидация**: Двойная валидация (Joi + Mongoose)
5. **Error Handling**: Централизованная обработка с детальными сообщениями

### Ролевая модель

| Роль | Описание | Возможности |
|------|----------|-------------|
| **Regular User** | Обычный пользователь | Просмотр карточек, лайки |
| **Business User** | Бизнес пользователь | + Создание/редактирование своих карточек |
| **Admin** | Администратор | + Управление всеми пользователями и карточками |

### Модели данных

#### User Schema
```javascript
{
  _id: ObjectId,
  email: String,               // unique, валидация email
  password: String,            // bcrypt хеш
  name: {
    first: String,             // обязательное
    middle: String,            // опциональное
    last: String               // обязательное
  },
  phone: String,               // валидация телефона
  image: {
    url: String,               // URL изображения
    alt: String                // alt текст
  },
  address: {
    state: String,
    country: String,           // обязательное
    city: String,              // обязательное
    street: String,            // обязательное
    houseNumber: Number,       // обязательное
    zip: Number                // опциональное
  },
  isAdmin: Boolean,            // по умолчанию false
  isBusiness: Boolean,         // по умолчанию false
  isBlocked: Boolean,          // по умолчанию false
  createdAt: Date              // автоматически
}
```

#### Card Schema
```javascript
{
  _id: ObjectId,
  title: String,               // обязательное
  subtitle: String,            // обязательное
  description: String,         // обязательное, до 1024 символов
  phone: String,               // валидация телефона
  email: String,               // валидация email
  web: String,                 // валидация URL
  image: {
    url: String,               // URL изображения
    alt: String                // alt текст
  },
  address: {                   // как в User
    state: String,
    country: String,
    city: String,
    street: String,
    houseNumber: Number,
    zip: Number
  },
  bizNumber: Number,           // уникальный 7-значный номер
  likes: [String],             // массив ID пользователей
  isBlocked: Boolean,          // по умолчанию false
  createdAt: Date,             // автоматически
  user_id: String              // ID владельца карточки
}
```

#### LoginAttempt Schema
```javascript
{
  email: String,               // email пользователя
  attempts: Number,            // количество попыток
  blockedUntil: Date,          // время окончания блокировки
  lastAttempt: Date            // время последней попытки
}
```

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# Отдельные тесты
npm test -- --testPathPattern=user.blocking
npm test -- --testPathPattern=integration.flow
npm test -- --testPathPattern=card.validation

# С покрытием кода
npm test -- --coverage

# В watch режиме
npm test -- --watch
```

### Структура тестов

1. **Unit тесты**: Тестирование отдельных модулей
   - `card.validation.messages.test.js` - валидация карточек
   - `auth.header.test.js` - аутентификация

2. **Integration тесты**: Полные сценарии
   - `integration.flow.test.js` - полный пользовательский путь
   - `user.blocking.test.js` - система блокировки
   - `card.blocking.test.js` - блокировка карточек

3. **API тесты**: Проверка эндпоинтов
   - `app.ping.test.js` - базовая доступность
   - `health.test.js` - health check

### Тестовые сценарии

#### Интеграционный тест (integration.flow.test.js)
1. Регистрация пользователя
2. Вход в систему и получение JWT
3. Создание бизнес-карточки
4. Лайк карточки
5. Повторный лайк (отмена)
6. Проверка финального состояния

#### Тест блокировки пользователей (user.blocking.test.js)
1. 3 неудачные попытки входа
2. Автоматическая блокировка на 24 часа
3. Проверка сообщений об ошибках
4. Административный сброс блокировки

### Демо скрипты

```bash
# Windows PowerShell демо блокировки пользователей
.\demo_user_blocking.ps1

# Unix/Linux демо блокировки пользователей
./demo_user_blocking.sh
```

## 🌐 Совместимость с фронтендом

### React Frontend Compatibility

Сервер на 100% совместим с React фронтендом:
- **Репозиторий**: https://github.com/boris2024-spec/cards-proj-Boris-main-main
- **Технологии**: React 19.1.0, MUI 7.1.0, Vite 6, Axios

### API совместимость

✅ **Полная совместимость всех эндпоинтов:**
- Users API: регистрация, логин, CRUD операции
- Cards API: создание, редактирование, лайки
- Admin API: блокировка пользователей и карточек

✅ **Идентичные структуры данных:**
- User и Card модели полностью соответствуют
- Одинаковые правила валидации (Joi)
- Совпадающие форматы ответов

✅ **Аутентификация:**
- JWT токены работают идентично
- Поддержка обоих форматов заголовков
- Ролевая модель синхронизирована

### CORS настройки для фронтенда

```env
# Для разработки
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5500

# Для продакшена
CORS_ORIGINS=https://your-frontend-domain.com,https://app.example.com
```

### Настройка фронтенда

В фронтенд проекте создайте `.env.local`:
```env
VITE_API_BASE=http://localhost:3000
# Или для продакшена:
# VITE_API_BASE=https://your-backend-domain.com
```

## 🔒 Система безопасности

### JWT токены
- **Алгоритм**: HS256
- **Полезная нагрузка**: `{ _id, isBusiness, isAdmin }`
- **Время жизни**: Настраивается через `JWT_EXPIRES`
- **Секрет**: Обязательно изменить `JWT_SECRET` в продакшене

### Система блокировки входа
- **Лимит попыток**: 3 неудачные попытки
- **Время блокировки**: 24 часа
- **Сброс**: Автоматический через TTL или административный
- **Мониторинг**: Логирование всех попыток

### Валидация данных
- **Frontend валидация**: Joi схемы
- **Backend валидация**: Mongoose + Joi
- **Санитизация**: Автоматическое удаление лишних полей
- **Безопасные пароли**: bcrypt с salt

### CORS защита
- **Настраиваемые домены**: Через переменные окружения
- **Credentials**: Поддержка авторизационных заголовков
- **Методы**: Полная поддержка REST API

## 📊 Мониторинг и логирование

### Health Check
```bash
curl http://localhost:3000/health
```

Ответ включает:
- Статус сервера
- Время работы (uptime)
- Состояние подключения к БД
- HTTP статус 200 (OK) или 503 (Service Unavailable)

### Логирование

**Morgan middleware** для HTTP запросов:
```
GET /cards 200 45ms - 1.2kb
POST /users/login 401 12ms - 0.5kb
```

**Приложение логи** в директории `logs/`:
- `app.log` - текущие логи
- `app-YYYY-MM-DD.log` - архивные логи по дням

**Уровни логирования**:
- `info` - обычные операции
- `warn` - предупреждения
- `error` - ошибки приложения
- `debug` - отладочная информация

### Метрики для мониторинга

Рекомендуемые метрики для продакшена:
- Response time per endpoint
- Error rate (4xx, 5xx)
- Database connection status
- JWT token validation errors
- Failed login attempts
- Active user sessions

## 🚀 Развертывание

### Локальная разработка

1. **Настройка MongoDB**:
   ```bash
   # Docker вариант
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Или локальная установка
   brew install mongodb-community    # macOS
   sudo apt install mongodb-server   # Ubuntu
   ```

2. **Запуск в dev режиме**:
   ```bash
   npm run dev
   ```

3. **Проверка**:
   ```bash
   curl http://localhost:3000/health
   ```

### Продакшн развертывание

#### Docker развертывание

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  cards-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/cards_app
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    
  mongo:
    image: mongo:5
    volumes:
      - mongo_data:/data/db
    
volumes:
  mongo_data:
```

**Запуск:**
```bash
docker-compose up -d
```

#### Heroku развертывание

```bash
# Создание приложения
heroku create your-cards-server

# Добавление MongoDB (MongoAtlas addon)
heroku addons:create mongolab:sandbox

# Настройка переменных
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set ADMIN_REG_CODE=your_admin_code
heroku config:set CORS_ORIGINS=https://your-frontend.herokuapp.com

# Деплой
git push heroku main
```

#### VPS/Cloud развертывание

```bash
# PM2 для управления процессами
npm install -g pm2

# Создание ecosystem файла
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cards-server',
    script: 'server.js',
    instances: 'max',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Запуск в продакшене
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Переменные окружения для продакшена

```env
# Продакшн настройки
NODE_ENV=production
PORT=3000

# Безопасность
JWT_SECRET=your_very_long_and_secure_jwt_secret_here
ADMIN_REG_CODE=super_secure_admin_registration_code

# База данных (MongoDB Atlas рекомендуется)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cards_app

# CORS для продакшена
CORS_ORIGINS=https://your-frontend.com,https://app.your-domain.com

# Опциональные настройки
LOG_LEVEL=warn
BIZNUM_MAX_RETRIES=10
```

## 🛠 Дополнительные утилиты

### Очистка базы данных
```bash
node clear_db.js
```

### Заполнение тестовыми данными
```bash
node seed.js
```

### Скрипты для тестирования

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "powershell -Command \"$env:NODE_ENV='test'; node --experimental-vm-modules ./node_modules/jest/bin/jest.js --detectOpenHandles\"",
    "test:watch": "npm test -- --watch",
    "test:coverage": "npm test -- --coverage",
    "lint": "eslint .",
    "seed": "node seed.js",
    "clear-db": "node clear_db.js"
  }
}
```

## 📋 TODO / Дальнейшее развитие

### Краткосрочные улучшения
- [ ] **Refresh токены** для автоматического обновления JWT
- [ ] **Email change endpoint** - отдельный эндпоинт для смены email
- [ ] **Swagger/OpenAPI** документация
- [ ] **Rate limiting** для всех эндпоинтов
- [ ] **Soft delete** вместо жесткого удаления записей

### Среднесрочные цели
- [ ] **Redis** интеграция для кэширования и сессий
- [ ] **Email уведомления** при блокировке/регистрации
- [ ] **Image upload** поддержка для аватаров и карточек
- [ ] **Search API** для поиска карточек
- [ ] **Pagination** для больших списков

### Долгосрочные планы
- [ ] **Microservices** архитектура
- [ ] **GraphQL** API в дополнение к REST
- [ ] **Real-time** уведомления через WebSocket
- [ ] **Analytics** и метрики использования
- [ ] **API versioning** для обратной совместимости

### Безопасность
- [ ] **2FA** двухфакторная аутентификация
- [ ] **OAuth** интеграция (Google, Facebook)
- [ ] **IP-based blocking** в дополнение к email блокировке
- [ ] **CAPTCHA** интеграция после множественных неудач
- [ ] **Security headers** (Helmet.js расширенная настройка)

### DevOps
- [ ] **CI/CD pipeline** (GitHub Actions)
- [ ] **Automated testing** в CI
- [ ] **Code quality** проверки (SonarQube)
- [ ] **Performance monitoring** (New Relic, DataDog)
- [ ] **Automated backups** для MongoDB

## 🤝 Вклад в проект

### Как внести вклад

1. **Fork** репозитория
2. Создайте **feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit** изменения: `git commit -m 'Add amazing feature'`
4. **Push** в branch: `git push origin feature/amazing-feature`
5. Откройте **Pull Request**

### Стандарты кода

- **ESLint** конфигурация в `eslint.config.js`
- **Conventional Commits** для сообщений коммитов
- **Jest** для всех новых функций
- **JSDoc** комментарии для публичных API

### Тестирование перед PR

```bash
# Запуск всех тестов
npm test

# Проверка линтера
npm run lint

# Проверка типов (если используется TypeScript)
npm run type-check
```

## 📄 Лицензия

Этот проект лицензирован под [ISC License](LICENSE).

## 👥 Авторы и благодарности

- **Boris** - Основной разработчик
- **Команда курса Full Stack** - Менторство и поддержка

### Благодарности
- **Express.js** команде за отличный фреймворк
- **MongoDB** за надежную базу данных
- **Jest** за качественное тестирование
- **Joi** за мощную валидацию

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. **GitHub Issues**: [Создать issue](https://github.com/boris2024-spec/cards-server-Boris/issues)
2. **Email**: boris2024.spec@example.com
3. **Документация**: Читайте этот README и код комментарии

### Часто задаваемые вопросы (FAQ)

**Q: Как сбросить пароль пользователя?**
A: В текущей версии только через базу данных. Планируется добавить endpoint для сброса пароля.

**Q: Можно ли изменить количество попыток входа?**
A: Да, измените константу `MAX_ATTEMPTS` в `loginAttemptService.js`.

**Q: Как добавить новые поля в карточку?**
A: Обновите схему в `Card.js`, добавьте валидацию в `cardValidationSchema.js` и тесты.

**Q: Поддерживается ли кластерный режим?**
A: Да, сервер stateless и может работать в кластере с внешней MongoDB.

---

**🎯 Cards Server API - Профессиональное решение для управления бизнес-карточками**

*Создано с ❤️ для сообщества разработчиков*
