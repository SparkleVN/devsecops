# Telegram Bot CI/CD Notification Setup

Tài liệu này hướng dẫn chi tiết cách:

1. Tạo Telegram bot bằng **@BotFather**
2. Lấy **CHAT_ID**
3. Tạo GitHub repository
4. Lưu **BOT_TOKEN** và **CHAT_ID** vào GitHub Secrets
5. Tạo **Self-hosted GitHub Runner**
6. Dùng `git push` để kích hoạt pipeline `.github/workflows/cicd.yml`

---

# 1. Tạo Telegram Bot

Mở Telegram và tìm:

```
@BotFather
```

Gõ:

```
/start
```

Sau đó tạo bot mới:

```
/newbot
```

BotFather sẽ yêu cầu:

### Bot name

Ví dụ:

```
My CI Bot
```

### Bot username

Phải kết thúc bằng `bot`

Ví dụ:

```
my_ci_pipeline_bot
```

Sau khi tạo thành công BotFather sẽ trả về token:

```
Use this token to access the HTTP API:

123456789:AAExxxxxxxxxxxxxxxxxxxxx
```

Lưu lại giá trị này:

```
BOT_TOKEN=123456789:AAExxxxxxxxxxxxxxxxxxxxx
```

---

# 2. Lấy CHAT_ID

### Bước 1

Nhắn tin vào bot vừa tạo.

Ví dụ:

```
hello
```

---

### Bước 2

Mở trình duyệt:

```
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

Ví dụ:

```
https://api.telegram.org/bot123456789:AAExxxxx/getUpdates
```

Kết quả:

```json
{
 "ok": true,
 "result": [
  {
   "message": {
    "chat": {
     "id": 123456789,
     "first_name": "User"
    }
   }
  }
 ]
}
```

Giá trị cần lấy:

```
chat.id
```

Ví dụ:

```
CHAT_ID=123456789
```

---

# 3. Tạo GitHub Repository

Tạo repo mới trên GitHub.

Ví dụ:

```
telegram-cicd-bot
```

Clone repo:

```bash
git clone https://github.com/username/telegram-cicd-bot.git
cd telegram-cicd-bot
```

---

# 4. Lưu BOT_TOKEN và CHAT_ID vào GitHub Secrets

Vào repository:

```
Settings
```

→

```
Secrets and variables
```

→

```
Actions
```

→

```
New repository secret
```

Tạo 2 secrets:

### TELEGRAM_BOT_TOKEN

```
TELEGRAM_BOT_TOKEN=123456789:AAExxxxxxxxxxxxxxxxxxxxx
```

### TELEGRAM_CHAT_ID

```
TELEGRAM_BOT_TOKEN=123456789
```

---

# 5. Tạo GitHub Self-Hosted Runner

Vào:

```
Settings → Actions → Runners
```

Chọn:

```
New self-hosted runner
```

Chọn hệ điều hành phù hợp (Linux / macOS / Windows).

Ví dụ Linux, chạy bằng ubuntu cài sẵn trên máy (mật khẩu sudo su của ubuntu là 1):

### Download runner

```bash
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64.tar.gz -L https://github.com/actions/runner/releases/latest/download/actions-runner-linux-x64.tar.gz
tar xzf ./actions-runner-linux-x64.tar.gz
```

### Configure runner

```bash
./config.sh --url https://github.com/username/repo-name --token YOUR_RUNNER_TOKEN
```

### Start runner

```bash
./run.sh
```

Runner sẽ chờ job từ GitHub Actions.

---

# 6. Tạo CI/CD Workflow

Tạo thư mục:

```
.github/workflows/ (nơi chứa file cicd của nền tảng github-action)
```

Tạo file:

```
.github/workflows/cicd.yml
```

Đây là file bắt buộc phải có trong quá trình CICD nhằm khai báo quy trình (học kĩ cicd.yml)

Ví dụ workflow gửi message Telegram khi có push:

```yaml
name: CI Pipeline

on:
  push:
    branches:
      - main

jobs:
  notify:
    runs-on: self-hosted

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Send Telegram Notification
        run: |
          curl -s -X POST "https://api.telegram.org/bot${{ secrets.BOT_TOKEN }}/sendMessage" \
          -d chat_id=${{ secrets.CHAT_ID }} \
          -d text="New commit pushed to repository!"
```

---

# 7. Kích hoạt CI/CD bằng Git Push

Sau khi tạo workflow, commit code:

```bash
git add .
git commit -m "setup cicd"
git push origin main
Yêu cầu nhập username: SparkleVN
Yêu cầu nhập password: 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
```

Khi push thành công:

1. GitHub Actions sẽ trigger workflow
2. Self-hosted runner nhận job
3. Runner gửi message đến Telegram bot

Bot sẽ nhận message:

```
New commit pushed to repository!
```

---

# Kết quả

Pipeline hoạt động theo flow:

```
git push
     ↓
GitHub Actions trigger
     ↓
Self-hosted runner execute
     ↓
Telegram Bot gửi notification
```