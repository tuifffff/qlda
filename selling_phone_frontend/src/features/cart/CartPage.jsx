import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ChevronRight, Minus, Plus, Tag, X, CreditCard, Truck, Shield } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { useCartStore } from "../../stores/cartStore.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { phonePlaceholder, withImageFallback } from "../../utils/imageFallback.js";

const POLICIES = [
  { icon: Shield, text: "Bảo hành chính hãng 12 tháng" },
  { icon: Truck, text: "Giao hàng miễn phí toàn quốc" },
  { icon: CreditCard, text: "Thanh toán an toàn & bảo mật" },
];

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.05) : 0;
  const shipping = subtotal > 5000000 ? 0 : 30000;
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === "SALE5") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponApplied(false);
      setCouponError("Mã giảm giá không hợp lệ.");
    }
  };

  /* empty */
  if (items.length === 0) {
    return (
      <div className="cart-empty-page">
        <ShoppingBag size={72} className="cart-empty-icon" />
        <h1>Giỏ hàng trống</h1>
        <p>Hãy chọn một sản phẩm để thêm vào giỏ hàng nhé!</p>
        <Link to="/" className="cart-shop-btn">Tiếp tục mua sắm <ChevronRight size={16} /></Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Breadcrumb */}
      <nav className="cart-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <span>Giỏ hàng</span>
      </nav>

      <div className="cart-layout">
        {/* ════ LEFT: Items ════ */}
        <div className="cart-items-col">
          <div className="cart-header-bar">
            <h1>Giỏ hàng của bạn <span className="cart-count">({items.length} sản phẩm)</span></h1>
            <button className="cart-clear-btn" onClick={clearCart}><Trash2 size={15} /> Xóa tất cả</button>
          </div>

          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-item-card" key={item.versionId}>
                {/* image */}
                <div className="ci-img-wrap">
                  <img
                    src={item.image || phonePlaceholder}
                    alt={item.name}
                    onError={withImageFallback}
                  />
                </div>

                {/* info */}
                <div className="ci-info">
                  <p className="ci-brand">{item.colour} • {item.storage}</p>
                  <Link to={`/products/${item.productId}`} className="ci-name">{item.name}</Link>
                  <p className="ci-variant">{item.storage} / {item.colour}</p>
                </div>

                {/* qty + price */}
                <div className="ci-right">
                  <div className="ci-qty-stepper">
                    <button onClick={() => updateQuantity(item.versionId, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.versionId, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                      <Plus size={13} />
                    </button>
                  </div>
                  <strong className="ci-price">{formatCurrency(item.price * item.quantity)}</strong>
                  <p className="ci-unit-price">{formatCurrency(item.price)} / cái</p>
                  <button className="ci-remove-btn" onClick={() => removeItem(item.versionId)} title="Xóa">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link to="/" className="cart-continue-link"><ChevronRight size={15} /> Tiếp tục mua sắm</Link>
        </div>

        {/* ════ RIGHT: Summary ════ */}
        <div className="cart-summary-col">
          <div className="cart-summary-card">
            <h2>Tóm tắt đơn hàng</h2>

            {/* Coupon */}
            <div className="cart-coupon">
              <p className="cart-coupon-label"><Tag size={14} /> Mã giảm giá</p>
              <div className="cart-coupon-row">
                <input
                  type="text"
                  placeholder='Thử "SALE5"'
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button onClick={handleApplyCoupon} disabled={!coupon}>Áp dụng</button>
              </div>
              {couponApplied && <p className="cart-coupon-ok">✓ Giảm 5% thành công!</p>}
              {couponError && <p className="cart-coupon-err">{couponError}</p>}
            </div>

            {/* Lines */}
            <div className="cart-summary-lines">
              <div className="cs-line">
                <span>Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {couponApplied && (
                <div className="cs-line cs-discount">
                  <span>Giảm giá (5%)</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="cs-line">
                <span>Phí vận chuyển</span>
                <span>{shipping === 0 ? <span className="cs-free">Miễn phí</span> : formatCurrency(shipping)}</span>
              </div>
              <div className="cs-line cs-total">
                <span>Tổng cộng</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            <button className="cart-checkout-btn">
              <CreditCard size={18} /> Tiến hành thanh toán
            </button>

            {/* Policies */}
            <div className="cart-policies">
              {POLICIES.map(({ icon: Icon, text }) => (
                <div key={text} className="cart-policy">
                  <Icon size={15} className="cart-policy-icon" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
