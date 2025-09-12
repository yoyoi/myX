import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { pusherServer, CHANNEL, EVENTS } from '@/lib/pusher';
import { getOrCreateUser } from '@/lib/user';
import { NextRequest, NextResponse } from 'next/server';

type Ctx = { params: { id: string } };

export async function GET(_: NextRequest, ctx: Ctx) {
  const postId = ctx.params.id;
  console.log('GET /api/posts/[id]/comments called for postId:', postId);
  
  // 獲取當前用戶（如果已登入）
  const session = await auth();
  let currentUserId = null;
  if (session?.user) {
    try {
      const user = await getOrCreateUser(session);
      currentUserId = user.id;
    } catch (error) {
      console.error('Error getting user in GET /api/posts/[id]/comments:', error);
      // 如果獲取用戶失敗，繼續執行但不包含用戶狀態
    }
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: true,
      _count: { select: { likes: true } },
      likes: currentUserId ? {
        where: { userId: currentUserId },
        select: { id: true }
      } : false,
    },
  });

  console.log('Found comments:', comments.length);

  // 為每個回覆添加用戶的 like 狀態
  const commentsWithUserStatus = comments.map(comment => ({
    ...comment,
    userLiked: comment.likes && comment.likes.length > 0,
    likes: undefined, // 移除詳細的 likes 數組
  }));

  console.log('Returning comments:', commentsWithUserStatus.length);
  return NextResponse.json({ comments: commentsWithUserStatus });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  console.log('POST /api/posts/[id]/comments - Session:', session);
  console.log('POST /api/posts/[id]/comments - User:', session?.user);
  
  if (!session?.user) {
    console.log('POST /api/posts/[id]/comments - No session or user, returning 401');
    return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  }
  const { content } = await req.json();
  if (!content || content.length > 280) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  }
  const postId = ctx.params.id;
  const user = await getOrCreateUser(session);
  await prisma.comment.create({ data: { content, postId, authorId: user.id } });
  // 發送 Pusher 事件（如果配置正確）
  if (pusherServer) {
    try {
      await pusherServer.trigger(CHANNEL, EVENTS.COMMENT_NEW, { postId });
    } catch (pusherError) {
      console.warn('Pusher error:', pusherError);
      // 繼續執行，不因為Pusher錯誤而中斷
    }
  }
  
  return NextResponse.json({ ok: true });
}
