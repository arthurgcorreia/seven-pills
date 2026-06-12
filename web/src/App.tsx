import { Link, Route, Routes } from 'react-router-dom';
import { useCart } from './cart/CartContext';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';

function Header() {
  const { itemCount } = useCart();
  return (
    <header className="header">
      <Link to="/" data-testid="nav-home" className="logo">
        💊 Seven Pills
      </Link>
      <Link to="/carrinho" data-testid="cart-icon" className="cart-link" aria-label="Abrir carrinho">
        🛒
        <span data-testid="cart-count" className="cart-count">
          {itemCount}
        </span>
      </Link>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/produto/:id" element={<Product />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmacao/:orderId" element={<Confirmation />} />
        </Routes>
      </main>
      <footer className="footer">
        Projeto de portfólio QA/SDET — loja simulada, nenhum pagamento real é processado.
      </footer>
    </>
  );
}
