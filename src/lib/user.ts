import { prisma } from '@/lib/prisma';

export async function getOrCreateUser(session: any) {
  if (!session?.user?.email) {
    throw new Error('No user email found in session');
  }

  // 從 session 中獲取 OAuth 提供者資訊
  const provider = session.user.provider || 'unknown';
  const providerId = session.user.id || session.user.sub;

  // 使用 email + provider 組合來唯一識別用戶
  let user = await prisma.user.findFirst({
    where: { 
      email: session.user.email,
      provider: provider
    }
  });

  if (!user) {
    // 如果用戶不存在，創建新用戶
    user = await prisma.user.create({
      data: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        provider: provider,
        providerId: providerId,
      }
    });
  } else {
    // 如果用戶存在，更新用戶資訊（以防 OAuth 提供者變更）
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: session.user.name,
        image: session.user.image,
        providerId: providerId, // 更新 provider ID
      }
    });
  }

  // 將資料庫用戶ID設置到session中，以便前端使用
  session.user.dbId = user.id;

  return user;
}
