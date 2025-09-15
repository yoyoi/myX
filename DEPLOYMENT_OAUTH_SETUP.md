# 部署環境 OAuth 設定指南

## 問題診斷

部署後 OAuth 無法登入的常見原因：

1. **環境變數未設定**：Vercel 或其他部署平台缺少 OAuth 憑證
2. **回調 URL 不匹配**：OAuth 應用程式設定為 localhost 而非生產域名
3. **NextAuth 配置問題**：生產環境的 NEXTAUTH_URL 設定錯誤

## 解決步驟

### 1. 設定 OAuth 應用程式

#### GitHub OAuth 設定
1. 前往 [GitHub Developer Settings](https://github.com/settings/applications/new)
2. 點擊 "New OAuth App"
3. 填寫以下資訊：
   - **Application name**: mini-x-autogen (或您喜歡的名稱)
   - **Homepage URL**: `https://your-domain.vercel.app` (替換為您的實際域名)
   - **Authorization callback URL**: `https://your-domain.vercel.app/api/auth/callback/github`
4. 點擊 "Register application"
5. 複製 **Client ID** 和 **Client Secret**

#### Google OAuth 設定
1. 前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 選擇或建立一個專案
3. 點擊 "Create Credentials" > "OAuth 2.0 Client IDs"
4. 選擇 "Web application"
5. 填寫以下資訊：
   - **Name**: mini-x-autogen (或您喜歡的名稱)
   - **Authorized JavaScript origins**: `https://your-domain.vercel.app`
   - **Authorized redirect URIs**: `https://your-domain.vercel.app/api/auth/callback/google`
6. 點擊 "Create"
7. 複製 **Client ID** 和 **Client Secret**

### 2. 設定 Vercel 環境變數

在 Vercel Dashboard 中設定以下環境變數：

```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 資料庫設定
DATABASE_URL=your-production-database-url
```

### 3. 生成 NEXTAUTH_SECRET

使用以下命令生成安全的 secret：

```bash
openssl rand -base64 32
```

### 4. 檢查 NextAuth 配置

確保 `src/lib/auth.ts` 中的配置適合生產環境：

```typescript
export const authConfig: NextAuthConfig = {
  // ... 其他配置
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // 生產環境關閉 debug
  // ... 其他配置
};
```

## 故障排除

### 檢查清單
- [ ] OAuth 應用程式的回調 URL 是否正確設定為生產域名
- [ ] Vercel 環境變數是否正確設定
- [ ] NEXTAUTH_URL 是否設定為正確的生產域名
- [ ] NEXTAUTH_SECRET 是否已設定且足夠安全
- [ ] 資料庫連接是否正常

### 常見錯誤

1. **"Invalid redirect_uri"**：回調 URL 不匹配
2. **"Invalid client"**：Client ID 或 Secret 錯誤
3. **"Configuration error"**：缺少必要的環境變數

### 除錯方法

1. 檢查 Vercel 函數日誌
2. 在瀏覽器開發者工具中查看網路請求
3. 暫時啟用 debug 模式查看詳細錯誤

## 測試

1. 部署後前往 `https://your-domain.vercel.app/login`
2. 嘗試使用 GitHub 或 Google 登入
3. 檢查是否成功重定向到主頁

## 注意事項

- 確保 OAuth 應用程式的域名設定與實際部署域名完全一致
- 生產環境不要使用 localhost 的 OAuth 設定
- 定期更新 OAuth 憑證以確保安全性
