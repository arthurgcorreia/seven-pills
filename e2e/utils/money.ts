export function parseBRL(text: string): number {
  return Number(text.replace(/[^\d,]/g, '').replace(',', '.'));
}

export function brlDigits(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function applyDiscount(subtotal: number, discountPercent: number): number {
  return Math.round(subtotal * (1 - discountPercent / 100) * 100) / 100;
}
