# TECHNOVA — Docker Compose + VPS + GitHub Actions

Tài liệu này áp dụng cho source TECHNOVA hiện tại: Node.js/Express phục vụ cả API và frontend HTML/CSS/JS; MongoDB/Mongoose; backend ở `backend/`, frontend ở `frontend/`.

## 0. Quan trọng về cấu trúc GitHub hiện tại

Trong repository `DoNgocHoangHuy/Technova`, log gần nhất cho thấy dự án nằm trong thư mục `technova/` ở gốc repository. Các file trong gói này là nội dung **bên trong thư mục `technova/`**. Để workflow chạy tự động, các file như `Dockerfile`, `docker-compose.yml`, `.env.example`, `.dockerignore`, `deploy/` và `.github/` phải nằm cùng cấp với `backend/` và `frontend/`.

Kết quả trong repository hiện tại nên là:

```text
Technova/                 # GitHub repository root
└── technova/              # project root
    ├── .github/workflows/ci-cd.yml
    ├── backend/
    ├── frontend/
    ├── deploy/nginx/default.conf
    ├── Dockerfile
    ├── docker-compose.yml
    ├── .dockerignore
    ├── .env.example
    └── DEPLOY-GUIDE-VI.md
```

Vì GitHub Actions chỉ tự phát hiện workflow ở `<repository-root>/.github/workflows/`, nếu giữ nguyên thư mục lồng `technova/`, workflow sẽ **không tự chạy**. Cách gọn nhất là đưa nội dung dự án bên trong `technova/` lên gốc repository. Hãy backup hoặc tạo branch trước; không xóa thư mục cũ thủ công trước khi kiểm tra bản commit mới.

## 1. Cấu hình secrets

Tạo các secrets trong GitHub: Settings → Secrets and variables → Actions → New repository secret.

- `DOCKERHUB_USERNAME`: username Docker Hub.
- `DOCKERHUB_TOKEN`: access token Docker Hub (không dùng password tài khoản nếu có thể).
- `VPS_HOST`: IP hoặc hostname VPS.
- `VPS_USER`: user deploy không phải root, ví dụ user Ubuntu bạn tạo.
- `VPS_SSH_KEY`: private SSH key dùng riêng cho GitHub Actions.
- `VPS_PORT`: SSH port, thường `22` (optional).

Không commit private key, token, `.env`, mật khẩu hoặc URI database vào Git.

## 2. Chuẩn bị VPS Ubuntu

Tạo VPS Ubuntu 22.04/24.04 theo yêu cầu lớp. Đăng nhập bằng user quản trị, cài Docker Engine và Docker Compose plugin theo tài liệu chính thức Docker cho Ubuntu. Tạo user deploy, cấp quyền Docker và đăng xuất/đăng nhập lại để group được cập nhật.

Trên VPS, tạo thư mục triển khai:

```bash
mkdir -p ~/technova/deploy/nginx
cd ~/technova
```

Copy `docker-compose.yml`, `.env` và `deploy/nginx/default.conf` vào thư mục này. Có thể copy file compose/nginx qua SSH/SCP từ máy local; không commit `.env`.

## 3. Tạo `.env` trên VPS

Tạo `~/technova/.env` với giá trị thật, an toàn:

```dotenv
DOCKERHUB_USERNAME=your-dockerhub-username
IMAGE_TAG=latest
NODE_ENV=production
PORT=5000
JWT_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://YOUR_VPS_IP_OR_DOMAIN
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=REPLACE_WITH_STRONG_UNIQUE_PASSWORD
MONGO_ROOT_USER=technova_root
MONGO_ROOT_PASSWORD=REPLACE_WITH_ANOTHER_LONG_RANDOM_PASSWORD
```

```bash
chmod 600 ~/technova/.env
```

Compose cung cấp `MONGO_URI` cho app để kết nối service `mongo`. Không dùng `127.0.0.1` cho MongoDB từ trong container app. Cổng MongoDB không được publish ra internet.

## 4. Chạy lần đầu

Đăng nhập Docker Hub trên VPS nếu image private:

```bash
docker login -u YOUR_DOCKERHUB_USERNAME
```

Tạm thời build từ source tại máy local hoặc chạy workflow publish sau khi cấu hình GitHub secrets. Khi image đã được push lên Docker Hub, trên VPS:

```bash
cd ~/technova
docker compose pull app
docker compose up -d --no-build
docker compose ps
docker compose logs --tail=100 app
```

Mở port 22 và 80 trong firewall/security firewall của nhà cung cấp VPS. Không mở port 27017 ra internet. Sau đó kiểm tra:

- `http://YOUR_VPS_IP/`
- `http://YOUR_VPS_IP/login`
- `http://YOUR_VPS_IP/admin`
- `http://YOUR_VPS_IP/health`

## 5. Tạo SSH key riêng cho GitHub Actions

Đăng nhập VPS bằng user deploy (không phải root):

```bash
ssh-keygen -t ed25519 -C "github-actions-technova" -f ~/.ssh/technova_actions
cat ~/.ssh/technova_actions.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/technova_actions
chmod 644 ~/.ssh/technova_actions.pub
```

Đưa **nội dung private key** `~/.ssh/technova_actions` vào secret `VPS_SSH_KEY`; không đưa file `.pub` vào secret. Thêm public key vào `authorized_keys` như trên.

## 6. CI/CD workflow

Workflow `.github/workflows/ci-cd.yml`:

- Pull request vào `main`: kiểm tra cú pháp JS và build thử Docker image.
- Push vào `main`: chạy CI; nếu pass thì build image, push `latest` và tag commit SHA lên Docker Hub; SSH vào VPS, pull image và recreate service.

Workflow giả định `docker-compose.yml`, `.env`, và `deploy/nginx/default.conf` đã có sẵn trong `~/technova` trên VPS. Workflow không gửi `.env` từ GitHub và không chạy seed tự động.

## 7. Seed và chuyển dữ liệu — KHÔNG chạy tự động

Compose mới dùng MongoDB container với named volume `technova_mongo_data`. Volume này là database riêng, không tự lấy dữ liệu từ MongoDB Windows local. Để giữ dữ liệu hiện có, hãy backup bằng `mongodump`, chuyển dump đến VPS và restore vào MongoDB Compose trước khi chuyển traffic. Đừng chạy `npm run seed` nếu chưa xác định database đích; script có thể tạo admin, categories và products mẫu.

## 8. Backup/rollback

Backup database thường xuyên bằng `mongodump` trong container hoặc theo quy trình quản trị MongoDB. Giữ backup ngoài volume VPS. Để rollback, đổi `IMAGE_TAG` trong `.env` thành commit SHA cũ đã push lên Docker Hub rồi chạy:

```bash
docker compose pull app
docker compose up -d --no-build app
```

Không chạy `docker compose down -v`: lệnh này xóa named volumes và có thể làm mất database/uploads.

## 9. HTTPS

Cấu hình hiện tại phục vụ HTTP port 80 để kiểm tra ban đầu. Khi có domain, cấu hình HTTPS/TLS theo tài liệu Nginx/Let's Encrypt hoặc reverse proxy TLS của lớp trước khi dùng dữ liệu/tài khoản thật.
