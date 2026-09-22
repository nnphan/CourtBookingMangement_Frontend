import { request } from '@/lib/axios';

export interface Court {
  id: string;
  clubId: string;
  name: string;
  surface: 'wood' | 'acrylic' | 'pvc';
  pricePerHour: number;
  isActive: boolean;
}

export const courtsApi = {
  list: (clubId: string) => request<Court[]>({ url: '/courts', method: 'GET', params: { clubId } }),
  detail: (id: string) => request<Court>({ url: `/courts/${id}`, method: 'GET' }),
};
