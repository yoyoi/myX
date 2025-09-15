# myX - 社群網站

一個類似 X/Twitter 的社群網站，使用現代化的技術棧構建：

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **認證**: NextAuth.js (GitHub + Google OAuth)
- **資料庫**: Prisma + SQLite (開發環境)
- **即時功能**: Pusher (新貼文、按讚、轉發、評論)
- **代碼品質**: ESLint + Prettier
- **部署**: 支援 Vercel/Cloudflare Pages

## 🚀 快速開始

### 1. 克隆專案
```bash
git clone <your-repo-url>
cd myX
```

### 2. 安裝依賴
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 環境變數設定
```bash
cp .env.local.example .env.local
```

然後編輯 `.env.local` 檔案，填入以下變數：

```env
# NextAuth 設定
NEXTAUTH_URL=https://myx-9uc44qkq1-zyx6543210s-projects.vercel.app
NEXTAUTH_SECRET=guLSRK3NdH1BFPYYpPgBioPgd4JWYly/IyfHXGcNY1E=

# GitHub OAuth (可選)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Google OAuth (可選)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 開發模式 (允許訪客模式)
DEV_ALLOW_GUEST=true
```

**生成 NEXTAUTH_SECRET**：
```bash
openssl rand -base64 32
```

### 4. 資料庫設定
```bash
# 生成 Prisma Client
npx prisma generate

# 執行資料庫遷移
npx prisma db push
```

### 5. 啟動開發伺服器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打開瀏覽器訪問 http://localhost:3000

## 📱 功能特色

- ✅ **用戶認證**: GitHub 和 Google OAuth 登入
- ✅ **貼文系統**: 發布、查看、搜尋貼文
- ✅ **互動功能**: 按讚、轉發、評論
- ✅ **即時更新**: 新貼文和互動即時顯示
- ✅ **響應式設計**: 支援手機和桌面設備
- ✅ **訪客模式**: 未登入用戶也可以瀏覽貼文

## 🔧 開發指令

```bash
# 開發模式
npm run dev

# 建構專案
npm run build

# 啟動生產模式
npm start

# 代碼檢查
npm run lint

# 代碼格式化
npm run format

# 資料庫管理
npx prisma studio
```

## 📁 專案結構

```
myX/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   ├── login/          # 登入頁面
│   │   └── page.tsx        # 首頁
│   ├── components/         # React 組件
│   ├── lib/               # 工具函數
│   └── styles/            # 樣式檔案
├── prisma/                # 資料庫 schema
├── public/               # 靜態資源
└── autogen/             # AutoGen 腳本
```

## 🔧 OAuth 問題診斷

如果部署後 OAuth 無法登入，請執行以下診斷：

```bash
# 檢查環境變數設定
npm run check-oauth

# 或指定您的域名
npm run check-oauth your-domain.vercel.app
```

### 常見問題解決

1. **環境變數未設定**：確保在 Vercel Dashboard 中設定了所有必要的環境變數
2. **回調 URL 不匹配**：確保 OAuth 應用程式的回調 URL 設定為您的部署域名
3. **NEXTAUTH_URL 錯誤**：確保設定為正確的生產域名

詳細設定指南請參考：[DEPLOYMENT_OAUTH_SETUP.md](./DEPLOYMENT_OAUTH_SETUP.md)

## 🚀 部署

### Vercel + Neon + Pusher 部署

#### 1. 準備環境變數
複製 `env.example` 檔案並填入您的環境變數：

```bash
cp env.example .env.local
```

#### 2. 設定 Neon 資料庫
1. 前往 [Neon Console](https://console.neon.tech/)
2. 創建新的 PostgreSQL 資料庫
3. 複製連接字串，格式如下：
   ```
   postgresql://username:password@hostname:port/database?sslmode=require
   ```
4. 將連接字串設定為 `DATABASE_URL` 環境變數

#### 3. 設定 Pusher
1. 前往 [Pusher Dashboard](https://dashboard.pusher.com/)
2. 創建新的應用程式
3. 複製以下資訊：
   - App ID
   - Key
   - Secret
   - Cluster
4. 設定對應的環境變數

#### 4. 設定 GitHub OAuth
1. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
2. 創建新的 OAuth App
3. 設定 Authorization callback URL: `https://your-domain.vercel.app/api/auth/callback/github`
4. 複製 Client ID 和 Client Secret

#### 5. 部署到 Vercel
1. 將專案推送到 GitHub：
   ```bash
   git add .
   git commit -m "準備部署配置"
   git push origin main
   ```

2. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
3. 點擊 "New Project"
4. 選擇您的 GitHub 倉庫
5. 在環境變數設定中填入所有必要的變數：
   - `NEXTAUTH_URL`: `https://your-domain.vercel.app`
   - `NEXTAUTH_SECRET`: 使用 `openssl rand -base64 32` 生成
   - `DATABASE_URL`: 您的 Neon 資料庫連接字串
   - `GITHUB_ID` 和 `GITHUB_SECRET`: GitHub OAuth 設定
   - `PUSHER_*`: Pusher 設定
   - `DEV_ALLOW_GUEST`: `false` (生產環境)

6. 點擊 "Deploy"

#### 6. 執行資料庫遷移
部署完成後，在 Vercel 的函數中執行資料庫遷移：

```bash
# 在 Vercel 的函數中執行
npx prisma db push
```

### 其他平台
- **Netlify**: 使用 Next.js 適配器
- **Railway**: 支援 Node.js 和資料庫
- **Heroku**: 需要建構腳本

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## Features

- **Login page + Home page** (NextAuth GitHub, dev guest fallback)
- **Posts: view, search, post**
- **Realtime interactions** (Pusher: post create/like/repost/comment updates)
- **Performance**: client cache via React Query; API responses paginate; minimal bundle

## Deploy

- **Vercel**: set env vars, add a managed Postgres (Neon/Vercel Postgres), set `DATABASE_URL`, `NEXTAUTH_URL`.
- **Cloudflare**: use a managed Postgres (Neon), deploy with `next-on-pages` or adapters.

## Code Quality

- `pnpm lint` (eslint + next rules) ; `pnpm format` (prettier)

## AutoGen

See `autogen/mini_x_team.py`. Provide your API keys in `autogen/config.json`, then:
```bash
cd autogen
python mini_x_team.py
```
This spins up an **Architect** and **Coder** agent to plan/refine features (e.g., add image upload, improve search, add optimistic UI), editing files in-place and running `pnpm lint` where needed.

> Tip: Lock their output to *src/components* or *app/api* when you want targeted changes.
# myX
# myX
# myX
