import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { pusherServer, CHANNEL, EVENTS } from '@/lib/pusher';
import { getOrCreateUser } from '@/lib/user';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const take = Number(searchParams.get('take') || 20);
  const cursor = searchParams.get('cursor') || undefined;

  // 獲取當前用戶（如果已登入）
  const session = await auth();
  let currentUserId = null;
  if (session?.user) {
    try {
      const user = await getOrCreateUser(session);
      currentUserId = user.id;
    } catch (error) {
      console.error('Error getting user in GET /api/posts:', error);
    }
  }

  const posts = await prisma.post.findMany({
    where: q ? {
      OR: [
        { content: { contains: q } },
        { author: { name: { contains: q } } },
        { author: { email: { contains: q } } },
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      author: true,
      originalPost: {
        include: {
          author: true
        }
      },
      _count: { select: { likes: true, comments: true, reposts: true } },
      likes: currentUserId ? {
        where: { userId: currentUserId },
        select: { id: true }
      } : false,
      reposts: currentUserId ? {
        where: { userId: currentUserId },
        select: { id: true }
      } : false,
    },
  }) as any[];

  // 為每個貼文添加用戶的 like/repost 狀態
  const postsWithUserStatus = posts.map(post => ({
    ...post,
    userLiked: post.likes && post.likes.length > 0,
    userReposted: post.reposts && post.reposts.length > 0,
    likes: undefined, // 移除詳細的 likes 數組
    reposts: undefined, // 移除詳細的 reposts 數組
  }));

  const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;
  return NextResponse.json({ posts: postsWithUserStatus, nextCursor });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { content } = await req.json();
  if (!content || content.length > 280) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  }

  // 獲取或創建用戶記錄
  const user = await getOrCreateUser(session);

  const post = await prisma.post.create({
    data: { content, authorId: user.id },
    include: { author: true, _count: { select: { likes: true, comments: true, reposts: true } } },
  });

  // 發送 Pusher 事件（如果配置正確）
  if (pusherServer) {
    try {
      await pusherServer.trigger(CHANNEL, EVENTS.POST_NEW, post);
    } catch (pusherError) {
      console.warn('Pusher error:', pusherError);
      // 繼續執行，不因為Pusher錯誤而中斷
    }
  }
  
  return NextResponse.json({ post });
}
