'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

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
    
    try {
      const result = await signIn(provider, {
        callbackUrl: '/',
        redirect: true
      });
      
      if (result?.error) {
        console.error('Sign in error:', result.error);
        setIsLoading(null);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted mb-2">
        請選擇登入方式：
      </div>
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
        如果登入失敗，請檢查瀏覽器控制台的錯誤訊息
      </div>
    </div>
  );
}