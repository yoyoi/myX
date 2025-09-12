'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import PostCard from './PostCard';
import { getPusherClient, CHANNEL, EVENTS } from '@/lib/pusher';

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const fetchPosts = useCallback(async () => {
    try {
      const searchQuery = query ? `&q=${encodeURIComponent(query)}` : '';
      const res = await fetch(`/api/posts?take=20${searchQuery}`, { cache: 'no-store' });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  }, [query]);

  const handleDeletePost = useCallback((postId: string) => {
    setPosts(prevPosts => {
      // 找到被刪除的貼文
      const deletedPost = prevPosts.find(post => post.id === postId);
      
      // 如果被刪除的是 repost 貼文，需要更新原始貼文的 userReposted 狀態
      if (deletedPost && deletedPost.isRepost && deletedPost.originalPost) {
        return prevPosts.map(post => {
          // 如果是原始貼文，重置其 userReposted 狀態
          if (post.id === deletedPost.originalPost.id) {
            return {
              ...post,
              userReposted: false,
              _count: {
                ...post._count,
                reposts: Math.max(0, post._count.reposts - 1)
              }
            };
          }
          // 其他貼文保持不變，但移除被刪除的 repost 貼文
          return post;
        }).filter(post => post.id !== postId);
      }
      
      // 如果不是 repost 貼文，直接移除
      return prevPosts.filter(post => post.id !== postId);
    });
  }, []);

  const handleRepost = useCallback((repostPost: any) => {
    // 將新的repost貼文添加到列表頂部
    setPosts(prevPosts => [repostPost, ...prevPosts]);
  }, []);

  // 初始載入和搜尋參數變化時重新載入
  useEffect(() => {
    setLoading(false); // 立即取消 loading 狀態
    fetchPosts();
  }, [query]);

  // 設置 Pusher 即時更新功能（只執行一次）
  useEffect(() => {
    // 啟用 Pusher 即時更新功能
    try {
      const pusher = getPusherClient();
      if (pusher) {
        const channel = pusher.subscribe(CHANNEL);

        channel.bind(EVENTS.POST_NEW, fetchPosts);
        channel.bind(EVENTS.POST_UPDATE, fetchPosts);

        return () => {
          channel.unbind_all();
          pusher.unsubscribe(CHANNEL);
          pusher.disconnect();
        };
      } else {
        console.log('Pusher not configured, real-time updates disabled');
        // 如果Pusher沒有配置，不使用輪詢，避免無限重新載入
      }
    } catch (error) {
      console.warn('Pusher connection failed, real-time updates disabled:', error);
      // 如果Pusher連接失敗，不使用輪詢
    }
  }, []); // 空依賴數組，只執行一次

  return (
    <div className="space-y-3">
      {query && (
        <div className="text-sm text-muted">
          {posts.length > 0 
            ? `Found ${posts.length} post${posts.length === 1 ? '' : 's'} for "${query}"`
            : `No posts found for "${query}"`
          }
        </div>
      )}
      {posts.map((p: any) => <PostCard key={p.id} post={p} onDelete={handleDeletePost} onRepost={handleRepost} />)}
      {!posts.length && !query && <div className="card text-muted">No posts yet.</div>}
    </div>
  );
}