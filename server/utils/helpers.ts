import { randomBytes } from 'crypto';

export function generateId(): string {
  return randomBytes(16).toString('hex');
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function calculateTotal(items: Array<{ amount: number }>): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}