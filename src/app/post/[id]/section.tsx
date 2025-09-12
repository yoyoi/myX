'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/PostCard';
import CommentCard from '@/components/CommentCard';
import { getPusherClient, CHANNEL, EVENTS } from '@/lib/pusher';

export default function Comments({ post }: { post: any }) {
  const [comments, setComments] = useState<any[]>([]);
  const [txt, setTxt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    console.log('Loading comments for post:', post.id);
    const res = await fetch(`/api/posts/${post.id}/comments`, { cache: 'no-store' });
    const data = await res.json();
    console.log('Comments loaded:', data.comments);
    setComments(data.comments);
  }, [post.id]);

  const handleDeletePost = useCallback((postId: string) => {
    // 如果刪除的是當前post，重定向到首頁
    if (postId === post.id) {
      router.push('/');
    }
  }, [post.id, router]);

  const handleDeleteComment = useCallback((commentId: string) => {
    setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
  }, []);

  useEffect(() => {
    load();
    
    // 暫時禁用 Pusher 功能，避免空配置導致的問題
    // TODO: 配置 Pusher 後重新啟用
    /*
    const p = getPusherClient();
    const ch = p.subscribe(CHANNEL);
    
    const onNew = (payload: any) => {
      if (payload.postId === post.id) load();
    };
    
    ch.bind(EVENTS.COMMENT_NEW, onNew);
    
    return () => {
      ch.unbind_all(); 
      p.unsubscribe(CHANNEL); 
      p.disconnect();
    };
    */
  }, [load, post.id]);

  const submit = async () => {
    if (!txt.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: txt.trim() }),
      });
      
      if (res.ok) {
        setTxt('');
        load(); // 重新載入評論
      } else {
        const error = await res.json();
        console.error('Reply Failed:', error);
        alert(`Reply Error: ${error.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('Reply Error:', error);
      alert(`回覆時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="space-y-3">
      <PostCard post={post} onDelete={handleDeletePost} />
      <div className="card space-y-2">
        <textarea
          className="input min-h-[60px]"
          placeholder="Write a reply…"
          maxLength={280}
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
        />
        <div className="flex justify-end">
          <button 
            className="btn" 
            onClick={submit}
            disabled={isSubmitting || !txt.trim()}
          >
            {isSubmitting ? '回覆中...' : 'Reply'}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {comments.map((c) => (
          <CommentCard key={c.id} comment={c} onDelete={handleDeleteComment} />
        ))}
        {!comments.length && <div className="card text-muted">No replies yet.</div>}
      </div>
    </main>
  );
}