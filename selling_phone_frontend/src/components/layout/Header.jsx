import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, Search, ShoppingCart, Smartphone, User, Phone, Truck, Menu } from 'lucide-react';
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

          <div className="hd-category">
            <button className="hd-category-btn" type="button">
              <Menu size={20} />
              <span>Danh mục</span>
            </button>
            <div className="hd-category-dropdown">
              <div className="hd-cat-item-wrap">
                <Link to="/?brand=1" className="hd-cat-item">Điện thoại Apple</Link>
                <div className="hd-sub-menu">
                  <Link to="/?search=iPhone+15" className="hd-sub-item">iPhone 15 Series</Link>
                  <Link to="/?search=iPhone+14" className="hd-sub-item">iPhone 14 Series</Link>
                  <Link to="/?search=iPhone+13" className="hd-sub-item">iPhone 13 Series</Link>
                </div>
              </div>
              <div className="hd-cat-item-wrap">
                <Link to="/?brand=2" className="hd-cat-item">Điện thoại Samsung</Link>
                <div className="hd-sub-menu">
                  <Link to="/?search=Galaxy+S24" className="hd-sub-item">Galaxy S24 Series</Link>
                  <Link to="/?search=Galaxy+Z" className="hd-sub-item">Galaxy Z Fold / Z Flip</Link>
                  <Link to="/?search=Galaxy+A" className="hd-sub-item">Galaxy A Series</Link>
                </div>
              </div>
              <div className="hd-cat-item-wrap">
                <Link to="/?brand=3" className="hd-cat-item">Điện thoại Xiaomi</Link>
                <div className="hd-sub-menu">
                  <Link to="/?search=Xiaomi+14" className="hd-sub-item">Xiaomi 14 Series</Link>
                  <Link to="/?search=Redmi+Note" className="hd-sub-item">Redmi Note Series</Link>
                </div>
              </div>
              <div className="hd-cat-item-wrap">
                <Link to="/" className="hd-cat-item">Phụ kiện</Link>
              </div>
            </div>
          </div>

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
          {accessToken && <NavLink to="/profile">Tài khoản</NavLink>}
        </div>
      </nav>
    </header>
  );
}
