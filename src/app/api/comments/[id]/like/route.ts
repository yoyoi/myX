import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getOrCreateUser } from '@/lib/user';
import { NextResponse } from 'next/server';

type Ctx = { params: { id: string } };

export async function POST(_: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const commentId = ctx.params.id;
  const user = await getOrCreateUser(session);
  
  const ex = await prisma.commentLike.findFirst({ where: { commentId, userId: user.id } });
  if (ex) {
    // 如果已經 like 過，則取消 like
    await prisma.commentLike.delete({ where: { id: ex.id } });
    return NextResponse.json({ liked: false });
  } else {
    // 如果沒有 like 過，則添加 like
    await prisma.commentLike.create({ data: { commentId, userId: user.id } });
    return NextResponse.json({ liked: true });
  }
}
