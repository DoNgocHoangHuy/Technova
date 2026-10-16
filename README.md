# TECHNOVA — Frontend + Backend

TECHNOVA is a full-stack project with a separated code structure:

- `frontend/`: HTML/CSS/JavaScript UI
- `backend/`: Node.js + Express REST API + MongoDB

For local development, Express serves the frontend directly, so you do **not** need VS Code Live Server.

## 1. Requirements

- Node.js 18+
- MongoDB Community Server running locally
- MongoDB service available on `127.0.0.1:27017`

## 2. First-time setup

Open Windows CMD:

```cmd
cd /d E:\technova\technova\backend
npm install
copy .env.example .env
npm run seed
```

The seed creates the default admin:

- Email: `admin@technova.com`
- Password: `admin123`

## 3. Run the application

Start MongoDB first, then run:

```cmd
cd /d E:\technova\technova\backend
npm run dev
```

Express serves both the REST API and the frontend.

Open:

- Storefront: `http://localhost:5000/`
- Admin: `http://localhost:5000/admin`
- Admin HTML: `http://localhost:5000/admin`
- API health: `http://localhost:5000/health`
- API: `http://localhost:5000/api`

In development, the server also attempts to open `http://localhost:5000` automatically after startup.

To disable automatic browser opening:

```cmd
set OPEN_BROWSER=false
npm run dev
```

## 4. Architecture

```text
                    Browser
                       |
                       | http://localhost:5000
                       v
              +-------------------+
              | Express :5000     |
              |                   |
              | Frontend files    |
              | REST API /api     |
              +---------+---------+
                        |
                        v
                 MongoDB :27017
```

The frontend calls `/api/...` using same-origin requests and sends the HTTP-only JWT cookie with `credentials: include`.

The project does not use the old frontend mock database (`mockApi.js`, `data.json`). `localStorage` is used only for the shopping cart.

## 5. Production / DevOps direction

The application remains logically separated into frontend, backend, and database so it can later be containerized with Docker and orchestrated with Docker Compose, followed by CI/CD.


## Authentication
- Customer và admin dùng chung một trang đăng nhập: `http://localhost:5000/login`.
- Sau khi đăng nhập, customer vào storefront; admin được chuyển tự động tới `/admin`.
- Không có trang đăng nhập admin riêng.


## Docker / VPS / CI-CD

See [`DEPLOY-GUIDE-VI.md`](DEPLOY-GUIDE-VI.md) for the Docker Compose + VPS + GitHub Actions deployment path.
