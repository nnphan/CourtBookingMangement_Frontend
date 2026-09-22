import { io, type Socket } from 'socket.io-client';
import { env } from '@/lib/env';
import { tokenStorage } from '@/lib/token-storage';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  socket ??= io(env.socketUrl, {
    autoConnect: false,
    transports: ['websocket'],
    auth: (cb) => cb({ token: tokenStorage.read()?.accessToken ?? '' }),
    reconnectionAttempts: 5,
    reconnectionDelay: 1_000,
  });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
