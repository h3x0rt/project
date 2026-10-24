# Юг Белора Металл

Веб-приложение для компании **«Юг Белора Металл»** (Белореченск): интернет-магазин металлопроката и строительных материалов, аренда оборудования, личный кабинет клиента и админ-панель.

## Возможности

- Каталог товаров с категориями и карточками
- Корзина и оформление заказа (только для авторизованных пользователей)
- Аренда оборудования
- Регистрация / вход, личный кабинет с историей и статусами заказов
- Админ-панель: заказы, заявки на аренду, CRUD товаров и оборудования (с загрузкой фото)
- Контактная форма

## Стек технологий

| Слой | Технологии |
|------|------------|
| Frontend | React 19, Vite 8, React Router 7, Axios |
| Backend | Node.js, Express 4, JWT, bcrypt, Multer, Helmet, CORS |
| База данных | PostgreSQL 16 (`pg`) |
| Инфраструктура | Docker Compose (только PostgreSQL) |

Структура репозитория:

```
yug-belora-metall/
├── frontend/          # React-приложение (порт 3000)
├── backend/           # Express API (порт 5000)
├── database/          # schema.sql
└── docker-compose.yml # PostgreSQL
```

## Требования

- [Node.js](https://nodejs.org/) 18+ (рекомендуется LTS)
- npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (для PostgreSQL)  
  либо локально установленный PostgreSQL 16

## Установка на рабочее место

### 1. Клонировать репозиторий

```bash
git clone <url-репозитория>
cd yug-belora-metall
```

### 2. Запустить базу данных

Из корня проекта:

```bash
docker compose up -d
```

Поднимется PostgreSQL на порту `5432`. При первом запуске автоматически применится `database/schema.sql` (таблицы, категории, примеры товаров, пользователь-админ).

Параметры по умолчанию из `docker-compose.yml`:

| Параметр | Значение |
|----------|----------|
| Хост | `localhost` |
| Порт | `5432` |
| БД | `yug_belora` |
| Пользователь | `postgres` |
| Пароль | `postgres` |

### 3. Настроить backend

```bash
cd backend
cp .env.example .env   # если файла нет — создайте .env вручную
npm install
```

Пример содержимого `backend/.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=yug_belora
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=7d

ADMIN_PASSWORD=admin123
```

> Если пароль PostgreSQL другой — укажите его в `DB_PASSWORD`.

При необходимости пересоздать/обновить админа:

```bash
node scripts/createAdmin.js
```

### 4. Настроить frontend

```bash
cd ../frontend
cp .env.example .env
npm install
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

В режиме разработки Vite также проксирует `/api` и `/uploads` на backend (`frontend/vite.config.js`), поэтому можно оставить `VITE_API_URL=/api`.

### 5. Запустить проект

В двух терминалах:

```bash
# терминал 1 — API
cd backend
npm run dev
```

```bash
# терминал 2 — клиент
cd frontend
npm run dev
```

Открыть в браузере: [http://localhost:3000](http://localhost:3000)

Проверка API: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Учётные данные по умолчанию

После инициализации схемы в БД есть админ (пароль может потребовать обновления через `createAdmin.js`):

| Поле | Значение |
|------|----------|
| Email | `admin@yugbelora.ru` |
| Пароль | `admin123` (см. комментарий в `schema.sql` / скрипт createAdmin) |

Админ-панель: [http://localhost:3000/admin](http://localhost:3000/admin)

## Полезные команды

```bash
# Backend
cd backend
npm run dev      # разработка (nodemon)
npm start        # production

# Frontend
cd frontend
npm run dev      # разработка
npm run build    # сборка
npm run preview  # просмотр сборки

# База данных
docker compose up -d
docker compose down
```

## Кратко по ролям

- **Гость** — каталог, аренда (просмотр), контакты; для корзины нужен вход
- **Клиент** — корзина, заказы, личный кабинет (`/profile`)
- **Админ** — управление заказами, арендой, товарами и оборудованием (`/admin`)
