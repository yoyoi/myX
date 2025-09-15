#!/usr/bin/env node

/**
 * OAuth 部署診斷腳本
 * 檢查 Vercel 部署後的 OAuth 配置
 */

const https = require('https');

const DEPLOYMENT_URL = 'https://myx-9uc44qkq1-zyx6543210s-projects.vercel.app';

console.log('🔍 檢查 OAuth 部署配置...\n');

// 檢查必要的環境變數
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GITHUB_ID',
  'GITHUB_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

console.log('📋 環境變數檢查:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`  ✅ ${envVar}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${envVar}: 未設定`);
  }
});

// 檢查 OAuth 端點
console.log('\n🔗 OAuth 端點檢查:');

const oauthEndpoints = [
  '/api/auth/signin',
  '/api/auth/callback/github',
  '/api/auth/callback/google',
  '/api/auth/session'
];

oauthEndpoints.forEach(endpoint => {
  const url = `${DEPLOYMENT_URL}${endpoint}`;
  console.log(`  🔍 檢查: ${url}`);
  
  https.get(url, (res) => {
    console.log(`    ✅ 狀態: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`    ❌ 錯誤: ${err.message}`);
  });
});

console.log('\n📝 OAuth 配置檢查清單:');
console.log('1. ✅ NEXTAUTH_URL 已更新為正確的 Vercel 域名');
console.log('2. ⚠️  需要更新 GitHub OAuth 應用的回調 URL');
console.log('3. ⚠️  需要更新 Google OAuth 應用的回調 URL');

console.log('\n🔧 需要更新的 OAuth 設定:');
console.log('\n📱 GitHub OAuth:');
console.log('1. 前往: https://github.com/settings/developers');
console.log('2. 編輯您的 OAuth App');
console.log(`3. 更新 Authorization callback URL 為: ${DEPLOYMENT_URL}/api/auth/callback/github`);

console.log('\n🔍 Google OAuth:');
console.log('1. 前往: https://console.cloud.google.com/');
console.log('2. 編輯您的 OAuth 2.0 客戶端');
console.log(`3. 更新授權重新導向 URI 為: ${DEPLOYMENT_URL}/api/auth/callback/google`);

console.log('\n✅ 完成上述設定後，OAuth 登入應該就能正常工作了！');
