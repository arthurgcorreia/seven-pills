import { useEffect, useState } from 'react';
import { fetchProducts } from '../api';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Não foi possível carregar os produtos. Verifique se a API está no ar.'));
  }, []);

  return (
    <section>
      <h1>Catálogo</h1>
      {error && (
        <p className="error" data-testid="catalog-error">
          {error}
        </p>
      )}
      <div className="grid" data-testid="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
