import Comments from './section';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

type Ctx = { params: { id: string } };

export default async function PostPage({ params }: Ctx) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { author: true, _count: { select: { likes: true, comments: true, reposts: true } } },
  });
  if (!post) return notFound();
  return <Comments post={post} />;
}
