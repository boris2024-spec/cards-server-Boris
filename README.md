## Cards Server API

Node.js / Express сервис для управления бизнес-карточками (пользователи, аутентификация JWT, карточки, лайки).

### Возможности
- Регистрация / логин пользователей (JWT, exp).
- Первый пользователь автоматически становится админом.
- Бизнес‑пользователь может создавать / обновлять / удалять свои карточки.
- Админ может управлять любыми карточками и пользователями.
- Уникальный 7‑значный `bizNumber` с повторными попытками.
- Лайки карточек (атомарный toggle).
- Валидация (Joi) для Users и Cards.
- Централизованный обработчик ошибок и единый JSON формат ответа.
- Health‑check `/health` (статус БД и ping).

### Технологии
Express 5, Mongoose 8, Joi, JSON Web Token, Helmet, Rate Limit, Jest + Supertest.

### Переменные окружения (.env)
```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/cards_app
JWT_SECRET=change_me
JWT_EXPIRES=1h
ADMIN_REG_CODE=your_admin_registration_code
BIZNUM_MAX_RETRIES=5
```

### Скрипты
`npm run dev` – запуск с nodemon
`npm start` – прод режим
`npm test` – тесты (unit + integration)

### Структура ответов
Успех: `{ "data": ... }`
Ошибка: `{ "error": { "message": "...", "details": [ { path, message } ] } }`

### Основные эндпоинты
`POST /users` – регистрация
`POST /users/login` – логин (rate limited)
`GET /cards` – список карточек
`POST /cards` – создать (business user)
`PATCH /cards/:id/like` – toggle like
`PATCH /cards/:id/bizNumber` – сменить бизнес номер (владелец / админ)
`GET /health` – состояние сервиса

### Тестирование
Интеграционный сценарий: регистрация -> логин -> создание карточки -> двойной лайк toggle.

### TODO / Дальнейшие улучшения
- Перенос email change в отдельный endpoint.
- Refresh токены.
- Soft delete вместо жёсткого удаления.
- OpenAPI (Swagger) документация.

### License
ISC
