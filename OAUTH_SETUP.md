# OAuth 設定說明

## 問題解決

您遇到的 "server error" 是因為缺少 OAuth 環境變數設定。我已經為您建立了 `.env.local` 檔案，但您需要設定實際的 OAuth 憑證。

## 設定步驟

### 1. GitHub OAuth 設定

1. 前往 [GitHub Developer Settings](https://github.com/settings/applications/new)
2. 點擊 "New OAuth App"
3. 填寫以下資訊：
   - **Application name**: mini-x-autogen (或您喜歡的名稱)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 點擊 "Register application"
5. 複製 **Client ID** 和 **Client Secret**

### 2. Google OAuth 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 選擇或建立一個專案
3. 點擊 "Create Credentials" > "OAuth 2.0 Client IDs"
4. 選擇 "Web application"
5. 填寫以下資訊：
   - **Name**: mini-x-autogen (或您喜歡的名稱)
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
6. 點擊 "Create"
7. 複製 **Client ID** 和 **Client Secret**

### 3. 更新環境變數

編輯 `.env.local` 檔案，將以下值替換為您的實際憑證：

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# 替換為您的 GitHub 憑證
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# 替換為您的 Google 憑證
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 資料庫設定
DATABASE_URL="file:./dev.db"

# 開發模式設定
DEV_ALLOW_GUEST=true
```

### 4. 重新啟動應用程式

```bash
npm run dev
```

## 測試

1. 前往 `http://localhost:3000/login`
2. 您應該會看到可用的登入選項
3. 如果 OAuth 憑證未設定，會顯示相應的錯誤訊息

## 故障排除

- 如果仍然出現錯誤，請檢查瀏覽器控制台的錯誤訊息
- 確保所有環境變數都已正確設定
- 確保 OAuth 應用程式的回調 URL 設定正確
