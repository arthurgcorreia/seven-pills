import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchOrder } from '../api';
import { formatBRL } from '../format';
import type { OrderResponse } from '../types';

export default function Confirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const initialOrder = (location.state as OrderResponse | null) ?? null;
  const [order, setOrder] = useState<OrderResponse | null>(initialOrder);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId)
      .then((result) => {
        if (result) setOrder(result);
        else if (!initialOrder) setNotFound(true);
      })
      .catch(() => undefined);
  }, [orderId]);

  if (notFound) {
    return (
      <section className="confirmation" data-testid="order-confirmation">
        <h1>Pedido não encontrado</h1>
        <p className="error" data-testid="order-not-found">
          Não encontramos esse pedido.
        </p>
        <Link className="button" data-testid="back-to-catalog" to="/">
          Voltar ao catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="confirmation" data-testid="order-confirmation">
      <h1>Pedido confirmado! 🎉</h1>
      <p>
        Número do pedido: <strong data-testid="order-number">{orderId}</strong>
      </p>
      {order && typeof order.total === 'number' && (
        <p>
          Total pago (simulado):{' '}
          <span data-testid="order-total">{formatBRL(order.total)}</span>
        </p>
      )}
      <p className="hint">Este pedido é simulado. Nenhum pagamento real foi processado.</p>
      <Link className="button" data-testid="back-to-catalog" to="/">
        Voltar ao catálogo
      </Link>
    </section>
  );
}
