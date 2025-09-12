import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// 檢查Pusher配置是否完整
const isPusherConfigured = () => {
  return !!(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER
  );
};

export const pusherServer = isPusherConfigured() ? new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
}) : null;

export const getPusherClient = () => {
  if (!isPusherConfigured()) {
    return null;
  }
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY!;
  const cluster = process.env.PUSHER_CLUSTER!;
  const client = new PusherClient(key, { cluster });
  return client;
};

export const CHANNEL = 'mini-x-channel';
export const EVENTS = {
  POST_NEW: 'post:new',
  POST_UPDATE: 'post:update',
  COMMENT_NEW: 'comment:new',
} as const;