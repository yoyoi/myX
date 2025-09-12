import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { pusherServer, CHANNEL, EVENTS } from '@/lib/pusher';
import { getOrCreateUser } from '@/lib/user';
import { NextResponse } from 'next/server';

type Ctx = { params: { id: string } };

export async function POST(_: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const postId = ctx.params.id;
  const user = await getOrCreateUser(session);
  
  // 檢查是否已經 repost 過
  const existingRepost = await prisma.repost.findFirst({ 
    where: { postId, userId: user.id } 
  });
  
  console.log('Checking existing repost for post:', postId, 'user:', user.id, 'found:', !!existingRepost);
  
  if (existingRepost) {
    // 如果已經 repost 過，不允許取消，只能通過刪除repost貼文來取消
    return NextResponse.json({ error: 'Already reposted. Delete the repost post to undo.' }, { status: 400 });
  }
  
  // 獲取原始貼文資訊
  const originalPost = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true }
  }) as any;
  
  if (!originalPost) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  
  // 檢查是否為自己的貼文
  if (originalPost.authorId === user.id) {
    return NextResponse.json({ error: 'Cannot repost your own post' }, { status: 400 });
  }
  
  // 檢查是否為repost貼文
  if (originalPost.isRepost) {
    return NextResponse.json({ error: 'Cannot repost a reposted post' }, { status: 400 });
  }
  
  // 創建 repost 記錄
  await prisma.repost.create({ 
    data: { postId, userId: user.id } 
  });
  
  // 創建 repost 貼文，顯示原始作者信息和發文時間
  const originalPostTime = new Date(originalPost.createdAt).toLocaleString();
  const repostPost = await prisma.post.create({
    data: {
      content: `🔄 Reposted from @${originalPost.author.name}`,
      authorId: user.id,
      isRepost: true,
      originalPostId: postId
    } as any,
    include: {
      author: true,
      originalPost: {
        include: {
          author: true
        }
      },
      _count: { select: { likes: true, comments: true, reposts: true } }
    } as any
  });
  
  // 發送 Pusher 事件（如果配置正確）
  if (pusherServer) {
    try {
      await pusherServer.trigger(CHANNEL, EVENTS.POST_NEW, repostPost);
      await pusherServer.trigger(CHANNEL, EVENTS.POST_UPDATE, { postId });
    } catch (pusherError) {
      console.warn('Pusher error:', pusherError);
      // 繼續執行，不因為Pusher錯誤而中斷
    }
  }
  
  return NextResponse.json({ reposted: true, repostPost });
}
