# CI/CD Pipeline Demo với GitHub Actions, Docker, Gitleaks và Trivy

## Giới thiệu

Project này minh họa một **CI/CD pipeline hoàn chỉnh theo mô hình DevSecOps** sử dụng:

* **GitHub Actions** để chạy pipeline
* **Gitleaks** để phát hiện secrets trong source code
* **Trivy** để scan dependency và container image
* **Docker** để build container
* **Telegram Bot** để gửi thông báo pipeline
* **Self-hosted Runner** để chạy pipeline trên server riêng

Pipeline sẽ chạy tự động khi:

```
git push origin main
```

Workflow nằm trong:

```
.github/workflows/cicd.yml
```

---

# Kiến trúc Pipeline

Pipeline được thiết kế giống sơ đồ:

```
Security Scan (Gitleaks)
        │
        ▼
Dependency Scan (Trivy) ── Build & Test
        │
        ▼
Docker Build & Push
        │
        ▼
Container Image Scan (Trivy)
        │
        ▼
Deploy Application
        │
        ▼
Success Notification (Telegram)
```

Chi tiết:

| Stage           | Công cụ          | Mục đích                 |
| --------------- | ---------------- | ------------------------ |
| Security Scan   | Gitleaks         | Detect hardcoded secrets |
| Dependency Scan | Trivy            | Scan thư viện dễ bị CVE  |
| Build & Test    | Node / Go / Java | Build application        |
| Docker Build    | Docker           | Build container          |
| Container Scan  | Trivy            | Scan lỗ hổng image       |
| Deploy          | SSH / Script     | Deploy server            |
| Notification    | Telegram         | Thông báo pipeline       |

---

# 1. Tạo Telegram Bot

Pipeline sẽ gửi thông báo qua Telegram.

## Bước 1: tạo bot

Mở Telegram và chat với:

```
@BotFather
```

Gửi lệnh:

```
/newbot
```

Sau đó BotFather sẽ yêu cầu:

```
Bot name
Bot username
```

Sau khi tạo xong bạn sẽ nhận được:

```
Bot Token
```

Ví dụ:

```
7981513078:AAFxxxxxxxxxxxxxxxx
```

Lưu token này lại.

---

# 2. Lấy Chat ID

Gửi một tin nhắn bất kỳ cho bot.

Sau đó mở:

```
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

Ví dụ:

```
https://api.telegram.org/bot7981513078:AAFxxx/getUpdates
```

Response sẽ chứa:

```json
"chat": {
  "id": 123456789,
  "type": "private"
}
```

Giá trị:

```
123456789
```

chính là **Chat ID**.

---

# 3. Tạo GitHub Repository

Tạo repo mới trên GitHub.

Clone repo về máy:

```bash
git clone https://github.com/your-username/cicd-demo.git
cd cicd-demo
```

Khởi tạo project:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git push origin main
```

---

# 4. Set GitHub Secrets

Pipeline cần Telegram credentials.

Vào:

```
Repository → Settings → Secrets and variables → Actions
```

Tạo 2 secrets:

```
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

Ví dụ:

```
TELEGRAM_BOT_TOKEN = 7981513078:AAFxxxx
TELEGRAM_CHAT_ID = 123456789
```

---

# 5. Tạo Self-Hosted Runner

Self-host runner giúp chạy pipeline trên server của bạn thay vì GitHub server.

Vào:

```
Repository
Settings
Actions
Runners
New self-hosted runner
```

Chọn hệ điều hành:

```
Linux / MacOS / Windows
```

Ví dụ với Linux:

Download runner:

```bash
mkdir actions-runner && cd actions-runner
curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/latest/download/actions-runner-linux-x64.tar.gz
tar xzf actions-runner.tar.gz
```

Config runner:

```bash
./config.sh --url https://github.com/your-username/cicd-demo --token YOUR_TOKEN
```

Start runner:

```bash
./run.sh
```

Runner sẽ online trong GitHub.

---

# 6. Cấu trúc Project

```
cicd-demo
│
├── .github
│   └── workflows
│       └── cicd.yml
│
├── app.js
├── package.json
├── Dockerfile
└── README.md
```

---

# 7. Workflow GitHub Actions

File:

```
.github/workflows/cicd.yml
```

Ví dụ:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:

  security-scan:
    runs-on: self-hosted

    steps:
      - uses: actions/checkout@v4

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2

  dependency-scan:
    runs-on: self-hosted
    needs: security-scan

    steps:
      - uses: actions/checkout@v4

      - name: Scan dependencies
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: fs
          severity: CRITICAL,HIGH

  build-test:
    runs-on: self-hosted
    needs: dependency-scan

    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

  docker-build:
    runs-on: self-hosted
    needs: build-test

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker Image
        run: docker build -t cicd-demo .

  container-scan:
    runs-on: self-hosted
    needs: docker-build

    steps:
      - name: Scan container image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: cicd-demo

  deploy:
    runs-on: self-hosted
    needs: container-scan

    steps:
      - name: Deploy application
        run: |
          docker stop cicd-demo || true
          docker rm cicd-demo || true
          docker run -d -p 3000:3000 --name cicd-demo cicd-demo

  notify:
    runs-on: self-hosted
    needs: deploy

    steps:
      - name: Send Telegram Notification
        run: |
          curl -s -X POST https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage \
          -d chat_id=${{ secrets.TELEGRAM_CHAT_ID }} \
          -d text="CI/CD Pipeline Success"
```

---

# 8. Dockerfile

Ví dụ:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
```

---

# 9. Trigger Pipeline

Sau khi setup xong.

Chỉ cần:

```bash
git add .
git commit -m "update"
git push origin main
```

GitHub Actions sẽ tự động chạy pipeline.

---

# 10. Kết quả Pipeline

Pipeline sẽ:

1. Scan secrets bằng **Gitleaks**
2. Scan dependencies bằng **Trivy**
3. Build và test ứng dụng
4. Build Docker image
5. Scan container image
6. Deploy container
7. Gửi notification Telegram

Nếu pipeline thành công bạn sẽ nhận được:

```
CI/CD Pipeline Success
```

trên Telegram.

---

# 11. Demo Scenario

## Success Case

```
git push
↓
Security Scan PASS
↓
Dependency Scan PASS
↓
Build PASS
↓
Docker Build PASS
↓
Image Scan PASS
↓
Deploy
↓
Telegram Success Message
```

## Failure Case

Ví dụ commit secret:

```
AWS_SECRET_KEY=xxxx
```

Gitleaks sẽ detect:

```
Secret detected
```

Pipeline sẽ:

```
Fail
Telegram alert
```

---

# 12. Best Practices

Một số best practices được áp dụng:

* Scan secrets trước khi build
* Scan dependencies để phát hiện CVE
* Scan container image
* Fail pipeline nếu có security issue
* Tách CI và CD stages
* Dùng Telegram để alert realtime
* Chạy pipeline trên self-hosted runner

---
