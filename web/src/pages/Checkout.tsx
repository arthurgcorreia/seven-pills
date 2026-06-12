import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../api';
import { useCart } from '../cart/CartContext';
import { formatBRL } from '../format';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CEP_REGEX = /^\d{8}$/;

interface FieldErrors {
  name?: string;
  email?: string;
  cep?: string;
}

export default function Checkout() {
  const { items, subtotal, discountValue, total, appliedCoupon, requiresPrescription, clearCart } =
    useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', cep: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const prescriptionMissing = requiresPrescription && !prescriptionFile;

  function setField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!form.name.trim()) errors.name = 'Informe seu nome.';
    if (!EMAIL_REGEX.test(form.email)) errors.email = 'Informe um e-mail válido.';
    if (!CEP_REGEX.test(form.cep)) errors.cep = 'CEP deve ter 8 dígitos (somente números).';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;
    if (items.length === 0 || prescriptionMissing) return;

    setSubmitting(true);
    const { status, body } = await createOrder({
      items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      customer: form,
      coupon: appliedCoupon?.code ?? null,
      prescriptionAttached: Boolean(prescriptionFile),
    });
    setSubmitting(false);

    if (status === 201 && body?.orderId) {
      clearCart();
      navigate(`/confirmacao/${body.orderId}`, { state: body });
    } else {
      setServerError('Não foi possível concluir o pedido. Tente novamente.');
    }
  }

  if (items.length === 0) {
    return (
      <section>
        <h1>Checkout</h1>
        <p data-testid="checkout-empty">Seu carrinho está vazio. Adicione produtos antes de finalizar.</p>
        <Link className="button" data-testid="back-to-catalog" to="/">
          Voltar ao catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="checkout">
      <h1>Checkout</h1>

      <div className="summary" data-testid="checkout-summary">
        <h2>Resumo do pedido</h2>
        <ul>
          {items.map(({ product, quantity }) => (
            <li key={product.id} data-testid="checkout-summary-item">
              {quantity}x {product.name} — {formatBRL(product.price * quantity)}
            </li>
          ))}
        </ul>
        <p className="summary-line">
          Subtotal: <span>{formatBRL(subtotal)}</span>
        </p>
        {discountValue > 0 && (
          <p className="summary-line discount">
            Desconto ({appliedCoupon?.code}): <span>-{formatBRL(discountValue)}</span>
          </p>
        )}
        <p className="summary-line summary-total">
          Total: <span data-testid="checkout-total">{formatBRL(total)}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label className="field">
          Nome
          <input
            data-testid="checkout-name"
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder="Seu nome completo"
          />
        </label>
        {fieldErrors.name && (
          <p className="error" data-testid="field-error-name">
            {fieldErrors.name}
          </p>
        )}

        <label className="field">
          E-mail
          <input
            data-testid="checkout-email"
            type="email"
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
            placeholder="voce@exemplo.com"
          />
        </label>
        {fieldErrors.email && (
          <p className="error" data-testid="field-error-email">
            {fieldErrors.email}
          </p>
        )}

        <label className="field">
          CEP
          <input
            data-testid="checkout-cep"
            inputMode="numeric"
            maxLength={8}
            value={form.cep}
            onChange={(event) => setField('cep', event.target.value)}
            placeholder="Somente números (8 dígitos)"
          />
        </label>
        {fieldErrors.cep && (
          <p className="error" data-testid="field-error-cep">
            {fieldErrors.cep}
          </p>
        )}

        {requiresPrescription && (
          <div className="prescription-box">
            <label className="field">
              Receita médica (obrigatória para itens controlados)
              <input
                data-testid="prescription-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                onChange={(event) => setPrescriptionFile(event.target.files?.[0] ?? null)}
              />
            </label>
            {prescriptionMissing && (
              <p className="error" data-testid="prescription-error">
                Anexe a receita para os itens controlados
              </p>
            )}
          </div>
        )}

        {serverError && (
          <p className="error" data-testid="checkout-error">
            {serverError}
          </p>
        )}

        <button
          className="button button-primary"
          type="submit"
          data-testid="checkout-submit"
          disabled={submitting || prescriptionMissing}
        >
          {submitting ? 'Enviando…' : 'Finalizar pedido'}
        </button>
      </form>
    </section>
  );
}
