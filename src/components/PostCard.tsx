'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PostCard({ post, onDelete, onRepost }: { post: any; onDelete?: (postId: string) => void; onRepost?: (repostPost: any) => void }) {
  const [optimistic, setOptimistic] = useState(post._count);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userLiked, setUserLiked] = useState(post.userLiked || false);
  const [userReposted, setUserReposted] = useState(post.userReposted || false);
  const { data: session } = useSession();
  const router = useRouter();

  // 當 post 的狀態變化時，同步更新內部狀態
  useEffect(() => {
    setOptimistic(post._count);
    setUserLiked(post.userLiked || false);
    setUserReposted(post.userReposted || false);
  }, [post._count, post.userLiked, post.userReposted]);

  const toggle = async (type: 'like' | 'repost') => {
    if (!session?.user) return; // 如果未登入，不執行操作

    // 檢查是否為自己的貼文且要repost
    if (type === 'repost' && isAuthor) {
      alert('無法轉發自己的貼文');
      return;
    }

    // 檢查是否為repost貼文
    if (type === 'repost' && post.isRepost) {
      alert('無法轉發已轉發的貼文');
      return;
    }

    // 檢查是否已經repost過
    if (type === 'repost' && userReposted) {
      alert('已經轉發過此貼文，請刪除轉發貼文來取消轉發');
      return;
    }

    const isLiked = type === 'like' ? userLiked : userReposted;
    const countKey = type === 'like' ? 'likes' : 'reposts';
    
    // 樂觀更新
    setOptimistic((o: any) => ({
      ...o,
      [countKey]: isLiked ? o[countKey] - 1 : o[countKey] + 1,
    }));
    
    if (type === 'like') {
      setUserLiked(!userLiked);
    } else {
      setUserReposted(!userReposted);
    }

    try {
      const res = await fetch(`/api/posts/${post.id}/${type}`, { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '操作失敗');
      }
      
      if (type === 'like') {
        setUserLiked(data.liked);
      } else {
        setUserReposted(data.reposted);
        // 如果是repost成功，通知父組件添加新的repost貼文
        if (data.reposted && data.repostPost && onRepost) {
          onRepost(data.repostPost);
        }
      }
    } catch (error) {
      console.error(`Error ${type}ing post:`, error);
      // 回滾樂觀更新
      setOptimistic((o: any) => ({
        ...o,
        [countKey]: isLiked ? o[countKey] + 1 : o[countKey] - 1,
      }));
      if (type === 'like') {
        setUserLiked(userLiked);
      } else {
        setUserReposted(userReposted);
      }
      
      // 顯示錯誤訊息
      alert(error instanceof Error ? error.message : '操作失敗');
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除這則貼文嗎？')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/delete`, { method: 'DELETE' });
      if (res.ok) {
        // 通知父組件刪除成功
        onDelete?.(post.id);
      } else {
        const error = await res.json();
        alert(`刪除失敗: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('刪除時發生錯誤');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReply = () => {
    router.push(`/post/${post.id}`);
  };

  const isAuthor = (session?.user as any)?.dbId === post.author?.id;
  
  // 調試信息
  console.log('PostCard Debug:', {
    sessionUserId: session?.user?.id,
    sessionDbId: (session?.user as any)?.dbId,
    postAuthorId: post.author?.id,
    isAuthor,
    sessionUser: session?.user,
    postAuthor: post.author
  });

  return (
    <article className="card">
      <div className="flex gap-3">
        <img src={post.author?.image ?? 'https://i.pravatar.cc/64'} alt="" className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{post.author?.name ?? 'Anon'}</span>
              <span className="text-muted text-sm">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                title="刪除貼文"
              >
                {isDeleting ? '刪除中...' : '🗑️'}
              </button>
            )}
          </div>
          <p className="whitespace-pre-wrap mt-1">{post.content}</p>
          {post.isRepost && post.originalPost && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src={post.originalPost.author?.image ?? 'https://i.pravatar.cc/32'} 
                  alt="" 
                  className="w-6 h-6 rounded-full" 
                />
                <span className="font-medium text-sm">{post.originalPost.author?.name ?? 'Anon'}</span>
                <span className="text-muted text-xs">{new Date(post.originalPost.createdAt).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">{post.originalPost.content}</p>
              <div className="mt-3 pt-2 border-t border-gray-200">
                <a 
                  href={`/post/${post.originalPost.id}`} 
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline inline-flex items-center gap-1"
                >
                  🔗 查看原貼文
                </a>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-2 text-sm text-muted">
            <button 
              className={`btn ${userLiked ? 'text-red-500' : ''}`} 
              onClick={() => toggle('like')}
              disabled={!session?.user}
            >
              {userLiked ? '❤️' : '♥'} {optimistic.likes}
            </button>
            <button 
              className={`btn ${userReposted ? 'text-green-500' : ''} ${isAuthor || userReposted || post.isRepost ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={() => toggle('repost')}
              disabled={!session?.user || isAuthor || userReposted || post.isRepost}
              title={
                isAuthor ? '無法轉發自己的貼文' : 
                post.isRepost ? '無法轉發已轉發的貼文' :
                userReposted ? '已轉發，請刪除轉發貼文來取消' : 
                '轉發'
              }
            >
              {userReposted ? '🔄' : '⟳'} {optimistic.reposts}
            </button>
            <button 
              className="btn" 
              onClick={handleReply}
            >
              💬 {optimistic.comments}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}