import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProduct } from '../api';
import { useCart } from '../cart/CartContext';
import { formatBRL } from '../format';
import type { Product as ProductType } from '../types';

export default function Product() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [maxError, setMaxError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id).then((result) => {
      if (result) setProduct(result);
      else setNotFound(true);
    });
  }, [id]);

  if (notFound) {
    return (
      <p className="error" data-testid="product-not-found">
        Produto não encontrado.
      </p>
    );
  }
  if (!product) {
    return <p data-testid="product-loading">Carregando…</p>;
  }

  function changeQuantity(next: number) {
    if (!product) return;
    if (!Number.isFinite(next) || next < 1) {
      setQuantity(1);
      setMaxError('');
      return;
    }
    if (next > product.maxPerOrder) {
      setQuantity(product.maxPerOrder);
      setMaxError(`Quantidade máxima: ${product.maxPerOrder}`);
      return;
    }
    setQuantity(Math.floor(next));
    setMaxError('');
  }

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
  }

  return (
    <section className="product-detail">
      <img className="product-image" src={product.image} alt={product.name} />
      <div className="product-info">
        <p className="card-category">{product.category}</p>
        <h1 data-testid="product-name">{product.name}</h1>
        {product.requiresPrescription && (
          <>
            <span className="badge" data-testid="prescription-badge">
              Exige receita
            </span>
            <p className="hint" data-testid="prescription-note">
              Este medicamento exige receita médica. Você deverá anexar a receita no checkout.
            </p>
          </>
        )}
        <p className="card-price" data-testid="product-price">
          {formatBRL(product.price)}
        </p>
        <p className="hint" data-testid="max-per-order-info">
          Limite de {product.maxPerOrder} unidade(s) por pedido.
        </p>

        <div className="quantity-row">
          <button
            type="button"
            className="quantity-button"
            data-testid="quantity-decrease"
            aria-label="Diminuir quantidade"
            onClick={() => changeQuantity(quantity - 1)}
          >
            −
          </button>
          <input
            data-testid="quantity-input"
            className="quantity-input"
            type="number"
            min={1}
            max={product.maxPerOrder}
            value={quantity}
            onChange={(event) =>
              changeQuantity(event.target.value === '' ? NaN : Number(event.target.value))
            }
            aria-label="Quantidade"
          />
          <button
            type="button"
            className="quantity-button"
            data-testid="quantity-increase"
            aria-label="Aumentar quantidade"
            onClick={() => changeQuantity(quantity + 1)}
          >
            +
          </button>
        </div>
        {maxError && (
          <p className="error" data-testid="max-quantity-error">
            {maxError}
          </p>
        )}

        <button className="button" data-testid="add-to-cart-button" onClick={handleAddToCart}>
          Adicionar ao carrinho
        </button>
        {added && (
          <p className="success" data-testid="add-to-cart-feedback">
            Produto adicionado ao carrinho!
          </p>
        )}
      </div>
    </section>
  );
}
