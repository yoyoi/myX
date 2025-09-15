'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 如果載入狀態超過 10 秒，自動重置
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleSignIn = async (provider: string) => {
    if (isLoading) return; // 防止重複點擊
    
    console.log(`嘗試使用 ${provider} 登入...`);
    setIsLoading(provider);
    setError(null);
    
    try {
      const result = await signIn(provider, {
        callbackUrl: '/',
        redirect: false // 先不自動重定向，以便處理錯誤
      });
      
      if (result?.error) {
        console.error('Sign in error:', result.error);
        setError(`登入失敗：${result.error}`);
        setIsLoading(null);
      } else if (result?.ok) {
        // 登入成功，手動重定向
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('登入過程中發生錯誤，請稍後再試');
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted mb-2">
        請選擇登入方式：
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      
      <button 
        className="btn w-full" 
        onClick={() => handleSignIn('github')}
        disabled={isLoading === 'github'}
      >
        {isLoading === 'github' ? '登入中...' : 'Continue with GitHub'}
      </button>
      <button 
        className="btn w-full" 
        onClick={() => handleSignIn('google')}
        disabled={isLoading === 'google'}
      >
        {isLoading === 'google' ? '登入中...' : 'Continue with Google'}
      </button>
      
      <div className="text-xs text-muted mt-2">
        如果登入失敗，請檢查：
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>OAuth 應用程式的回調 URL 是否設定正確</li>
          <li>環境變數是否已正確配置</li>
          <li>瀏覽器控制台的錯誤訊息</li>
        </ul>
      </div>
    </div>
  );
}