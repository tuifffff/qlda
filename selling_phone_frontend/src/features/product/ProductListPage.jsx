import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flame, Clock, BellRing, Calendar } from 'lucide-react';
import { productApi } from '../../api/productApi.js';

import { ProductCard } from '../../components/product/ProductCard.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { resolveProductImage, withImageFallback } from '../../utils/imageFallback.js';
import { Banner } from '../../components/layout/Banner.jsx';

const sortOptions = [
  { label: 'Mới nhất', value: 'id' },
  { label: 'Giá tăng dần', value: 'price_asc' },
  { label: 'Giá giảm dần', value: 'price_desc' },
];

const categoryFilters = [
  { label: 'Tất cả', brandId: null },
  { label: 'Apple', brandId: 1 },
  { label: 'Samsung', brandId: 2 },
  { label: 'Xiaomi', brandId: 3 },
];

// Danh sách sản phẩm sắp ra mắt (Upcoming Products)
const upcomingProducts = [
  {
    id: 'up-1',
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    releaseDate: 'Tháng 9 / 2026',
    expectedPrice: 'Từ 34.990.000đ',
    image: 'ip15pm_main.jpg',
    highlights: 'Chip A18 Pro 3nm, Nút Camera Control, Màn hình 6.9" siêu mỏng',
  },
  {
    id: 'up-2',
    name: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    releaseDate: 'Tháng 1 / 2027',
    expectedPrice: 'Từ 31.990.000đ',
    image: 's24ultra_main.jpg',
    highlights: 'Snapdragon 8 Gen 4, Galaxy AI thế hệ 2.0, Thiết kế bo tròn mới',
  },
  {
    id: 'up-3',
    name: 'Xiaomi 15 Ultra',
    brand: 'Xiaomi',
    releaseDate: 'Tháng 2 / 2027',
    expectedPrice: 'Từ 24.990.000đ',
    image: 'xiaomi15_upcoming.jpg',
    highlights: 'Ống kính Leica 1-inch, Sạc nhanh 120W, Màn hình 2K AMOLED',
  },
];

export function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, first: true, last: true });
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscribedIds, setSubscribedIds] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Countdown timer cho Flash Sale (Giờ : Phút : Giây)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 25, seconds: 40 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Đọc search từ URL (khi tìm kiếm từ Header)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setKeyword(urlSearch);
    setQuery(urlSearch);
    if (urlSearch) setSelectedBrand(null);
  }, [searchParams]);

  const pageTitle = useMemo(() => {
    if (query) return `Kết quả tìm kiếm cho "${query}"`;
    if (selectedBrand === 1) return 'Sản phẩm Apple / iPhone';
    if (selectedBrand === 2) return 'Sản phẩm Samsung';
    if (selectedBrand === 3) return 'Sản phẩm Xiaomi';
    return 'Sản phẩm nổi bật';
  }, [query, selectedBrand]);

  const loadProducts = async (page = 0) => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (query) {
        response = await productApi.search({ keyword: query, page });
      } else if (selectedBrand) {
        response = await productApi.getByBrand({ brandId: selectedBrand, page });
      } else {
        response = await productApi.getAll({ page, sortBy });
      }
      const data = response.data;
      setProducts(data.content || []);
      setPageInfo({
        number: data.number || 0,
        totalPages: data.totalPages || 0,
        first: Boolean(data.first),
        last: Boolean(data.last),
      });
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách sản phẩm từ máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(0);
  }, [query, sortBy, selectedBrand]);

  const handleClearFilters = () => {
    setSearchParams({});
    setQuery('');
    setKeyword('');
    setSelectedBrand(null);
    setSortBy('id');
  };

  const handleSubscribeUpcoming = (id) => {
    if (subscribedIds.includes(id)) {
      setSubscribedIds(subscribedIds.filter((item) => item !== id));
    } else {
      setSubscribedIds([...subscribedIds, id]);
    }
  };

  // Flash Sale products (lấy 4 sản phẩm đầu từ CSDL BE để làm Flash Sale)
  const flashSaleProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  return (
    <div className="product-list-page">
      {/* ── BANNER CAROUSEL ── */}
      <Banner />

      {/* ── MỤC 1: FLASH SALES ── */}
      <section className="section-container flash-sale-section">
        <div className="section-header flash-header">
          <div className="flash-title-wrap">
            <div className="flash-badge">
              <Flame size={20} className="flame-icon" />
              <span>FLASH SALE</span>
            </div>
            <h2>Giờ Vàng Giá Sốc</h2>
          </div>

          <div className="countdown-box">
            <Clock size={16} />
            <span className="countdown-label">Kết thúc sau:</span>
            <div className="timer-blocks">
              <span className="timer-unit">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="timer-colon">:</span>
              <span className="timer-unit">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="timer-colon">:</span>
              <span className="timer-unit">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {flashSaleProducts.length > 0 ? (
          <div className="product-grid">
            {flashSaleProducts.map((product, idx) => (
              <ProductCard
                key={`flash-${product.id}`}
                product={product}
                isFlashSale={true}
                discountPercent={idx % 2 === 0 ? 15 : 20}
              />
            ))}
          </div>
        ) : (
          <div className="loading-placeholder">Đang tải sản phẩm Flash Sale...</div>
        )}
      </section>

      {/* ── MỤC 2: SẢN PHẨM NỔI BẬT ── */}
      <section className="section-container featured-section">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Danh mục sản phẩm</span>
            <h2>{pageTitle}</h2>
          </div>

          {/* Filter Categories */}
          <div className="brand-tabs">
            {categoryFilters.map((cat) => (
              <button
                key={cat.label}
                type="button"
                className={`tab-btn ${selectedBrand === cat.brandId && !query ? 'active' : ''}`}
                onClick={() => {
                  setSearchParams({});
                  setQuery('');
                  setKeyword('');
                  setSelectedBrand(cat.brandId);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: Sort & Clear Filters */}
        <div className="catalog-toolbar">
          <div className="sort-group">
            <span className="sort-label">Sắp xếp theo:</span>
            <div className="segmented-control">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={sortBy === option.value ? 'active' : ''}
                  type="button"
                  onClick={() => setSortBy(option.value)}
                  disabled={Boolean(query) || Boolean(selectedBrand)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {(query || selectedBrand) && (
            <button className="clear-filter-btn" type="button" onClick={handleClearFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>

        {error && <div className="form-message error">{error}</div>}
        {loading && <div className="loading">Đang tải sản phẩm từ hệ thống...</div>}
        {!loading && products.length === 0 && (
          <EmptyState title="Không tìm thấy sản phẩm" description="Vui lòng thử từ khóa tìm kiếm khác hoặc chọn thương hiệu khác." />
        )}

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {pageInfo.totalPages > 1 && (
          <div className="pagination">
            <button type="button" disabled={pageInfo.first} onClick={() => loadProducts(pageInfo.number - 1)}>
              &laquo; Trang trước
            </button>
            <span className="page-indicator">
              Trang {pageInfo.number + 1} / {pageInfo.totalPages}
            </span>
            <button type="button" disabled={pageInfo.last} onClick={() => loadProducts(pageInfo.number + 1)}>
              Trang sau &raquo;
            </button>
          </div>
        )}
      </section>

      {/* ── MỤC 3: SẢN PHẨM SẮP RA MẮT ── */}
      <section className="section-container upcoming-section">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Đón đầu công nghệ</span>
            <h2>Sản Phẩm Sắp Ra Mắt</h2>
          </div>
          <p className="upcoming-subtitle">Đăng ký ngay để nhận thông báo và phần quà ưu đãi khi mở bán chính thức</p>
        </div>

        <div className="upcoming-grid">
          {upcomingProducts.map((item) => {
            const isSubscribed = subscribedIds.includes(item.id);
            const imgSrc = resolveProductImage(item.image);

            return (
              <div key={item.id} className="upcoming-card">
                <div className="upcoming-badge">
                  <Calendar size={13} /> {item.releaseDate}
                </div>
                <div className="upcoming-img-wrap">
                  <img src={imgSrc} alt={item.name} onError={withImageFallback} />
                </div>
                <div className="upcoming-body">
                  <span className="upcoming-brand">{item.brand}</span>
                  <h3 className="upcoming-title">{item.name}</h3>
                  <p className="upcoming-price">{item.expectedPrice}</p>
                  <p className="upcoming-specs">{item.highlights}</p>

                  <button
                    type="button"
                    className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                    onClick={() => handleSubscribeUpcoming(item.id)}
                  >
                    {isSubscribed ? (
                      <>
                        <BellRing size={16} /> Đã đăng ký nhận tin
                      </>
                    ) : (
                      <>Nhận thông báo khi có hàng</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
