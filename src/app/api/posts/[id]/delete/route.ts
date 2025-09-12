import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const postId = params.id;

  try {
    // 獲取或創建用戶記錄
    const user = await getOrCreateUser(session);

    // 檢查post是否存在且屬於當前用戶
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 檢查是否為post的作者
    if (post.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 如果是repost貼文，需要刪除對應的repost記錄
    if (post.isRepost && post.originalPostId) {
      console.log('Deleting repost record for original post:', post.originalPostId, 'user:', user.id);
      const deletedReposts = await prisma.repost.deleteMany({
        where: {
          postId: post.originalPostId,
          userId: user.id
        }
      });
      console.log('Deleted repost records:', deletedReposts.count);
    }

    // 刪除post（會自動刪除相關的likes、reposts、comments）
    await prisma.post.delete({
      where: { id: postId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
