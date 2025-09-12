import { auth } from '@/lib/auth';
import Composer from '@/components/Composer';
import Feed from '@/components/Feed';
import SearchBar from '@/components/SearchBar';

export default async function HomePage() {
  const session = await auth();
  return (
    <main className="space-y-4">
      <SearchBar />
      {session?.user ? (
        <div className="space-y-4">
          <div className="card border-l-4 border-blue-500 p-8">
            <div className="flex gap-5">
              <img 
                src={session.user.image ?? 'https://i.pravatar.cc/80'} 
                alt="用戶頭像" 
                className="w-20 h-20 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-5">
                  <span className="font-medium text-3xl">
                    Welcome back, {session.user.name || session.user.email} !
                  </span>
                </div>
                <p className="text-xl text-muted mt-4">
                  準備好分享你的想法了嗎？
                </p>
              </div>
            </div>
          </div>
          <Composer />
        </div>
      ) : (
        <div className="card border-l-4 border-green-500 p-8">
          <div className="flex gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">👋</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-5">
                <span className="font-medium text-3xl">
                  歡迎來到 Mini X！
                </span>
              </div>
              <p className="text-xl text-muted mt-4">
                瀏覽貼文，登入後即可發布和互動
              </p>
              <div className="mt-4">
                <a href="/login" className="btn">
                  立即登入
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      <Feed />
    </main>
  );
}
