import { Link } from 'react-router-dom';
import { formatBRL } from '../format';
import type { Product } from '../types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card" data-testid="product-card">
      <img className="card-image" src={product.image} alt={product.name} loading="lazy" />
      <p className="card-category">{product.category}</p>
      <h2 className="card-name" data-testid="product-card-name">
        {product.name}
      </h2>
      {product.requiresPrescription && (
        <span className="badge" data-testid="prescription-badge">
          Exige receita
        </span>
      )}
      <p className="card-price" data-testid="product-card-price">
        {formatBRL(product.price)}
      </p>
      <Link className="button" data-testid="product-card-link" to={`/produto/${product.id}`}>
        Ver produto
      </Link>
    </article>
  );
}
