import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { useCartStore } from '../../stores/cartStore.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { phonePlaceholder, withImageFallback } from '../../utils/imageFallback.js';

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <section className="page-section narrow">
        <EmptyState title="Giỏ hàng đang trống" description="Hãy chọn một phiên bản điện thoại để thêm vào giỏ." />
        <Link className="primary-link centered" to="/">
          Xem sản phẩm
        </Link>
      </section>
    );
  }

  return (
    <section className="page-section narrow">
      <div className="cart-header">
        <h1>Giỏ hàng</h1>
        <button className="secondary-button" type="button" onClick={clearCart}>
          Xóa tất cả
        </button>
      </div>
      <div className="cart-list">
        {items.map((item) => (
          <article className="cart-item" key={item.versionId}>
            <img src={item.image || phonePlaceholder} alt={item.name} onError={withImageFallback} />
            <div>
              <h2>{item.name}</h2>
              <p>
                {item.storage} / {item.colour}
              </p>
              <strong>{formatCurrency(item.price)}</strong>
            </div>
            <input
              type="number"
              min="1"
              max={item.stock}
              value={item.quantity}
              onChange={(event) => updateQuantity(item.versionId, Number(event.target.value))}
            />
            <button className="icon-button" type="button" onClick={() => removeItem(item.versionId)} title="Xóa">
              <Trash2 size={18} />
            </button>
          </article>
        ))}
      </div>
      <div className="cart-total">
        <span>Tạm tính</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </section>
  );
}
