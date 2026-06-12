/**
 * Converte um texto em BRL ("R$ 26,70", "-R$ 4,98") para número (26.7, 4.98).
 * Ignora sinal e qualquer tipo de espaço usado pelo Intl.
 */
export function parseBRL(text: string): number {
  return Number(text.replace(/[^\d,]/g, '').replace(',', '.'));
}

/**
 * Gera o trecho numérico esperado de um valor em BRL ("26,70", "1.234,56"),
 * útil para asserções com toContainText sem depender do tipo de espaço do
 * Intl. Usa o mesmo locale da aplicação, inclusive separador de milhar.
 */
export function brlDigits(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
