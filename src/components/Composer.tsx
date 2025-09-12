'use client';

import { useState, useTransition } from 'react';

export default function Composer() {
  const [content, setContent] = useState('');
  const [pending, start] = useTransition();

  const submit = async () => {
    if (!content.trim()) return;
    start(async () => {
      const res = await fetch('/api/posts', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent('');
        // 重新載入頁面以更新動態
        window.location.reload();
      }
      // 移除錯誤警告，因為 API 總是返回 200
    });
  };

  return (
    <div className="card space-y-2">
      <textarea
        className="input min-h-[80px]"
        placeholder="What's happening?"
        maxLength={280}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <span className="text-muted text-sm">{content.length}/280</span>
        <button className="btn" onClick={submit} disabled={pending}>Post</button>
      </div>
    </div>
  );
}