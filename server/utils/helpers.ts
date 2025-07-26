import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function calculateTotal(items: Array<{ amount: number }>): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}