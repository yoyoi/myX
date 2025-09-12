import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import ErrorBoundary from '@/components/ErrorBoundary';

export default async function LoginPage() {
  const session = await auth();
  
  // 如果用戶已經登入，重定向到主頁
  if (session?.user) {
    redirect('/');
  }

  async function signOutAction() {
    'use server';
    await signOut();
  }

  return (
    <main className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Sign in</h2>
        {session?.user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted">Welcome, {session.user.name || session.user.email}!</p>
            <div className="space-y-2">
              <a href="/" className="btn w-full">Go to Home</a>
              <form action={signOutAction}>
                <button className="btn w-full" type="submit">Sign out</button>
              </form>
            </div>
          </div>
        ) : (
          <ErrorBoundary>
            <LoginForm />
          </ErrorBoundary>
        )}
      </div>
      {process.env.DEV_ALLOW_GUEST === 'true' && !session?.user && (
        <div className="card">
          <p className="text-sm text-muted mb-2">Dev only: continue as guest (no OAuth yet).</p>
          <a href="/" className="btn">Continue</a>
        </div>
      )}
    </main>
  );
}
