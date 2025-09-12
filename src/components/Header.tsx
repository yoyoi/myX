'use client';

import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="flex items-center justify-between">
      <a href="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
        mini‑X
      </a>
      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img 
                src={session.user?.image ?? 'https://i.pravatar.cc/32'} 
                alt="用戶頭像" 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium">{session.user?.name ?? '用戶'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="btn text-sm"
            >
              登出
            </button>
          </div>
        ) : (
          <a className="btn" href="/login">
            登入
          </a>
        )}
      </div>
    </header>
  );
}
