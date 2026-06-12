import { Link, useLocation, useParams } from 'react-router-dom';
import { formatBRL } from '../format';
import type { OrderResponse } from '../types';

export default function Confirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const order = (location.state as OrderResponse | null) ?? null;

  return (
    <section className="confirmation" data-testid="order-confirmation">
      <h1>Pedido confirmado! 🎉</h1>
      <p>
        Número do pedido:{' '}
        <strong data-testid="order-number">{orderId}</strong>
      </p>
      {order && typeof order.total === 'number' && (
        <p>
          Total pago (simulado):{' '}
          <span data-testid="order-total">{formatBRL(order.total)}</span>
        </p>
      )}
      <p className="hint">Este pedido é simulado — nenhum pagamento real foi processado.</p>
      <Link className="button" data-testid="back-to-catalog" to="/">
        Voltar ao catálogo
      </Link>
    </section>
  );
}
