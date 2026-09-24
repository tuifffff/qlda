import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  Minus,
  Plus,
  Star,
  Shield,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Package,
  Check,
} from "lucide-react";
import { productApi } from "../../api/productApi.js";
import { useCartStore } from "../../stores/cartStore.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { phonePlaceholder, withImageFallback } from "../../utils/imageFallback.js";

/* ─── helpers ─── */
const resolveImg = (url) => {
  if (!url) return phonePlaceholder;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `/images/${url}`;
};

const POLICIES = [
  { icon: Shield, label: "Bảo hành chính hãng", sub: "12 tháng" },
  { icon: Truck, label: "Giao hàng miễn phí", sub: "Toàn quốc" },
  { icon: RotateCcw, label: "Đổi trả dễ dàng", sub: "Trong 30 ngày" },
  { icon: Zap, label: "Giao hỏa tốc", sub: "2–4 giờ nội thành" },
];

const SPEC_LABELS = {
  screenSize: "Màn hình",
  screenTech: "Công nghệ màn hình",
  rearCamera: "Camera sau",
  frontCamera: "Camera trước",
  chipset: "Chipset",
  ram: "RAM",
  rom: "Bộ nhớ trong",
  battery: "Pin",
  os: "Hệ điều hành",
  screenFeatures: "Tính năng màn hình",
};

export function ProductDetailPage() {
  const { id } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [selectedColour, setSelectedColour] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const galleryRef = useRef(null);

  /* fetch */
  useEffect(() => {
    let ok = true;
    setLoading(true);
    productApi
      .getById(id)
      .then((res) => {
        if (!ok) return;
        const p = res?.data ?? res;
        setProduct(p);
        const first = p.versions?.[0];
        if (first) {
          setSelectedVersionId(first.versionId);
          setSelectedColour(first.colour);
          setSelectedStorage(first.storage);
        }
      })
      .catch((e) => setError(e.message || "Không tải được sản phẩm"))
      .finally(() => ok && setLoading(false));
    return () => { ok = false; };
  }, [id]);

  /* derived */
  const colours = useMemo(() => {
    if (!product?.versions) return [];
    return [...new Set(product.versions.map((v) => v.colour))];
  }, [product]);

  const storagesForColour = useMemo(() => {
    if (!product?.versions || !selectedColour) return [];
    return [...new Set(
      product.versions.filter((v) => v.colour === selectedColour).map((v) => v.storage)
    )];
  }, [product, selectedColour]);

  const selectedVersion = useMemo(() => {
    if (!product?.versions) return null;
    return product.versions.find(
      (v) => v.colour === selectedColour && v.storage === selectedStorage
    ) || product.versions.find((v) => v.versionId === selectedVersionId);
  }, [product, selectedColour, selectedStorage, selectedVersionId]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const imgs = [product.image, ...(product.imageUrls || [])].filter(Boolean).map(resolveImg);
    // Prepend version image if different
    if (selectedVersion?.imageUrl) {
      const vi = resolveImg(selectedVersion.imageUrl);
      return [vi, ...imgs.filter((x) => x !== vi)];
    }
    return imgs;
  }, [product, selectedVersion]);

  /* actions */
  const handleColourSelect = (colour) => {
    setSelectedColour(colour);
    const storages = product.versions.filter((v) => v.colour === colour).map((v) => v.storage);
    const newStorage = storages.includes(selectedStorage) ? selectedStorage : storages[0];
    setSelectedStorage(newStorage);
    const v = product.versions.find((x) => x.colour === colour && x.storage === newStorage);
    if (v) setSelectedVersionId(v.versionId);
    setQuantity(1);
    setActiveImg(0);
  };

  const handleStorageSelect = (storage) => {
    setSelectedStorage(storage);
    const v = product.versions.find((x) => x.colour === selectedColour && x.storage === storage);
    if (v) setSelectedVersionId(v.versionId);
    setQuantity(1);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleAddToCart = () => {
    if (!product || !selectedVersion) return;
    addItem({
      productId: product.id,
      versionId: selectedVersion.versionId,
      name: product.name,
      image: selectedVersion.imageUrl || product.image,
      colour: selectedVersion.colour,
      storage: selectedVersion.storage,
      price: Number(selectedVersion.price),
      quantity,
      stock: selectedVersion.stock,
    });
    showToast("Đã thêm vào giỏ hàng!");
  };

  const prevImg = () => setActiveImg((i) => (i > 0 ? i - 1 : gallery.length - 1));
  const nextImg = () => setActiveImg((i) => (i < gallery.length - 1 ? i + 1 : 0));

  /* ─── loading / error ─── */
  if (loading) return (
    <div className="pd-skeleton">
      <div className="pd-skeleton-gallery" />
      <div className="pd-skeleton-info">
        {[1,2,3,4,5].map((i) => <div key={i} className="pd-skeleton-line" style={{ width: `${80 - i * 8}%` }} />)}
      </div>
    </div>
  );
  if (error || !product) return (
    <div className="pd-error">
      <Package size={48} />
      <p>{error || "Không tìm thấy sản phẩm"}</p>
      <Link to="/" className="pd-back-btn">← Quay lại trang chủ</Link>
    </div>
  );

  const inStock = (selectedVersion?.stock ?? 0) > 0;

  return (
    <>
      {/* TOAST */}
      {toast && (
        <div className={`pd-toast pd-toast--${toast.type}`}>
          <Check size={16} /> {toast.msg}
        </div>
      )}

      <div className="pd-page">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/">{product.brandName}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="pd-layout">
          {/* ════ GALLERY ════ */}
          <div className="pd-gallery">
            <div className="pd-main-img-wrap" ref={galleryRef}>
              <img
                className="pd-main-img"
                src={gallery[activeImg] || phonePlaceholder}
                alt={product.name}
                onError={withImageFallback}
              />
              {gallery.length > 1 && (
                <>
                  <button className="pd-gallery-arrow pd-gallery-arrow--prev" onClick={prevImg}><ChevronLeft size={20} /></button>
                  <button className="pd-gallery-arrow pd-gallery-arrow--next" onClick={nextImg}><ChevronRight size={20} /></button>
                </>
              )}
              {selectedVersion?.stock > 0 && selectedVersion.stock <= 10 && (
                <div className="pd-stock-badge">Chỉ còn {selectedVersion.stock} máy</div>
              )}
            </div>

            <div className="pd-thumbnails">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${i === activeImg ? "active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`Ảnh ${i + 1}`} onError={withImageFallback} />
                </button>
              ))}
            </div>
          </div>

          {/* ════ INFO ════ */}
          <div className="pd-info">
            <p className="pd-brand-tag">{product.brandName}</p>
            <h1 className="pd-name">{product.name}</h1>

            {/* Rating mock */}
            <div className="pd-rating-row">
              {[1,2,3,4,5].map((s) => <Star key={s} size={14} className={s <= 4 ? "star-filled" : "star-empty"} />)}
              <span className="pd-rating-text">4.8 (256 đánh giá)</span>
            </div>

            {/* Price */}
            <div className="pd-price-block">
              <span className="pd-price">{formatCurrency(selectedVersion?.price)}</span>
              {selectedVersion?.price && (
                <span className="pd-old-price">{formatCurrency(Math.round(Number(selectedVersion.price) * 1.05))}</span>
              )}
              <span className="pd-discount-badge">-5%</span>
            </div>

            {/* Colour */}
            <div className="pd-section">
              <p className="pd-section-label">Màu sắc: <strong>{selectedColour}</strong></p>
              <div className="pd-colour-list">
                {colours.map((c) => {
                  const versionForColour = product.versions.find((v) => v.colour === c);
                  const thumb = versionForColour?.imageUrl ? resolveImg(versionForColour.imageUrl) : null;
                  return (
                    <button
                      key={c}
                      className={`pd-colour-btn ${c === selectedColour ? "active" : ""}`}
                      onClick={() => handleColourSelect(c)}
                      title={c}
                    >
                      {thumb && <img src={thumb} alt={c} onError={withImageFallback} />}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Storage */}
            <div className="pd-section">
              <p className="pd-section-label">Dung lượng:</p>
              <div className="pd-storage-list">
                {storagesForColour.map((s) => {
                  const v = product.versions.find((x) => x.colour === selectedColour && x.storage === s);
                  return (
                    <button
                      key={s}
                      className={`pd-storage-btn ${s === selectedStorage ? "active" : ""}`}
                      onClick={() => handleStorageSelect(s)}
                    >
                      <span className="pd-storage-name">{s}</span>
                      {v && <span className="pd-storage-price">{formatCurrency(v.price)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="pd-section pd-qty-row">
              <p className="pd-section-label">Số lượng:</p>
              <div className="pd-qty-stepper">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}><Minus size={14} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(selectedVersion?.stock || 1, q + 1))}><Plus size={14} /></button>
              </div>
              <span className="pd-stock-text">
                {inStock ? `Còn ${selectedVersion?.stock} sản phẩm` : "Hết hàng"}
              </span>
            </div>

            {/* CTA */}
            <div className="pd-cta-row">
              <button
                className="pd-btn-cart"
                onClick={handleAddToCart}
                disabled={!selectedVersion || !inStock}
              >
                <ShoppingCart size={18} /> Thêm vào giỏ hàng
              </button>
              <button className="pd-btn-buy" disabled={!selectedVersion || !inStock}>
                Mua ngay
              </button>
            </div>

            {/* Policies */}
            <div className="pd-policies">
              {POLICIES.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="pd-policy-item">
                  <Icon size={20} className="pd-policy-icon" />
                  <div>
                    <p className="pd-policy-label">{label}</p>
                    <p className="pd-policy-sub">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════ TABS ════ */}
        <div className="pd-tabs-section">
          <div className="pd-tabs">
            {["info", "specs"].map((tab) => (
              <button
                key={tab}
                className={`pd-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "info" ? "Mô tả sản phẩm" : "Thông số kỹ thuật"}
              </button>
            ))}
          </div>

          <div className="pd-tab-content">
            {activeTab === "info" && (
              <div className="pd-description">
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === "specs" && product.specs && (
              <table className="pd-spec-table">
                <tbody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key}>
                      <td className="pd-spec-key">{SPEC_LABELS[key] || key}</td>
                      <td className="pd-spec-val">{value || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === "specs" && !product.specs && (
              <p className="pd-no-spec">Chưa có thông số kỹ thuật.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

