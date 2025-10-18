import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

export const ALL_CHAT_MODEL_IDS = ['chat-model', 'chat-model-2'];
export const MAX_MESSAGES_PER_DAY = 20;
export const FREE_GPT4O_MESSAGES_PER_5H = 40;
export const FREE_IMAGE_GENERATIONS_PER_DAY = 3;
export const PAID_GPT4O_MESSAGES_PER_3H = 80;
export const PAID_IMAGE_GENERATIONS_PER_DAY = 200;

export function isUnrestrictedUser(email: string | undefined | null): boolean {
  return email === 'opticalxhub@gmail.com';
}
