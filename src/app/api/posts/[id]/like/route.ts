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
  
  const ex = await prisma.like.findFirst({ where: { postId, userId: user.id } });
  if (ex) {
    // 如果已經 like 過，則取消 like
    await prisma.like.delete({ where: { id: ex.id } });
    
    // 發送 Pusher 事件（如果配置正確）
    if (pusherServer) {
      try {
        await pusherServer.trigger(CHANNEL, EVENTS.POST_UPDATE, { postId });
      } catch (pusherError) {
        console.warn('Pusher error:', pusherError);
      }
    }
    
    return NextResponse.json({ liked: false });
  } else {
    // 如果沒有 like 過，則添加 like
    await prisma.like.create({ data: { postId, userId: user.id } });
    
    // 發送 Pusher 事件（如果配置正確）
    if (pusherServer) {
      try {
        await pusherServer.trigger(CHANNEL, EVENTS.POST_UPDATE, { postId });
      } catch (pusherError) {
        console.warn('Pusher error:', pusherError);
      }
    }
    
    return NextResponse.json({ liked: true });
  }
}
