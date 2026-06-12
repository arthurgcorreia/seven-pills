import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateCoupon } from '../api';
import { useCart } from '../cart/CartContext';
import { formatBRL } from '../format';

interface CouponFeedback {
  text: string;
  ok: boolean;
}

export default function Cart() {
  const {
    items,
    subtotal,
    discountValue,
    total,
    updateQuantity,
    removeItem,
    applyCoupon,
  } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<CouponFeedback | null>(null);

  async function handleApplyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponFeedback({ text: 'Informe um cupom.', ok: false });
      return;
    }
    try {
      const result = await validateCoupon(code);
      if (result.valid && result.code && result.discountPercent) {
        applyCoupon({ code: result.code, discountPercent: result.discountPercent });
        setCouponFeedback({
          text: `Cupom ${result.code} aplicado: ${result.discountPercent}% de desconto.`,
          ok: true,
        });
      } else {
        applyCoupon(null);
        setCouponFeedback({
          text: result.reason === 'EXPIRED' ? 'Cupom expirado.' : 'Cupom inválido.',
          ok: false,
        });
      }
    } catch {
      setCouponFeedback({ text: 'Erro ao validar o cupom. Tente novamente.', ok: false });
    }
  }

  if (items.length === 0) {
    return (
      <section>
        <h1>Carrinho</h1>
        <p data-testid="cart-empty">Seu carrinho está vazio.</p>
        <Link className="button" data-testid="back-to-catalog" to="/">
          Voltar ao catálogo
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Carrinho</h1>
      <ul className="cart-list">
        {items.map(({ product, quantity }) => (
          <li className="cart-item" data-testid="cart-item" key={product.id}>
            <img className="cart-item-image" src={product.image} alt={product.name} />
            <div className="cart-item-info">
              <p className="cart-item-name" data-testid="cart-item-name">
                {product.name}
              </p>
              <p className="hint" data-testid="cart-item-price">
                {formatBRL(product.price)} cada
              </p>
            </div>
            <input
              data-testid="cart-item-quantity"
              className="quantity-input"
              type="number"
              min={1}
              max={product.maxPerOrder}
              value={quantity}
              onChange={(event) => updateQuantity(product.id, Number(event.target.value))}
              aria-label={`Quantidade de ${product.name}`}
            />
            <p className="cart-item-total" data-testid="cart-item-total">
              {formatBRL(product.price * quantity)}
            </p>
            <button
              type="button"
              className="button button-danger"
              data-testid="cart-item-remove"
              onClick={() => removeItem(product.id)}
              aria-label={`Remover ${product.name}`}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <div className="summary">
        <div className="coupon-row">
          <input
            data-testid="coupon-input"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            placeholder="Cupom de desconto"
            aria-label="Cupom de desconto"
          />
          <button type="button" className="button" data-testid="coupon-apply" onClick={handleApplyCoupon}>
            Aplicar
          </button>
        </div>
        {couponFeedback && (
          <p className={couponFeedback.ok ? 'success' : 'error'} data-testid="coupon-message">
            {couponFeedback.text}
          </p>
        )}

        <p className="summary-line">
          Subtotal: <span data-testid="cart-subtotal">{formatBRL(subtotal)}</span>
        </p>
        {discountValue > 0 && (
          <p className="summary-line discount">
            Desconto: <span data-testid="cart-discount">-{formatBRL(discountValue)}</span>
          </p>
        )}
        <p className="summary-line summary-total">
          Total: <span data-testid="cart-total">{formatBRL(total)}</span>
        </p>

        <button
          type="button"
          className="button button-primary"
          data-testid="checkout-button"
          onClick={() => navigate('/checkout')}
        >
          Finalizar compra
        </button>
      </div>
    </section>
  );
}
