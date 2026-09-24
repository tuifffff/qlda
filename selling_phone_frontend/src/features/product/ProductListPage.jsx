import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Flame, Clock, BellRing, Calendar,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  X, SlidersHorizontal,
} from "lucide-react";
import { productApi } from "../../api/productApi.js";
import { ProductCard } from "../../components/product/ProductCard.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { resolveProductImage, withImageFallback } from "../../utils/imageFallback.js";
import { Banner } from "../../components/layout/Banner.jsx";

/* ── static data ── */
const BRANDS = [
  { label: "Tất cả", brandId: null, logo: null },
  { label: "Apple", brandId: 1, logo: "https://res.cloudinary.com/iukp3opy/image/upload/v1788616886/Apple_logo_black.svg.webp" },
  { label: "Samsung", brandId: 2, logo: "https://res.cloudinary.com/iukp3opy/image/upload/v1788616891/Samsung_old_logo_before_year_2015.svg.webp" },
];

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "id" },
  { label: "Giá tăng dần", value: "price_asc" },
  { label: "Giá giảm dần", value: "price_desc" },
];

const PRICE_RANGES = [
  { label: "Tất cả mức giá", min: null, max: null },
  { label: "Dưới 5 triệu", min: 0, max: 5000000 },
  { label: "5 – 10 triệu", min: 5000000, max: 10000000 },
  { label: "10 – 20 triệu", min: 10000000, max: 20000000 },
  { label: "20 – 30 triệu", min: 20000000, max: 30000000 },
  { label: "Trên 30 triệu", min: 30000000, max: null },
];

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];

const UPCOMING = [
  {
    id: "up-1",
    name: "iPhone 18 Pro Max",
    brand: "Apple",
    releaseDate: "Tháng 9 / 2027",
    expectedPrice: "Từ 36.990.000đ",
    image: "https://res.cloudinary.com/iukp3opy/image/upload/v1788615024/iphone-17-pro-max_3.jpg",
    highlights: "Chip A20 Pro, kính cường lực thế hệ mới, pin 5000 mAh",
  },
  {
    id: "up-2",
    name: "Samsung Galaxy S27 Ultra",
    brand: "Samsung",
    releaseDate: "Tháng 1 / 2028",
    expectedPrice: "Từ 33.990.000đ",
    image: "https://res.cloudinary.com/iukp3opy/image/upload/v1788616002/samsung-galaxy-s26-1.webp",
    highlights: "Snapdragon 8 Gen 6, Galaxy AI 3.0, màn hình 200Hz",
  },
];

/* ── FilterSection (accordion) ── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="fs-section">
      <button className="fs-toggle" onClick={() => setOpen((v) => !v)}>
        <span>{title}</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className="fs-body">{children}</div>}
    </div>
  );
}

export function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, first: true, last: true });
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(PRICE_RANGES[0]);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscribedIds, setSubscribedIds] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 25, seconds: 40 });
  const [mobileSidebar, setMobileSidebar] = useState(false);

  /* countdown */
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((p) => {
        if (p.seconds > 0) return { ...p, seconds: p.seconds - 1 };
        if (p.minutes > 0) return { ...p, minutes: p.minutes - 1, seconds: 59 };
        if (p.hours > 0) return { hours: p.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  /* URL search sync */
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setKeyword(urlSearch);
    setQuery(urlSearch);
    if (urlSearch) setSelectedBrand(null);
  }, [searchParams]);

  /* load products */
  const loadProducts = async (page = 0) => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (query) {
        res = await productApi.search({ keyword: query, page });
      } else if (selectedBrand) {
        res = await productApi.getByBrand({ brandId: selectedBrand, page });
      } else {
        res = await productApi.getAll({ page, sortBy });
      }
      const d = res?.data ?? res;
      let content = d.content || [];
      // client price filter
      if (selectedPrice.min !== null || selectedPrice.max !== null) {
        content = content.filter((p) => {
          const price = p.minPrice || 0;
          if (selectedPrice.min !== null && price < selectedPrice.min) return false;
          if (selectedPrice.max !== null && price > selectedPrice.max) return false;
          return true;
        });
      }
      setProducts(content);
      setPageInfo({ number: d.number || 0, totalPages: d.totalPages || 0, first: Boolean(d.first), last: Boolean(d.last) });
    } catch (err) {
      setError(err.message || "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(0); }, [query, sortBy, selectedBrand, selectedPrice]);

  const handleClearFilters = () => {
    setSearchParams({});
    setQuery(""); setKeyword("");
    setSelectedBrand(null);
    setSortBy("id");
    setSelectedPrice(PRICE_RANGES[0]);
    setSelectedStorage(null);
  };

  const flashSaleProducts = useMemo(() => products.slice(0, 4), [products]);
  const hasFilters = query || selectedBrand || selectedPrice.min !== null || selectedStorage;

  const pageTitle = useMemo(() => {
    if (query) return `Kết quả cho "${query}"`;
    if (selectedBrand === 1) return "Sản phẩm Apple / iPhone";
    if (selectedBrand === 2) return "Sản phẩm Samsung";
    return "Tất cả sản phẩm";
  }, [query, selectedBrand]);

  /* ── Sidebar Filter ── */
  const Sidebar = () => (
    <aside className="plp-sidebar">
      <div className="plp-sidebar-header">
        <span className="plp-sidebar-title"><SlidersHorizontal size={16} /> Bộ lọc</span>
        {hasFilters && (
          <button className="plp-sidebar-clear" onClick={handleClearFilters}>
            <X size={13} /> Xoá tất cả
          </button>
        )}
      </div>

      {/* Brand */}
      <FilterSection title="Thương hiệu">
        <div className="fs-brand-list">
          {BRANDS.map((b) => (
            <button
              key={b.label}
              className={`fs-brand-item ${selectedBrand === b.brandId ? "active" : ""}`}
              onClick={() => { setSelectedBrand(b.brandId); setSearchParams({}); setQuery(""); setKeyword(""); }}
            >
              {b.logo
                ? <img src={b.logo} alt={b.label} className="fs-brand-logo" />
                : <span className="fs-brand-all">Tất cả</span>
              }
              {selectedBrand === b.brandId && <span className="fs-check">✓</span>}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Mức giá">
        <div className="fs-radio-list">
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="fs-radio-item">
              <input
                type="radio"
                name="price"
                checked={selectedPrice.label === r.label}
                onChange={() => setSelectedPrice(r)}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Storage */}
      <FilterSection title="Dung lượng">
        <div className="fs-chip-grid">
          {STORAGE_OPTIONS.map((s) => (
            <button
              key={s}
              className={`fs-chip ${selectedStorage === s ? "active" : ""}`}
              onClick={() => setSelectedStorage((prev) => (prev === s ? null : s))}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>
    </aside>
  );

  return (
    <div className="plp">
      {/* BANNER */}
      <Banner />

      <div className="plp-container">
        {/* Mobile filter toggle */}
        <div className="plp-mobile-filter-btn">
          <button onClick={() => setMobileSidebar(true)}>
            <SlidersHorizontal size={15} /> Bộ lọc
            {hasFilters && <span className="plp-filter-dot" />}
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebar && (
          <div className="plp-overlay" onClick={() => setMobileSidebar(false)}>
            <div className="plp-drawer" onClick={(e) => e.stopPropagation()}>
              <button className="plp-drawer-close" onClick={() => setMobileSidebar(false)}><X size={20} /></button>
              <Sidebar />
            </div>
          </div>
        )}

        <div className="plp-inner">
          {/* ── Sidebar (desktop) ── */}
          <Sidebar />

          {/* ── Main content ── */}
          <div className="plp-main">
            {/* ── FLASH SALE ── */}
            <section className="plp-card flash-sale-section">
              <div className="section-header flash-header">
                <div className="flash-title-wrap">
                  <div className="flash-badge"><Flame size={18} className="flame-icon" /><span>FLASH SALE</span></div>
                  <h2>Giờ Vàng Giá Sốc</h2>
                </div>
                <div className="countdown-box">
                  <Clock size={14} />
                  <span className="countdown-label">Kết thúc sau:</span>
                  <div className="timer-blocks">
                    <span className="timer-unit">{String(timeLeft.hours).padStart(2, "0")}</span>
                    <span className="timer-colon">:</span>
                    <span className="timer-unit">{String(timeLeft.minutes).padStart(2, "0")}</span>
                    <span className="timer-colon">:</span>
                    <span className="timer-unit">{String(timeLeft.seconds).padStart(2, "0")}</span>
                  </div>
                </div>
              </div>
              {flashSaleProducts.length > 0 ? (
                <div className="product-grid">
                  {flashSaleProducts.map((p, i) => (
                    <ProductCard key={`flash-${p.id}`} product={p} isFlashSale discountPercent={i % 2 === 0 ? 15 : 20} />
                  ))}
                </div>
              ) : (
                <div className="plp-placeholder">Đang tải Flash Sale…</div>
              )}
            </section>

            {/* ── PRODUCTS ── */}
            <section className="plp-card">
              {/* Toolbar */}
              <div className="plp-toolbar">
                <div>
                  <span className="section-eyebrow">Danh mục</span>
                  <h2 className="plp-toolbar-title">{pageTitle}</h2>
                </div>
                <div className="plp-toolbar-right">
                  <span className="sort-label">Sắp xếp:</span>
                  <div className="segmented-control">
                    {SORT_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        className={sortBy === o.value ? "active" : ""}
                        onClick={() => setSortBy(o.value)}
                        disabled={Boolean(query) || Boolean(selectedBrand)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {hasFilters && (
                    <button className="clear-filter-btn" onClick={handleClearFilters}><X size={13} /> Xóa lọc</button>
                  )}
                </div>
              </div>

              {/* Active filters tags */}
              {hasFilters && (
                <div className="plp-active-tags">
                  {selectedBrand && (
                    <span className="plp-tag">
                      {BRANDS.find((b) => b.brandId === selectedBrand)?.label}
                      <button onClick={() => setSelectedBrand(null)}><X size={11} /></button>
                    </span>
                  )}
                  {selectedPrice.min !== null && (
                    <span className="plp-tag">
                      {selectedPrice.label}
                      <button onClick={() => setSelectedPrice(PRICE_RANGES[0])}><X size={11} /></button>
                    </span>
                  )}
                  {selectedStorage && (
                    <span className="plp-tag">
                      {selectedStorage}
                      <button onClick={() => setSelectedStorage(null)}><X size={11} /></button>
                    </span>
                  )}
                </div>
              )}

              {error && <div className="form-message error">{error}</div>}
              {loading && <div className="plp-loading"><span className="plp-spinner" />Đang tải sản phẩm...</div>}
              {!loading && products.length === 0 && (
                <EmptyState title="Không tìm thấy sản phẩm" description="Thử bộ lọc hoặc từ khóa khác nhé." />
              )}
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {pageInfo.totalPages > 1 && (
                <div className="pagination">
                  <button disabled={pageInfo.first} onClick={() => loadProducts(pageInfo.number - 1)}>
                    <ChevronLeft size={16} /> Trước
                  </button>
                  <span className="page-indicator">Trang {pageInfo.number + 1} / {pageInfo.totalPages}</span>
                  <button disabled={pageInfo.last} onClick={() => loadProducts(pageInfo.number + 1)}>
                    Sau <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </section>

            {/* ── UPCOMING ── */}
            <section className="plp-card upcoming-section">
              <div className="section-header">
                <div>
                  <span className="section-eyebrow">Đón đầu công nghệ</span>
                  <h2>Sản Phẩm Sắp Ra Mắt</h2>
                </div>
                <p className="upcoming-subtitle">Đăng ký để nhận thông báo và ưu đãi khi mở bán</p>
              </div>
              <div className="upcoming-grid">
                {UPCOMING.map((item) => {
                  const sub = subscribedIds.includes(item.id);
                  return (
                    <div key={item.id} className="upcoming-card">
                      <div className="upcoming-badge"><Calendar size={12} /> {item.releaseDate}</div>
                      <div className="upcoming-img-wrap">
                        <img src={item.image} alt={item.name} onError={withImageFallback} />
                      </div>
                      <div className="upcoming-body">
                        <span className="upcoming-brand">{item.brand}</span>
                        <h3 className="upcoming-title">{item.name}</h3>
                        <p className="upcoming-price">{item.expectedPrice}</p>
                        <p className="upcoming-specs">{item.highlights}</p>
                        <button
                          className={`subscribe-btn ${sub ? "subscribed" : ""}`}
                          onClick={() => setSubscribedIds((ids) => sub ? ids.filter((x) => x !== item.id) : [...ids, item.id])}
                        >
                          {sub ? <><BellRing size={15} /> Đã đăng ký nhận tin</> : "Nhận thông báo khi có hàng"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
