'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CommentCard({ 
  comment, 
  onDelete 
}: { 
  comment: any; 
  onDelete?: (commentId: string) => void 
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(comment._count?.likes || 0);
  const [userLiked, setUserLiked] = useState(comment.userLiked || false);
  const { data: session } = useSession();

  const handleLike = async () => {
    if (!session?.user) return; // 如果未登入，不執行操作

    const isLiked = userLiked;
    
    // 樂觀更新
    setOptimisticLikes((prev: number) => isLiked ? prev - 1 : prev + 1);
    setUserLiked(!userLiked);

    try {
      const res = await fetch(`/api/comments/${comment.id}/like`, { method: 'POST' });
      const data = await res.json();
      
      setUserLiked(data.liked);
    } catch (error) {
      console.error('Error liking comment:', error);
      // 回滾樂觀更新
      setOptimisticLikes((prev: number) => isLiked ? prev + 1 : prev - 1);
      setUserLiked(userLiked);
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除這則回覆嗎？')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/delete`, { method: 'DELETE' });
      if (res.ok) {
        // 通知父組件刪除成功
        onDelete?.(comment.id);
      } else {
        const error = await res.json();
        alert(`刪除失敗: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      alert('刪除時發生錯誤');
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = (session?.user as any)?.dbId === comment.author?.id;

  return (
    <div className="card">
      <div className="flex gap-3">
        <img 
          src={comment.author?.image ?? 'https://i.pravatar.cc/64'} 
          alt="" 
          className="w-8 h-8 rounded-full" 
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.author?.name ?? 'Anon'}</span>
              <span className="text-muted text-xs">{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className={`text-xs px-2 py-1 rounded ${userLiked ? 'text-red-500' : 'text-muted'}`} 
                onClick={handleLike}
                disabled={!session?.user}
                title={userLiked ? '取消讚' : '讚'}
              >
                {userLiked ? '❤️' : '♥'} {optimisticLikes}
              </button>
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                  title="刪除回覆"
                >
                  {isDeleting ? '刪除中...' : '🗑️'}
                </button>
              )}
            </div>
          </div>
          <div className="mt-1 whitespace-pre-wrap text-sm">{comment.content}</div>
        </div>
      </div>
    </div>
  );
}
