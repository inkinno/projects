import type { Timestamp } from 'firebase/firestore';

export interface Service {
  id: string;
  name: string;
  emoji: string;
  order: number;
}

export interface TimelineEvent {
  id: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  content: string;
  category: string;
  highlight: boolean;
  reason: string;
  createdAt: Timestamp;
}
