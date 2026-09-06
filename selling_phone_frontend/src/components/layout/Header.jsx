import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, Search, ShoppingCart, Smartphone, User, Phone, Truck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import { useCartStore } from '../../stores/cartStore.js';
import { authApi } from '../../api/authApi.js';

export function Header() {
  const navigate = useNavigate();
  const { accessToken, refreshToken, clearAuth } = useAuthStore();
  const cartCount = useCartStore((s) =>
    s.items.reduce((t, i) => t + i.quantity, 0),
  );

  const [searchParams] = useSearchParams();
  const [searchVal, setSearchVal] = useState('');

  // Đồng bộ ô search với URL param
  useEffect(() => {
    setSearchVal(searchParams.get('search') || '');
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout({ refreshToken });
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchVal.trim();
    navigate(q ? `/?search=${encodeURIComponent(q)}` : '/');
  };

  return (
    <header className="hd">
      {/* ── Top promotional bar ── */}
      <div className="hd-topbar">
        <div className="hd-wrap">
          <span className="hd-topbar-item">
            <Phone size={12} /> Hotline: <strong>1900 6868</strong>
          </span>
          <span className="hd-topbar-item">
            <Truck size={12} /> Miễn phí vận chuyển đơn từ 500.000đ
          </span>
        </div>
      </div>

      {/* ── Main header ── */}
      <div className="hd-main">
        <div className="hd-wrap">
          <Link to="/" className="hd-logo">
            <Smartphone size={28} />
            <span>Selling Phone</span>
          </Link>

          <form className="hd-search" onSubmit={handleSearch}>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Tìm kiếm iPhone, Samsung, Xiaomi..."
            />
            <button type="submit" aria-label="Tìm kiếm">
              <Search size={18} />
            </button>
          </form>

          <div className="hd-actions">
            <Link to="/cart" className="hd-act">
              <span className="hd-act-icon">
                <ShoppingCart size={22} />
                {cartCount > 0 && <span className="hd-badge">{cartCount}</span>}
              </span>
              <span className="hd-act-label">Giỏ hàng</span>
            </Link>

            {accessToken ? (
              <>
                <Link to="/profile" className="hd-act">
                  <span className="hd-act-icon"><User size={22} /></span>
                  <span className="hd-act-label">Tài khoản</span>
                </Link>
                <button className="hd-act" type="button" onClick={handleLogout}>
                  <span className="hd-act-icon"><LogOut size={22} /></span>
                  <span className="hd-act-label">Đăng xuất</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="hd-act">
                <span className="hd-act-icon"><User size={22} /></span>
                <span className="hd-act-label">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Navigation bar ── */}
      <nav className="hd-nav">
        <div className="hd-wrap">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/cart">Giỏ hàng</NavLink>
          {accessToken && <NavLink to="/profile">Tài khoản</NavLink>}
        </div>
      </nav>
    </header>
  );
}
